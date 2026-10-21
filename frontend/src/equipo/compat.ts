// Adapter so the team's packs module (packs.js, written for the no-build web/) runs inside this app
// unchanged: same React, same translations, icons, badges and destination data as the rest of the site.
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { DESTINOS } from '../api/mock/destinos';
import { useI18n } from '../i18n';
import { fmtMes } from '../lib/fechas';
import { FlowerArt } from '../components/ui/FlowerArt';
import { Eyebrow, FasePill } from '../components/ui/Badges';
import { Icon } from '../components/ui/Icon';

export const a = { jsx, jsxs, Fragment };
export const ce = React;
export const tt = useI18n;
export const He = Icon;
export const Ku = FasePill;
export const Tl = Eyebrow;
export const jh = FlowerArt;
export const El = fmtMes;
export const Ot = DESTINOS;
export const oo = (id: string) => DESTINOS.find((d) => d.id === id);
