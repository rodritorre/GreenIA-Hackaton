import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import { useDatos } from '../state';
import { Icon } from './ui/Icon';

/** "Solicitar información" about the destination licence: the town's way in (the team's contact form). */
export function ContactoDestino() {
  const { t, lang } = useI18n();
  const { destinos } = useDatos();
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ nombre: '', entidad: '', email: '', telefono: '', destino: destinos[0]?.nombre ?? '', mensaje: '' });
  const [estado, setEstado] = useState<{ tipo: 'enviando' | 'ok' | 'error'; texto?: string } | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setEstado({ tipo: 'enviando' });
    try {
      await api.contactoDestino({ ...f, idioma: lang });
      setEstado({ tipo: 'ok' });
    } catch (err) {
      setEstado({ tipo: 'error', texto: (err as Error).message });
    }
  };

  if (!abierto) {
    return (
      <button type="button" className="btn btn--primary" onClick={() => setAbierto(true)}>
        {t('contact.open')}
        <Icon name="arrowRight" size={16} />
      </button>
    );
  }
  return (
    <form className="contacto" onSubmit={submit} aria-labelledby="contact-title">
      <p id="contact-title" className="plan__name">
        {t('contact.title')}
      </p>
      <p className="small muted">{t('contact.lead')}</p>
      <label className="field field--light">
        {t('contact.name')}
        <input required autoComplete="name" value={f.nombre} onChange={set('nombre')} />
      </label>
      <label className="field field--light">
        {t('contact.entity')}
        <input required value={f.entidad} onChange={set('entidad')} />
      </label>
      <label className="field field--light">
        {t('alerts.email')}
        <input required type="email" autoComplete="email" value={f.email} onChange={set('email')} />
      </label>
      <label className="field field--light">
        {t('contact.phone')}
        <input type="tel" autoComplete="tel" value={f.telefono} onChange={set('telefono')} />
      </label>
      <label className="field field--light">
        {t('contact.dest')}
        <select value={f.destino} onChange={set('destino')}>
          {destinos.map((d) => (
            <option key={d.id}>{d.nombre}</option>
          ))}
          <option value={t('contact.otherDest')}>{t('contact.otherDest')}</option>
        </select>
      </label>
      <label className="field field--light">
        {t('contact.message')}
        <textarea rows={3} value={f.mensaje} onChange={set('mensaje')} />
      </label>
      <label className="consent consent--light">
        <input type="checkbox" required />
        <span>
          {t('mail.consent')} <a href="privacidad.html" target="_blank" rel="noopener">{t('mail.privacy')}</a>
        </span>
      </label>
      <button type="submit" className="btn btn--primary" disabled={estado?.tipo === 'enviando'}>
        {estado?.tipo === 'enviando' ? t('mail.sending') : t('contact.submit')}
      </button>
      {estado && estado.tipo !== 'enviando' && (
        <p role="status" className={`notice ${estado.tipo === 'ok' ? 'notice--ok' : 'notice--bad'}`}>
          <Icon name={estado.tipo === 'ok' ? 'check' : 'warn'} size={18} />
          {estado.tipo === 'ok' ? t('contact.done') : estado.texto}
        </p>
      )}
    </form>
  );
}
