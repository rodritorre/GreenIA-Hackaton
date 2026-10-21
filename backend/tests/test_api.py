import io
from datetime import datetime, timedelta

from PIL import Image

from florece.config import get_settings

API = '/api/v1'


# ─── Public read side ────────────────────────────────────────────────────────
def test_salud(client):
    assert client.get(f'{API}/salud').json()['ok'] is True


def test_destinos_tienen_rangos_nunca_fechas_sueltas(client):
    ds = client.get(f'{API}/destinos').json()
    assert {d['id'] for d in ds} == {'tejera-negra', 'brihuega', 'jerte', 'alpujarra'}
    for d in ds:
        for v in d['ventanas']:
            assert v['desde'] <= v['hasta']
            assert v['confianza'] in ('alta', 'media', 'baja')
            assert v['tipoDato'] in ('observado', 'estimado', 'previsto')  # HON-2
            if v['tipoDato'] == 'previsto':
                assert v['desde'] < v['hasta'], 'a forecast must be a range (PRIN-1.1)'


def test_ficha_separa_capas(client):
    f = client.get(f'{API}/destinos/tejera-negra').json()
    assert set(f) == {'destino', 'calculado', 'editorial', 'comercial'}
    zonas = f['calculado']['zonas']
    assert len(zonas) == 7
    sin_dato = [z for z in zonas if z['indice'] is None]
    assert sin_dato and all(z['calidad'] == 'nubes' for z in sin_dato)  # HON-4
    assert f['editorial']['historia']
    assert f['comercial']['ofertas']


def test_ficha_404(client):
    assert client.get(f'{API}/destinos/no-existe').status_code == 404


def test_serie_no_interpola_huecos(client):
    s = client.get(f'{API}/destinos/tejera-negra/serie').json()
    nubes = [p for p in s['puntos'] if p['calidad'] == 'nubes']
    assert nubes and all(p['indice'] is None for p in nubes)
    assert s['prevision'] and all(p['p10'] <= p['p50'] <= p['p90'] for p in s['prevision'])


def test_mapa_hoy_y_futuro(client):
    hoy = client.get(f'{API}/mapa').json()
    assert hoy['esPrevision'] is False
    tejera = next(x for x in hoy['destinos'] if x['destinoId'] == 'tejera-negra')
    assert tejera['estado']['fase'] == 'inicio'  # organisers' index 0.26 on 14 Oct, below the 0.30 'avance' threshold
    julio = client.get(f'{API}/mapa', params={'fecha': '2027-07-05'}).json()
    assert julio['esPrevision'] is True
    brihuega = next(x for x in julio['destinos'] if x['destinoId'] == 'brihuega')
    assert brihuega['estado']['fase'] in ('avance', 'pleno')
    assert brihuega['estado']['tipoDato'] == 'previsto'


def test_estado_datos(client):
    e = client.get(f'{API}/estado-datos').json()
    assert e['hoy'] == '2026-10-20'
    assert {f['id'] for f in e['fuentes']} >= {'aemet', 'sentinel'}


def test_openapi_es_el_contrato(client):
    spec = client.get(f'{API}/openapi.json').json()
    assert '/api/v1/destinos/{destino_id}' in spec['paths']
    assert 'DestinoFicha' in spec['components']['schemas']


# ─── Alerts: double opt-in, one-click unsubscribe ────────────────────────────
def _ultimo_correo(admin, tipo):
    return next(c for c in admin.get(f'{API}/admin/correos').json() if c['tipo'] == tipo)


def test_alerta_doble_opt_in(client, admin):
    body = {'email': 'turista@example.com', 'destinoId': 'tejera-negra', 'fase': 'pleno', 'antelacionDias': 7, 'consentimiento': True}
    assert client.post(f'{API}/alertas', json={**body, 'consentimiento': False}).status_code == 422
    assert client.post(f'{API}/alertas', json=body).status_code == 202
    correo = _ultimo_correo(admin, 'confirmacion')
    assert correo['para'] == 'turista@example.com' and correo['estado'] == 'simulado'
    token = correo['cuerpo'].split('token=')[1].split()[0]
    assert 'Aviso confirmado' in client.get(f'{API}/alertas/confirmar', params={'token': token}).text
    # Pleno window (v0 model on the organisers' data) starts 26 Oct; 7 days' notice → due on 19 Oct
    assert admin.post(f'{API}/admin/alertas/despachar').json()['mensaje'].startswith('1 ')
    aviso = _ultimo_correo(admin, 'aviso')
    assert 'entre el 26 oct 2026 y el 8 nov 2026' in aviso['asunto']
    assert 'Confianza baja' in aviso['cuerpo'] and 'Darme de baja' in aviso['cuerpo']
    # sent once per season only
    assert admin.post(f'{API}/admin/alertas/despachar').json()['mensaje'].startswith('0 ')
    assert 'baja' in client.post(f'{API}/alertas/baja', params={'token': token}).text


# ─── Citizen photos ──────────────────────────────────────────────────────────
def _jpeg(lat=None, lon=None, horas=2.0, color=(120, 80, 40)):
    import random

    rnd = random.Random(hash(color))
    img = Image.new('RGB', (64, 48), color)
    for _ in range(300):  # texture, so each test image has its own perceptual hash
        img.putpixel((rnd.randrange(64), rnd.randrange(48)), (rnd.randrange(256), rnd.randrange(256), rnd.randrange(256)))
    exif = Image.Exif()
    cuando = datetime.now(get_settings().tz) - timedelta(hours=horas)
    exif[306] = cuando.strftime('%Y:%m:%d %H:%M:%S')
    if lat is not None:
        def dms(v):
            v = abs(v)
            d, mm = int(v), (v - int(v)) * 60
            return (float(d), float(int(mm)), round((mm - int(mm)) * 60, 4))
        exif[0x8825] = {1: 'N' if lat >= 0 else 'S', 2: dms(lat), 3: 'E' if lon >= 0 else 'W', 4: dms(lon)}
    buf = io.BytesIO()
    img.save(buf, 'JPEG', exif=exif)
    return buf.getvalue()


def _subir(client, contenido, ip='1.1.1.1'):
    return client.post(f'{API}/observaciones', files={'foto': ('f.jpg', contenido, 'image/jpeg')},
                       data={'destinoId': 'tejera-negra', 'fase': 'avance', 'consentimiento': 'true'},
                       headers={'x-forwarded-for': ip})


def test_foto_valida_lejana_duplicada(client, admin):
    ok = _subir(client, _jpeg(41.257, -3.399, color=(10, 200, 30))).json()
    assert ok['estado'] == 'valida', ok
    assert any(c['clave'] == 'ubicacion' and 'Zona 2' in c['detalle'] for c in ok['comprobaciones'])
    lejos = _subir(client, _jpeg(41.6, -3.1, color=(200, 10, 30))).json()
    assert (lejos['estado'], lejos['motivo']) == ('rechazada', 'lejos')
    dup = _subir(client, _jpeg(41.257, -3.399, color=(10, 200, 30))).json()
    assert dup['motivo'] == 'duplicada'
    sin_gps = _subir(client, _jpeg(color=(90, 90, 200))).json()
    assert sin_gps['estado'] == 'pendiente'
    # the stored copy has no metadata (CIT-7)
    img = Image.open(io.BytesIO(client.get(f'{API}/fotos/{ok["id"]}/imagen').content))
    assert not img.getexif()
    assert ok['id'] in {f['id'] for f in client.get(f'{API}/fotos').json()}
    # moderation
    r = admin.post(f'{API}/admin/fotos/{sin_gps["id"]}/moderar', json={'estado': 'valida'})
    assert r.json()['estado'] == 'valida' and r.json()['revisadaPor'] == 'admin@example.com'


def test_foto_limite_diario(client):
    for i in range(get_settings().photo_daily_limit):
        _subir(client, _jpeg(41.25, -3.40, color=(i * 20, 5, 5)), ip='9.9.9.9')
    assert _subir(client, _jpeg(41.25, -3.40, color=(250, 250, 5)), ip='9.9.9.9').status_code == 429


# ─── Auth and roles ──────────────────────────────────────────────────────────
def test_admin_requiere_sesion(client):
    assert client.get(f'{API}/admin/fuentes').status_code == 401
    assert client.post(f'{API}/auth/login', json={'email': 'admin@example.com', 'password': 'mala'}).status_code == 401


def test_roles(editor):
    assert editor.get(f'{API}/admin/fuentes').status_code == 200
    assert editor.get(f'{API}/admin/usuarios').status_code == 403
    assert editor.post(f'{API}/admin/previsiones/recalcular').status_code == 403


def test_csrf_origen_ajeno(admin):
    r = admin.post(f'{API}/admin/previsiones/recalcular', headers={'origin': 'https://malicioso.example'})
    assert r.status_code == 403


def test_logout(admin):
    assert admin.get(f'{API}/auth/yo').json()['rol'] == 'admin'
    admin.post(f'{API}/auth/logout')
    assert admin.get(f'{API}/auth/yo').status_code == 401


# ─── Admin: content, offers, destinations, import ────────────────────────────
def test_editorial_no_toca_prevision(editor, client):
    antes = client.get(f'{API}/destinos/brihuega/prevision').json()
    e = editor.get(f'{API}/admin/destinos/brihuega/editorial').json()
    e['historia'] = 'Texto nuevo'
    assert editor.put(f'{API}/admin/destinos/brihuega/editorial', json=e).status_code == 200
    assert client.get(f'{API}/destinos/brihuega').json()['editorial']['historia'] == 'Texto nuevo'
    assert client.get(f'{API}/destinos/brihuega/prevision').json() == antes  # MON-3 / PRIN-3.1


def test_oferta_patrocinada(editor, client):
    o = editor.post(f'{API}/admin/ofertas', json={'destinoId': 'jerte', 'tipo': 'actividad', 'nombre': 'Ruta en bici'}).json()
    editor.patch(f'{API}/admin/ofertas/{o["id"]}', json={'patrocinado': True})
    pub = client.get(f'{API}/ofertas', params={'destinoId': 'jerte'}).json()
    assert pub[0]['nombre'] == 'Ruta en bici' and pub[0]['patrocinado'] is True


def test_crear_destino_por_configuracion(admin, client):
    body = {
        'id': 'azahar-sevilla', 'nombre': 'Azahar de Sevilla', 'lugar': 'Sevilla', 'provincia': 'Sevilla', 'region': 'Andalucía',
        'especie': 'Naranjo amargo', 'fenomeno': 'Floración', 'tipo': 'floracion', 'lat': 37.389, 'lon': -5.984,
        'temporada': 'Primavera 2027', 'finTemporada': '2027-04-30',
        'umbrales': {'inicio': 0.15, 'avance': 0.4, 'pleno': 0.7, 'final': 0.5},
        'habituales': [{'fase': f, 'tipica': t, 'rangoMin': a, 'rangoMax': b} for f, t, a, b in
                       [('inicio', '03-10', '03-01', '03-20'), ('avance', '03-18', '03-08', '03-28'),
                        ('pleno', '03-25', '03-15', '04-05'), ('final', '04-10', '04-01', '04-20')]],
    }
    assert admin.post(f'{API}/admin/destinos', json=body).status_code == 201
    d = next(x for x in client.get(f'{API}/destinos').json() if x['id'] == 'azahar-sevilla')
    pleno = next(v for v in d['ventanas'] if v['fase'] == 'pleno')
    assert (pleno['desde'], pleno['hasta'], pleno['confianza']) == ('2027-03-15', '2027-04-05', 'baja')
    assert admin.post(f'{API}/admin/destinos', json=body).status_code == 409


def test_importar_prevision_csv(admin, client):
    csv = 'fase;desde;hasta;probabilidad\npleno;2027-07-01;2027-07-10;85\n'
    r = admin.post(f'{API}/admin/importar', data={'destinoId': 'brihuega', 'dataset': 'prevision'},
                   files={'archivo': ('prev.csv', csv.encode(), 'text/csv')})
    assert r.status_code == 200, r.text
    pleno = next(v for v in client.get(f'{API}/destinos/brihuega/prevision').json() if v['fase'] == 'pleno')
    assert (pleno['desde'], pleno['probabilidad'], pleno['confianza']) == ('2027-07-01', 0.85, 'alta')
    malo = admin.post(f'{API}/admin/importar', data={'destinoId': 'brihuega', 'dataset': 'prevision'},
                      files={'archivo': ('x.csv', b'a,b\n1,2\n', 'text/csv')})
    assert malo.status_code == 422


def test_prueba_de_aviso(editor):
    r = editor.post(f'{API}/admin/alertas/prueba', json={'destinoId': 'tejera-negra', 'fase': 'pleno'}).json()
    assert r['asunto'].startswith('[PRUEBA]') and r['para'] == 'editor@example.com'
