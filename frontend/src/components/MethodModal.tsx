import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import type { Confianza, TipoDato } from '../api';
import { ConfidenceBadge, DataTypeTag } from './ui/Badges';
import { Icon } from './ui/Icon';

/** "Cómo calculamos esto" (HON-5, TRA-1, ENT-7). */
export function MethodModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, list } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const tipos: TipoDato[] = ['observado', 'estimado', 'previsto', 'editorial'];
  const confs: Confianza[] = ['alta', 'media', 'baja'];

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="method-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal__inner">
        <div className="modal__head">
          <h2 id="method-title" className="h2">
            {t('method.title')}
          </h2>
          <button type="button" className="icon-btn" aria-label={t('method.close')} onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <p className="honesty">
          <Icon name="satellite" size={18} />
          {t('ficha.honesty')}
        </p>
        <h3 className="sub">{t('method.sourcesT')}</h3>
        <ul className="bullets">
          {list('method.sources').map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3 className="sub">{t('method.stepsT')}</h3>
        <ol className="steps">
          {list('method.steps').map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <h3 className="sub">{t('method.freqT')}</h3>
        <p className="prose">{t('method.freq')}</p>
        <h3 className="sub">{t('method.confT')}</h3>
        <div className="tag-row">
          {confs.map((c) => (
            <ConfidenceBadge key={c} confianza={c} />
          ))}
        </div>
        <ul className="bullets">
          {list('method.conf').map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h3 className="sub">{t('method.typesT')}</h3>
        <div className="tag-row">
          {tipos.map((x) => (
            <DataTypeTag key={x} tipo={x} />
          ))}
        </div>
        <h3 className="sub">{t('method.limitsT')}</h3>
        <ul className="bullets">
          {list('method.limits').map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
