import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { en } from './en';
import { es, type Dict } from './es';

export type Lang = 'es' | 'en';

const DICTS: Record<Lang, Dict> = { es, en };

type Vars = Record<string, string | number>;

function lookup(dict: Dict, key: string): unknown {
  return key.split('.').reduce<unknown>((node, k) => (node as Record<string, unknown> | undefined)?.[k], dict);
}

function interpolate(s: string, vars?: Vars) {
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : s;
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Vars) => string;
  list: (key: string) => string[];
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');
  const value = useMemo<I18n>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      setLang: (l) => {
        document.documentElement.lang = l;
        setLang(l);
      },
      t: (key, vars) => {
        const v = lookup(dict, key);
        return typeof v === 'string' ? interpolate(v, vars) : key;
      },
      list: (key) => {
        const v = lookup(dict, key);
        return Array.isArray(v) ? (v as string[]) : [];
      },
    };
  }, [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside I18nProvider');
  return v;
}
