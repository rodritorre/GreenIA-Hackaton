"""Turns the organisers' datasets (data/organizadores/*.csv) into src/api/mock/datosOrganizadores.ts.

The offline demo (npm run build:demo) reads that file, so every real number on the site can be traced
back to a CSV row. Run from frontend/:  python3 scripts/import_floral_data.py
Standard library only.
"""

import csv
import datetime as dt
import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "data" / "organizadores"
OUT = ROOT / "frontend" / "src" / "api" / "mock" / "datosOrganizadores.ts"

# Zone positions are still placeholders (the datasets carry zone ids, not geometries).
ZONE_POS = {
    "01": (41.262, -3.418), "02": (41.256, -3.398), "03": (41.249, -3.425), "04": (41.243, -3.389),
    "05": (41.237, -3.412), "06": (41.231, -3.396), "07": (41.226, -3.42),
}
# Phase thresholds on the organisers' colour index (range -0.19 to 0.39 this season).
# inicio = 0.20 reproduces the start date the organisers detected (4 Sep 2026).
UMBRALES_TN = {"inicio": 0.2, "avance": 0.3, "pleno": 0.4, "final": 0.3}
MIN_VALIDA = 0.5  # a zone counts as "with data" when at least half its pixels are cloud-free


def rows(name):
    with open(SRC / name, newline="") as f:
        return list(csv.DictReader(f))


def num(v):
    return None if v in ("", None) else float(v)


def mmdd(year, doy):
    return (dt.date(year, 1, 1) + dt.timedelta(days=round(doy) - 1)).strftime("%m-%d")


def fase_de(indice):
    if indice is None:
        return None
    for fase in ("pleno", "avance", "inicio"):
        if indice >= UMBRALES_TN[fase]:
            return fase
    return "fuera_temporada"


# ---- Tejera Negra -------------------------------------------------------------------------
avance = rows("otono_avance_tejera_negra.csv")
clima = {r["fecha"]: num(r["tmax"]) for r in rows("otono_clima_tejera_negra.csv")}
s2 = rows("s2_otono_tejera_negra.csv")

# Satellite passes where no zone had usable pixels: shown as gaps ("nubes"), never interpolated.
pasos = {}
for r in s2:
    pasos.setdefault(r["fecha"], []).append(float(r["frac_valida"] or 0))
nublados = sorted(f for f, fr in pasos.items() if max(fr) < MIN_VALIDA and f > avance[0]["fecha"])

serie = [
    {"fecha": r["fecha"], "indice": num(r["color"]), "calidad": "ok", "tMax": clima.get(r["fecha"])}
    for r in avance
] + [{"fecha": f, "indice": None, "calidad": "nubes", "tMax": clima.get(f)} for f in nublados]
serie.sort(key=lambda p: p["fecha"])

ultima = avance[-1]
fecha_ultima = ultima["fecha"]

# Per-zone values: the organisers give the median and the 25th to 75th percentile across zones.
# We spread the zones with data across that range, ordered by each zone's own satellite change
# (purple index vs its July baseline). Zones without usable pixels on that pass show "sin dato".
baseline = {}
for r in s2:
    if r["fecha"] < "2026-08-01" and r["purpura_med"] and float(r["frac_valida"]) >= MIN_VALIDA:
        baseline.setdefault(r["parcela"], []).append(float(r["purpura_med"]))
baseline = {k: statistics.median(v) for k, v in baseline.items()}
ese_dia = {}
for r in s2:
    if r["fecha"] == fecha_ultima and r["purpura_med"] and float(r["frac_valida"]) >= MIN_VALIDA:
        ese_dia[r["parcela"]] = float(r["purpura_med"]) - baseline[r["parcela"]]
orden = sorted(ese_dia, key=ese_dia.get)
p25, p75 = float(ultima["color_p25"]), float(ultima["color_p75"])
valor = {
    p: round(p25 + (p75 - p25) * (i / max(1, len(orden) - 1)), 3) for i, p in enumerate(orden)
}
zonas = []
for z, (lat, lon) in ZONE_POS.items():
    v = valor.get(f"tejera_negra_{z}")
    zonas.append({
        "id": f"z{int(z)}", "nombre": f"Zona {int(z)}", "lat": lat, "lon": lon, "indice": v,
        "calidad": "ok" if v is not None else "nubes", "fase": fase_de(v),
    })

hito = rows("otono_hitos.csv")[0]
ref = {r["hito"]: r for r in rows("referencia_fechas.csv") if r["hayedo"] == "tejera_negra"}
referencia = {
    fase: {"anios": int(ref[k]["anios"]), "tipica": mmdd(2026, float(ref[k]["doy_mediana"])),
           "rangoMin": mmdd(2026, float(ref[k]["doy_min"])), "rangoMax": mmdd(2026, float(ref[k]["doy_max"]))}
    for fase, k in (("inicio", "inicio"), ("avance", "avanzado"), ("pleno", "pleno"))
}

tejera = {
    "umbrales": UMBRALES_TN,
    "ultima": {"fecha": fecha_ultima, "indice": float(ultima["color"]), "p25": p25, "p75": p75,
               "zonasConDato": len(orden), "hojaPerdida": float(ultima["hoja_perdida"])},
    "rango": {"min": min(float(r["color"]) for r in avance), "max": max(float(r["color"]) for r in avance)},
    "hitoInicio": {"fecha": hito["fecha"], "confirmado": hito["confirmado"], "revisar": hito["revisar"] == "True"},
    "referencia": referencia,
}

# ---- Brihuega -----------------------------------------------------------------------------
pred = {r["hito"]: r for r in rows("prediccion_2027_brihuega.csv")}
temporada = rows("temporada_brihuega.csv")[0]
cosecha = [
    {"fecha": r["fecha"], "pctCortado": float(r["pct_cortado"]), "haCortadas": float(r["ha_cortadas"]),
     "haPlanta": float(r["ha_planta"])}
    for r in rows("avance_brihuega.csv")
]
brihuega = {
    "prediccion": {
        k: {"emitida": r["fecha_emision"], "central": r["central"], "probableDesde": r["probable_desde"],
            "probableHasta": r["probable_hasta"], "ampliaDesde": r["amplia_desde"], "ampliaHasta": r["amplia_hasta"],
            "anios": int(r["anios"]), "modelo": r["version_modelo"]}
        for k, r in pred.items()
    },
    "temporada2026": {"cosecha10": temporada["cosecha_10"], "cosecha50": temporada["cosecha_50"],
                      "cosechaFinal": temporada["cosecha_final"], "fracCortada": float(temporada["frac_cortada"])},
    "cosecha2026": cosecha,
    "haPlanta": max(c["haPlanta"] for c in cosecha),
}

OUT.write_text(
    "// GENERATED by scripts/import_floral_data.py from data/organizadores/*.csv. Do not edit by hand.\n"
    "// Organisers' datasets (Greenia, Hackathon EPS UFV 2026).\n"
    "import type { PuntoSerie, Zona } from './tipos';\n\n"
    f"export const TN_SERIE: PuntoSerie[] = {json.dumps(serie, ensure_ascii=False)};\n\n"
    f"export const TN_ZONAS: Zona[] = {json.dumps(zonas, ensure_ascii=False, indent=1)};\n\n"
    f"export const TEJERA_NEGRA = {json.dumps(tejera, ensure_ascii=False, indent=1)};\n\n"
    f"export const BRIHUEGA = {json.dumps(brihuega, ensure_ascii=False, indent=1)};\n"
)
print(f"wrote {OUT.relative_to(ROOT)}: {len(serie)} index points ({len(nublados)} cloudy passes), "
      f"{len(orden)}/7 zones with data on {fecha_ultima}, {len(cosecha)} Brihuega harvest points")
