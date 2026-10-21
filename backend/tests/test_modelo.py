from datetime import date, timedelta

from florece.services.fenologia import confianza_de_probabilidad, fase_por_indice
from florece.services.modelo import ajustar_logistica

UMBRALES = {'inicio': 0.2, 'avance': 0.45, 'pleno': 0.7, 'final': 0.6}


def test_fase_por_indice():
    assert fase_por_indice(None, UMBRALES) is None
    assert fase_por_indice(0.1, UMBRALES) == 'fuera_temporada'
    assert fase_por_indice(0.5, UMBRALES) == 'avance'
    assert fase_por_indice(0.75, UMBRALES) == 'pleno'
    assert fase_por_indice(0.5, UMBRALES, en_descenso=True) == 'final'


def test_confianza():
    assert [confianza_de_probabilidad(p) for p in (0.9, 0.8, 0.7)] == ['alta', 'media', 'baja']


def test_logistica_recupera_cruce():
    import math

    origen = date(2026, 9, 1)
    real_mid, k = 48, 6
    puntos = [(origen + timedelta(days=t), 0.08 + 0.85 / (1 + math.exp(-(t - real_mid) / k))) for t in range(0, 50, 2)]
    a = ajustar_logistica(puntos)
    assert a is not None and abs(a.mid - real_mid) < 2
    cruce = a.cruce(0.7)
    esperado = origen + timedelta(days=round(real_mid - k * math.log(0.85 / 0.62 - 1)))
    assert abs((cruce - esperado).days) <= 2


def test_logistica_necesita_datos():
    assert ajustar_logistica([(date(2026, 1, i), 0.3) for i in range(1, 4)]) is None
