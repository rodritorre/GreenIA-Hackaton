import { useState, type FormEvent } from 'react';
import { api, useApi } from '../api';
import { useI18n } from '../i18n';
import { fmtHora } from '../lib/fechas';
import { Cargando, useAccion } from './common';

/** Admin only: panel accounts (decision D-04: email + password, roles admin/editor). */
export function UsersSection() {
  const { t, lang } = useI18n();
  const usuarios = useApi(() => api.admin.usuarios(), []);
  const accion = useAccion();
  const [f, setF] = useState({ email: '', nombre: '', rol: 'editor' as 'admin' | 'editor', password: '' });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    accion.run(async () => {
      const u = await api.admin.crearUsuario(f);
      setF({ email: '', nombre: '', rol: 'editor', password: '' });
      usuarios.reload();
      return `${u.email} · ${u.rol}`;
    });
  };

  return (
    <>
      <div className="table-wrap">
        <Cargando carga={usuarios}>
          {(rows) => (
            <table className="sources">
              <thead>
                <tr>
                  <th scope="col">{t('alerts.email')}</th>
                  <th scope="col">{t('admin.name')}</th>
                  <th scope="col">{t('admin.role')}</th>
                  <th scope="col">{t('admin.lastLogin')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <th scope="row">{u.email}</th>
                    <td>{u.nombre}</td>
                    <td>{u.rol}</td>
                    <td>{u.ultimoAcceso ? fmtHora(u.ultimoAcceso, lang) : t('admin.never')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cargando>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <h3 className="sub">{t('admin.newUser')}</h3>
        <div className="admin-form__grid">
          <label className="field field--light">
            {t('alerts.email')}
            <input id="user-email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <label className="field field--light">
            {t('admin.name')}
            <input id="user-name" required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
          </label>
          <label className="field field--light">
            {t('admin.role')}
            <select id="user-role" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value as 'admin' | 'editor' })}>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="field field--light">
            {t('admin.password')}
            <input id="user-password" type="password" autoComplete="new-password" minLength={10} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          </label>
        </div>
        <button type="submit" className="btn btn--primary" disabled={accion.ocupado}>
          {t('admin.create')}
        </button>
        {accion.aviso}
      </form>
    </>
  );
}
