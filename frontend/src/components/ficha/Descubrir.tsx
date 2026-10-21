import { api, useApi } from '../../api';
import { useI18n } from '../../i18n';
import { fmtDia } from '../../lib/fechas';
import { Alternativas } from '../Aforo';
import { LayerHeading } from '../ui/Badges';

/** Nearby, lesser-known villages and the town's own agenda (editorial layer, written by the town). */
export function Descubrir({ destinoId }: { destinoId: string }) {
  const { t, lang } = useI18n();
  const alternativas = useApi(() => api.alternativas(destinoId), [destinoId]);
  const agenda = useApi(() => api.agenda(destinoId), [destinoId]);
  return (
    <div className="ficha-body ficha-body--editorial">
      {!!agenda.data?.length && (
        <section>
          <LayerHeading capa="editorial">
            <span className="small muted">{t('descubrir.agendaBy')}</span>
          </LayerHeading>
          <h4 className="sub">{t('descubrir.agenda')}</h4>
          <ul className="agenda">
            {agenda.data.map((e) => (
              <li key={`${e.fecha}-${e.titulo}`}>
                <span className="agenda__date">{fmtDia(e.fecha, lang)}</span>
                {e.titulo}
              </li>
            ))}
          </ul>
        </section>
      )}
      {!!alternativas.data?.length && (
        <section>
          <h4 className="sub">{t('descubrir.title')}</h4>
          <p className="small muted">{t('descubrir.lead')}</p>
          <Alternativas lista={alternativas.data} />
        </section>
      )}
    </div>
  );
}
