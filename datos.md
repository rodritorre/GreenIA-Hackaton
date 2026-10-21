{
  "metadata": {
    "proyecto": "Clon CuandoFlorece.es - Monitor Fenológico Satelital y Climático",
    "version": "2.0.0",
    "fecha_auditoria": "2026-10-21",
    "archivos_auditados": [
      "avance_brihuega.csv",
      "otono_avance_tejera_negra.csv",
      "otono_clima_tejera_negra.csv",
      "otono_hitos.csv",
      "prediccion_2027_brihuega.csv",
      "referencia_fechas.csv",
      "s2_brihuega.csv",
      "s2_otono_tejera_negra.csv",
      "temporada_brihuega.csv"
    ],
    "resumen_auditoria": {
      "especies_en_csv": ["lavandin", "lavanda_fina", "hayedo"],
      "ubicaciones_en_csv": ["Brihuega", "Tejera Negra", "Montejo"],
      "especies_solo_en_captura_ui": [
        "Almendro",
        "Amapola",
        "Arroz",
        "Azafrán",
        "Azahar",
        "Cerezo",
        "Girasol",
        "Melocotonero",
        "Piorno",
        "Tajinaste rojo"
      ]
    },
    "formulas_calculo_js": {
      "ndvi": "(B08 - B04) / (B08 + B04)",
      "indice_purpura": "(B04 + B02 - 2 * B03) / (B04 + B02 + 2 * B03)",
      "ari_antocianinas": "(1 / B03) - (1 / B05)",
      "color_otono_relativo": "mediana(((B04_t / B03_t) - (B04_ago / B03_ago)) / (B04_ago / B03_ago))",
      "probabilidad_gaussiana_asimetrica": "exp(-0.5 * Math.pow((doy - doy_central) / ((doy <= doy_central ? (doy_central - doy_p25) : (doy_p75 - doy_central)) / 0.6745), 2)) * 100"
    }
  },
  "catalogo_especies_ui": [
    {
      "id": "almendro",
      "nombre": "Almendro",
      "color_hex": "#e899b5",
      "tiene_datos_csv": false,
      "zonas_principales": ["Quinta de los Molinos (Madrid)", "Valle del Guadalhorce (Málaga)", "Alcalalí (Alicante)"],
      "fenologia_referencia": {
        "doy_central": 48,
        "fecha_central": "02-17",
        "probable_desde": "02-05",
        "probable_hasta": "02-28",
        "doy_probable": [36, 59],
        "amplia_desde": "01-25",
        "amplia_hasta": "03-12",
        "doy_amplia": [25, 71]
      }
    },
    {
      "id": "amapola",
      "nombre": "Amapola",
      "color_hex": "#d62839",
      "tiene_datos_csv": false,
      "zonas_principales": ["Polán y Montearagón (Toledo)", "Campiña de Guadalajara", "Llanos de Cáceres"],
      "fenologia_referencia": {
        "doy_central": 132,
        "fecha_central": "05-12",
        "probable_desde": "05-03",
        "probable_hasta": "05-22",
        "doy_probable": [123, 142],
        "amplia_desde": "04-22",
        "amplia_hasta": "06-05",
        "doy_amplia": [112, 156]
      }
    },
    {
      "id": "arroz",
      "nombre": "Arroz",
      "color_hex": "#3a86a8",
      "tiene_datos_csv": false,
      "zonas_principales": ["La Albufera (Valencia)", "Delta del Ebro (Tarragona)", "Marismas del Guadalquivir (Sevilla)"],
      "fenologia_referencia": {
        "doy_central": 222,
        "fecha_central": "08-10",
        "probable_desde": "07-28",
        "probable_hasta": "08-22",
        "doy_probable": [209, 234],
        "amplia_desde": "07-15",
        "amplia_hasta": "09-10",
        "doy_amplia": [196, 253]
      }
    },
    {
      "id": "azafran",
      "nombre": "Azafrán",
      "color_hex": "#8a5cf5",
      "tiene_datos_csv": false,
      "zonas_principales": ["Consuegra y Madridejos (Toledo)", "Mota del Cuervo (Cuenca)", "La Solana (Ciudad Real)"],
      "fenologia_referencia": {
        "doy_central": 298,
        "fecha_central": "10-25",
        "probable_desde": "10-18",
        "probable_hasta": "11-02",
        "doy_probable": [291, 306],
        "amplia_desde": "10-10",
        "amplia_hasta": "11-12",
        "doy_amplia": [283, 316]
      }
    },
    {
      "id": "azahar",
      "nombre": "Azahar",
      "color_hex": "#cbb36b",
      "tiene_datos_csv": false,
      "zonas_principales": ["Vega del Guadalquivir (Sevilla/Córdoba)", "Huerta de Valencia", "Vega del Segura (Murcia)"],
      "fenologia_referencia": {
        "doy_central": 100,
        "fecha_central": "04-10",
        "probable_desde": "04-01",
        "probable_hasta": "04-20",
        "doy_probable": [91, 110],
        "amplia_desde": "03-20",
        "amplia_hasta": "05-05",
        "doy_amplia": [79, 125]
      }
    },
    {
      "id": "cerezo",
      "nombre": "Cerezo",
      "color_hex": "#d95f76",
      "tiene_datos_csv": false,
      "zonas_principales": ["Valle del Jerte (Cáceres)", "Valle de las Caderechas (Burgos)", "Sierra Mágina (Jaén)"],
      "fenologia_referencia": {
        "doy_central": 89,
        "fecha_central": "03-30",
        "probable_desde": "03-22",
        "probable_hasta": "04-08",
        "doy_probable": [81, 98],
        "amplia_desde": "03-14",
        "amplia_hasta": "04-18",
        "doy_amplia": [73, 108]
      }
    },
    {
      "id": "girasol",
      "nombre": "Girasol",
      "color_hex": "#f5b700",
      "tiene_datos_csv": false,
      "zonas_principales": ["Carmona y La Campiña (Sevilla)", "Bureba (Burgos)", "La Alcarria (Cuenca/Guadalajara)"],
      "fenologia_referencia": {
        "doy_central": 176,
        "fecha_central": "06-25",
        "probable_desde": "06-12",
        "probable_hasta": "07-10",
        "doy_probable": [163, 191],
        "amplia_desde": "05-28",
        "amplia_hasta": "07-28",
        "doy_amplia": [148, 209]
      }
    },
    {
      "id": "lavanda",
      "nombre": "Lavanda",
      "color_hex": "#72429c",
      "tiene_datos_csv": true,
      "ref_campana": "brihuega_lavanda",
      "zonas_principales": ["Brihuega (Guadalajara)"],
      "subtipos_csv": ["lavandin", "lavanda_fina"],
      "fenologia_referencia": {
        "doy_central": 186,
        "fecha_central": "07-05",
        "probable_desde": "07-01",
        "probable_hasta": "07-08",
        "doy_probable": [182, 189],
        "amplia_desde": "06-25",
        "amplia_hasta": "07-16",
        "doy_amplia": [176, 197]
      }
    },
    {
      "id": "melocotonero",
      "nombre": "Melocotonero",
      "color_hex": "#f28467",
      "tiene_datos_csv": false,
      "zonas_principales": ["Aitona (Lleida)", "Cieza (Murcia)"],
      "fenologia_referencia": {
        "doy_central": 71,
        "fecha_central": "03-12",
        "probable_desde": "03-04",
        "probable_hasta": "03-20",
        "doy_probable": [63, 79],
        "amplia_desde": "02-22",
        "amplia_hasta": "03-28",
        "doy_amplia": [53, 87]
      }
    },
    {
      "id": "piorno",
      "nombre": "Piorno",
      "color_hex": "#daa01d",
      "tiene_datos_csv": false,
      "zonas_principales": ["Sierra de Gredos (Ávila)", "Sierra de Guadarrama (Madrid/Segovia)"],
      "fenologia_referencia": {
        "doy_central": 152,
        "fecha_central": "06-01",
        "probable_desde": "05-22",
        "probable_hasta": "06-12",
        "doy_probable": [142, 163],
        "amplia_desde": "05-12",
        "amplia_hasta": "06-25",
        "doy_amplia": [132, 176]
      }
    },
    {
      "id": "tajinaste_rojo",
      "nombre": "Tajinaste rojo",
      "color_hex": "#9b2235",
      "tiene_datos_csv": false,
      "zonas_principales": ["Parque Nacional del Teide (Tenerife)"],
      "fenologia_referencia": {
        "doy_central": 145,
        "fecha_central": "05-25",
        "probable_desde": "05-15",
        "probable_hasta": "06-05",
        "doy_probable": [135, 156],
        "amplia_desde": "05-05",
        "amplia_hasta": "06-18",
        "doy_amplia": [125, 169]
      }
    },
    {
      "id": "hayedo_otono",
      "nombre": "Hayedo (Otoñada)",
      "color_hex": "#c84b31",
      "tiene_datos_csv": true,
      "ref_campana": "hayedos_otono",
      "zonas_principales": ["Hayedo de Tejera Negra (Guadalajara)", "Hayedo de Montejo (Madrid)"],
      "subtipos_csv": ["hayedo"],
      "fenologia_referencia": {
        "doy_central": 292,
        "fecha_central": "10-19",
        "probable_desde": "10-14",
        "probable_hasta": "11-10",
        "doy_probable": [287, 314],
        "amplia_desde": "09-19",
        "amplia_hasta": "12-18",
        "doy_amplia": [262, 353]
      }
    }
  ],
  "estadisticas_descriptivas_csv": {
    "s2_brihuega_csv": {
      "filas_totales": 28294,
      "observaciones_con_datos": 15927,
      "observaciones_validas_frac_50": 15357,
      "parcelas_unicas": 329,
      "combinaciones_parcela_tesela": 658,
      "teselas": ["30TVL", "30TWL"],
      "fechas_unicas": 45,
      "rango_fechas": ["2026-05-04", "2026-09-29"],
      "superficie_unificada_ha": {
        "total": 658.78,
        "lavandin": { "parcelas": 297, "hectareas": 586.58, "observaciones_totales": 25542, "observaciones_validas": 13985 },
        "lavanda_fina": { "parcelas": 32, "hectareas": 72.20, "observaciones_totales": 2752, "observaciones_validas": 1372 }
      },
      "metricas_globales": {
        "n_pix": { "count": 28294, "mean": 200.2371, "std": 404.7078, "min": 0.0, "p25": 33.0, "median": 102.0, "p75": 220.0, "max": 4940.0 },
        "n_validos": { "count": 28294, "mean": 107.2866, "std": 285.0885, "min": 0.0, "p25": 0.0, "median": 15.0, "p75": 129.0, "max": 4940.0 },
        "frac_valida": { "count": 28294, "mean": 0.5422, "std": 0.4918, "min": 0.0, "p25": 0.0, "median": 1.0, "p75": 1.0, "max": 1.0 },
        "B02": { "count": 15927, "mean": 0.0769, "std": 0.0223, "min": 0.0001, "p25": 0.0625, "median": 0.0745, "p75": 0.0878, "max": 0.3171 },
        "B03": { "count": 15927, "mean": 0.1235, "std": 0.0276, "min": 0.0001, "p25": 0.1056, "median": 0.1206, "p75": 0.1388, "max": 0.3391 },
        "B04": { "count": 15927, "mean": 0.1774, "std": 0.0401, "min": 0.0001, "p25": 0.1514, "median": 0.1736, "p75": 0.1998, "max": 0.3892 },
        "B08": { "count": 15927, "mean": 0.3031, "std": 0.0527, "min": 0.0173, "p25": 0.2713, "median": 0.3045, "p75": 0.3362, "max": 0.5044 }
      },
      "metricas_por_tipo_validas": {
        "lavandin": {
          "B02": { "count": 13985, "mean": 0.0766, "std": 0.0218, "min": 0.0001, "p25": 0.0620, "median": 0.0744, "p75": 0.0878, "max": 0.2896 },
          "B03": { "count": 13985, "mean": 0.1235, "std": 0.0275, "min": 0.0001, "p25": 0.1050, "median": 0.1205, "p75": 0.1389, "max": 0.3242 },
          "B04": { "count": 13985, "mean": 0.1776, "std": 0.0402, "min": 0.0001, "p25": 0.1510, "median": 0.1729, "p75": 0.2001, "max": 0.3892 },
          "B08": { "count": 13985, "mean": 0.3031, "std": 0.0518, "min": 0.0173, "p25": 0.2702, "median": 0.3040, "p75": 0.3357, "max": 0.4871 },
          "ndvi": { "count": 13985, "mean": 0.2639, "std": 0.0775, "min": 0.0159, "p25": 0.2065, "median": 0.2560, "p75": 0.3089, "max": 0.9965 },
          "purpura": { "count": 13985, "mean": 0.0138, "std": 0.0279, "min": -0.1384, "p25": -0.0013, "median": 0.0148, "p75": 0.0296, "max": 0.9604 },
          "ebi": { "count": 13985, "mean": 0.2122, "std": 0.0592, "min": 0.0003, "p25": 0.1732, "median": 0.2064, "p75": 0.2426, "max": 0.8148 }
        },
        "lavanda_fina": {
          "B02": { "count": 1372, "mean": 0.0761, "std": 0.0158, "min": 0.0001, "p25": 0.0660, "median": 0.0742, "p75": 0.0845, "max": 0.1789 },
          "B03": { "count": 1372, "mean": 0.1219, "std": 0.0207, "min": 0.0001, "p25": 0.1093, "median": 0.1207, "p75": 0.1346, "max": 0.2167 },
          "B04": { "count": 1372, "mean": 0.1754, "std": 0.0320, "min": 0.0121, "p25": 0.1544, "median": 0.1776, "p75": 0.1965, "max": 0.2782 },
          "B08": { "count": 1372, "mean": 0.3071, "std": 0.0455, "min": 0.0249, "p25": 0.2844, "median": 0.3084, "p75": 0.3364, "max": 0.4234 },
          "ndvi": { "count": 1372, "mean": 0.2725, "std": 0.0917, "min": 0.1079, "p25": 0.2049, "median": 0.2403, "p75": 0.3275, "max": 0.5650 },
          "purpura": { "count": 1372, "mean": 0.0157, "std": 0.0336, "min": -0.0508, "p25": 0.0010, "median": 0.0179, "p75": 0.0304, "max": 0.9677 },
          "ebi": { "count": 1372, "mean": 0.2119, "std": 0.0435, "min": 0.0114, "p25": 0.1841, "median": 0.2067, "p75": 0.2342, "max": 0.5084 }
        }
      }
    },
    "avance_brihuega_csv": {
      "filas_totales": 32,
      "rango_fechas": ["2026-06-16", "2026-09-29"],
      "metricas": {
        "pct_cortado": { "count": 32, "mean": 0.3190, "std": 0.2684, "min": 0.0, "p25": 0.0030, "median": 0.3720, "p75": 0.6020, "max": 0.6030 },
        "pct_probable": { "count": 32, "mean": 0.0219, "std": 0.0388, "min": 0.0, "p25": 0.0, "median": 0.0025, "p75": 0.0312, "max": 0.1730 },
        "ha_cortadas": { "count": 32, "mean": 264.9384, "std": 222.9280, "min": 0.0, "p25": 2.5575, "median": 308.8150, "p75": 500.0600, "max": 500.0600 },
        "ha_planta": { "count": 32, "mean": 750.8987, "std": 245.6629, "min": 0.0, "p25": 830.5950, "median": 830.9050, "p75": 831.1400, "max": 831.6200 }
      }
    },
    "s2_otono_tejera_negra_csv": {
      "filas_totales": 336,
      "observaciones_con_datos": 231,
      "zonas_unicas": 7,
      "pixeles_por_zona": 64,
      "superficie_por_zona_ha": 0.64,
      "superficie_total_monitorizada_ha": 4.48,
      "rango_fechas": ["2026-07-16", "2026-10-17"],
      "metricas": {
        "frac_valida": { "count": 336, "mean": 0.6657, "std": 0.4668, "min": 0.0, "p25": 0.0, "median": 1.0, "p75": 1.0, "max": 1.0 },
        "B02": { "count": 231, "mean": 0.0221, "std": 0.0287, "min": 0.0001, "p25": 0.0085, "median": 0.0140, "p75": 0.0198, "max": 0.2952 },
        "B03": { "count": 231, "mean": 0.0447, "std": 0.0230, "min": 0.0024, "p25": 0.0345, "median": 0.0386, "p75": 0.0451, "max": 0.2415 },
        "B04": { "count": 231, "mean": 0.0337, "std": 0.0225, "min": 0.0001, "p25": 0.0207, "median": 0.0264, "p75": 0.0407, "max": 0.2063 },
        "B05": { "count": 231, "mean": 0.1014, "std": 0.0212, "min": 0.0169, "p25": 0.0904, "median": 0.0994, "p75": 0.1119, "max": 0.2102 },
        "B08": { "count": 231, "mean": 0.3464, "std": 0.0682, "min": 0.0890, "p25": 0.2997, "median": 0.3490, "p75": 0.3839, "max": 0.5301 },
        "B11": { "count": 231, "mean": 0.2073, "std": 0.0313, "min": 0.0504, "p25": 0.1928, "median": 0.2084, "p75": 0.2249, "max": 0.2692 },
        "purpura_med": { "count": 231, "mean": -0.2876, "std": 0.1415, "min": -0.5951, "p25": -0.4016, "median": -0.3028, "p75": -0.1511, "max": 0.0202 },
        "purpura_p90": { "count": 231, "mean": -0.2118, "std": 0.1211, "min": -0.4878, "p25": -0.3080, "median": -0.2205, "p75": -0.0924, "max": 0.0246 },
        "ari_med": { "count": 231, "mean": 37.1667, "std": 331.1665, "min": -0.6148, "p25": 13.1808, "median": 15.5972, "p75": 18.2610, "max": 5047.2110 },
        "ari_p90": { "count": 231, "mean": 58.0816, "std": 588.5264, "min": -0.3956, "p25": 15.3772, "median": 18.7862, "p75": 23.2163, "max": 8962.1040 },
        "ebi_med": { "count": 25, "mean": 0.0410, "std": 0.0286, "min": 0.0002, "p25": 0.0206, "median": 0.0311, "p75": 0.0648, "max": 0.1082 },
        "ebi_p90": { "count": 25, "mean": 0.0587, "std": 0.0436, "min": 0.0028, "p25": 0.0318, "median": 0.0417, "p75": 0.0791, "max": 0.1980 }
      }
    },
    "otono_avance_tejera_negra_csv": {
      "filas_totales": 30,
      "rango_fechas": ["2026-07-21", "2026-10-14"],
      "metricas": {
        "zonas": { "count": 30, "mean": 6.4000, "std": 1.1626, "min": 3.0, "p25": 6.2500, "median": 7.0, "p75": 7.0, "max": 7.0 },
        "color": { "count": 30, "mean": 0.1017, "std": 0.1687, "min": -0.1880, "p25": -0.0008, "median": 0.0540, "p75": 0.2512, "max": 0.3910 },
        "color_p25": { "count": 30, "mean": 0.0465, "std": 0.1501, "min": -0.2370, "p25": -0.0452, "median": 0.0190, "p75": 0.1885, "max": 0.2500 },
        "color_p75": { "count": 30, "mean": 0.1562, "std": 0.1783, "min": -0.1360, "p25": 0.0190, "median": 0.1305, "p75": 0.3215, "max": 0.5000 },
        "hoja_perdida": { "count": 30, "mean": 0.0869, "std": 0.1163, "min": -0.1000, "p25": -0.0045, "median": 0.0465, "p75": 0.1890, "max": 0.3030 }
      }
    },
    "otono_clima_tejera_negra_csv": {
      "filas_totales": 115,
      "dias_con_temperatura": 64,
      "dias_con_lluvia": 63,
      "rango_fechas": ["2026-06-26", "2026-10-18"],
      "metricas": {
        "tmax": { "count": 64, "mean": 20.5734, "std": 5.5182, "min": 6.0, "p25": 17.2250, "median": 20.7000, "p75": 24.9500, "max": 30.0 },
        "tmin": { "count": 64, "mean": 10.5625, "std": 3.7193, "min": 0.8, "p25": 8.6250, "median": 10.5000, "p75": 13.0500, "max": 17.8 },
        "lluvia": { "count": 63, "mean": 0.9286, "std": 2.6803, "min": 0.0, "p25": 0.0, "median": 0.0, "p75": 0.2000, "max": 14.8, "acumulado_total_mm": 58.5 }
      },
      "resumen_mensual": [
        { "mes": "2026-07", "dias_validos": 1, "tmax_mean": 27.50, "tmax_max": 27.5, "tmax_min": 27.5, "tmin_mean": 12.80, "tmin_min": 12.8, "lluvia_total_mm": 0.0, "lluvia_max_dia_mm": 0.0 },
        { "mes": "2026-08", "dias_validos": 15, "tmax_mean": 21.73, "tmax_max": 29.5, "tmax_min": 14.0, "tmin_mean": 11.99, "tmin_min": 6.1, "lluvia_total_mm": 3.4, "lluvia_max_dia_mm": 2.5 },
        { "mes": "2026-09", "dias_validos": 30, "tmax_mean": 23.31, "tmax_max": 30.0, "tmax_min": 14.4, "tmin_mean": 11.57, "tmin_min": 3.6, "lluvia_total_mm": 17.2, "lluvia_max_dia_mm": 14.8 },
        { "mes": "2026-10", "dias_validos": 18, "tmax_mean": 14.66, "tmax_max": 19.5, "tmax_min": 6.0, "tmin_mean": 7.57, "tmin_min": 0.8, "lluvia_total_mm": 37.9, "lluvia_max_dia_mm": 10.7 }
      ]
    }
  },
  "campanas_empiricas": {
    "brihuega_lavanda": {
      "temporada_2026": {
        "anio": 2026,
        "inicio_floracion_detectado": "2026-06-26",
        "plena_flor_lavandin": "2026-07-03",
        "plena_flor_lavanda_fina": "2026-07-11",
        "cosecha_10": "2026-07-21",
        "cosecha_50": "2026-08-11",
        "cosecha_final": "2026-08-11",
        "frac_cortada": 0.606,
        "cosecha_10_directo": "2026-07-23",
        "cosecha_50_directo": "2026-08-15",
        "frac_cortada_directo": 0.603,
        "ha_planta_max": 831.62,
        "ha_cortadas_max": 500.06
      },
      "prediccion_2027": [
        {
          "hito": "plena_flor",
          "fecha_emision": "2026-08-12",
          "central": "2027-07-05",
          "doy_central": 186,
          "probable_desde": "2027-07-01",
          "probable_hasta": "2027-07-08",
          "doy_probable": [182, 189],
          "amplia_desde": "2027-06-25",
          "amplia_hasta": "2027-07-16",
          "doy_amplia": [176, 197],
          "anios": 10,
          "version_modelo": "v0-climatologia"
        },
        {
          "hito": "cosecha_10",
          "fecha_emision": "2026-08-12",
          "central": "2027-07-29",
          "doy_central": 210,
          "probable_desde": "2027-07-25",
          "probable_hasta": "2027-08-01",
          "doy_probable": [206, 213],
          "amplia_desde": "2027-07-10",
          "amplia_hasta": "2027-08-08",
          "doy_amplia": [191, 220],
          "anios": 10,
          "version_modelo": "v0-climatologia"
        },
        {
          "hito": "cosecha_50",
          "fecha_emision": "2026-08-12",
          "central": "2027-08-15",
          "doy_central": 227,
          "probable_desde": "2027-08-12",
          "probable_hasta": "2027-08-19",
          "doy_probable": [224, 231],
          "amplia_desde": "2027-07-30",
          "amplia_hasta": "2027-09-10",
          "doy_amplia": [211, 253],
          "anios": 10,
          "version_modelo": "v0-climatologia"
        },
        {
          "hito": "cosecha_final",
          "fecha_emision": "2026-08-12",
          "central": "2027-08-20",
          "doy_central": 232,
          "probable_desde": "2027-08-16",
          "probable_hasta": "2027-08-24",
          "doy_probable": [228, 236],
          "amplia_desde": "2027-08-07",
          "amplia_hasta": "2027-09-12",
          "doy_amplia": [219, 255],
          "anios": 10,
          "version_modelo": "v0-climatologia"
        }
      ],
      "serie_pre_campana_2026": [
        { "fecha": "2026-05-04", "ndvi_lavandin": 0.2761, "ndvi_lavanda_fina": 0.2817, "purpura_lavandin": 0.0096, "purpura_lavanda_fina": 0.0120 },
        { "fecha": "2026-05-14", "ndvi_lavandin": 0.2516, "ndvi_lavanda_fina": 0.2589, "purpura_lavandin": 0.0038, "purpura_lavanda_fina": 0.0095 },
        { "fecha": "2026-05-22", "ndvi_lavandin": 0.2595, "ndvi_lavanda_fina": 0.2685, "purpura_lavandin": 0.0012, "purpura_lavanda_fina": -0.0019 },
        { "fecha": "2026-05-24", "ndvi_lavandin": 0.2655, "ndvi_lavanda_fina": 0.2463, "purpura_lavandin": -0.0017, "purpura_lavanda_fina": 0.0070 },
        { "fecha": "2026-05-27", "ndvi_lavandin": 0.2838, "ndvi_lavanda_fina": 0.2823, "purpura_lavandin": -0.0004, "purpura_lavanda_fina": 0.0067 },
        { "fecha": "2026-06-01", "ndvi_lavandin": 0.2816, "ndvi_lavanda_fina": 0.2956, "purpura_lavandin": -0.0064, "purpura_lavanda_fina": 0.0029 },
        { "fecha": "2026-06-03", "ndvi_lavandin": 0.2817, "ndvi_lavanda_fina": 0.3060, "purpura_lavandin": -0.0029, "purpura_lavanda_fina": 0.0025 },
        { "fecha": "2026-06-06", "ndvi_lavandin": 0.3010, "ndvi_lavanda_fina": 0.3287, "purpura_lavandin": 0.0030, "purpura_lavanda_fina": 0.0045 },
        { "fecha": "2026-06-11", "ndvi_lavandin": 0.2985, "ndvi_lavanda_fina": 0.3233, "purpura_lavandin": -0.0010, "purpura_lavanda_fina": 0.0059 },
        { "fecha": "2026-06-13", "ndvi_lavandin": 0.3002, "ndvi_lavanda_fina": 0.3712, "purpura_lavandin": -0.0011, "purpura_lavanda_fina": -0.0040 }
      ],
      "serie_avance_completa_2026": [
        { "fecha": "2026-06-16", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 0.00, "ndvi_lavandin": 0.3110, "ndvi_lavanda_fina": 0.3323, "purpura_lavandin": 0.0056, "purpura_lavanda_fina": 0.0112 },
        { "fecha": "2026-06-21", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 0.00, "ndvi_lavandin": 0.3072, "ndvi_lavanda_fina": 0.3440, "purpura_lavandin": 0.0002, "purpura_lavanda_fina": 0.0025 },
        { "fecha": "2026-06-23", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 0.00, "ndvi_lavandin": 0.3120, "ndvi_lavanda_fina": 0.3518, "purpura_lavandin": 0.0050, "purpura_lavanda_fina": 0.0153 },
        { "fecha": "2026-06-26", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 764.03, "ndvi_lavandin": 0.3096, "ndvi_lavanda_fina": 0.3432, "purpura_lavandin": 0.0199, "purpura_lavanda_fina": 0.0336 },
        { "fecha": "2026-07-01", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 831.62, "ndvi_lavandin": 0.3114, "ndvi_lavanda_fina": 0.3420, "purpura_lavandin": 0.0134, "purpura_lavanda_fina": 0.0227 },
        { "fecha": "2026-07-03", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 831.47, "ndvi_lavandin": 0.3134, "ndvi_lavanda_fina": 0.3519, "purpura_lavandin": 0.0131, "purpura_lavanda_fina": 0.0183 },
        { "fecha": "2026-07-06", "pct_cortado": 0.000, "pct_probable": 0.000, "ha_cortadas": 0.00, "ha_planta": 831.35, "ndvi_lavandin": 0.3043, "ndvi_lavanda_fina": 0.3514, "purpura_lavandin": 0.0196, "purpura_lavanda_fina": 0.0269 },
        { "fecha": "2026-07-11", "pct_cortado": 0.000, "pct_probable": 0.004, "ha_cortadas": 0.00, "ha_planta": 831.35, "ndvi_lavandin": 0.3127, "ndvi_lavanda_fina": 0.3829, "purpura_lavandin": 0.0137, "purpura_lavanda_fina": 0.0095 },
        { "fecha": "2026-07-13", "pct_cortado": 0.004, "pct_probable": 0.000, "ha_cortadas": 3.41, "ha_planta": 831.35, "ndvi_lavandin": 0.3048, "ndvi_lavanda_fina": 0.3242, "purpura_lavandin": 0.0138, "purpura_lavanda_fina": 0.0147 },
        { "fecha": "2026-07-16", "pct_cortado": 0.004, "pct_probable": 0.005, "ha_cortadas": 3.41, "ha_planta": 831.35, "ndvi_lavandin": 0.2955, "ndvi_lavanda_fina": 0.3121, "purpura_lavandin": 0.0174, "purpura_lavanda_fina": 0.0163 },
        { "fecha": "2026-07-21", "pct_cortado": 0.020, "pct_probable": 0.103, "ha_cortadas": 16.23, "ha_planta": 831.14, "ndvi_lavandin": 0.2607, "ndvi_lavanda_fina": 0.3074, "purpura_lavandin": 0.0095, "purpura_lavanda_fina": 0.0039 },
        { "fecha": "2026-07-23", "pct_cortado": 0.118, "pct_probable": 0.011, "ha_cortadas": 98.04, "ha_planta": 831.14, "ndvi_lavandin": 0.2698, "ndvi_lavanda_fina": 0.3050, "purpura_lavandin": 0.0153, "purpura_lavanda_fina": 0.0108 },
        { "fecha": "2026-07-26", "pct_cortado": 0.121, "pct_probable": 0.046, "ha_cortadas": 100.71, "ha_planta": 831.14, "ndvi_lavandin": 0.2659, "ndvi_lavanda_fina": 0.3135, "purpura_lavandin": 0.0201, "purpura_lavanda_fina": 0.0185 },
        { "fecha": "2026-07-31", "pct_cortado": 0.175, "pct_probable": 0.173, "ha_cortadas": 145.63, "ha_planta": 831.14, "ndvi_lavandin": 0.2412, "ndvi_lavanda_fina": 0.2282, "purpura_lavandin": 0.0176, "purpura_lavanda_fina": 0.0222 },
        { "fecha": "2026-08-02", "pct_cortado": 0.353, "pct_probable": 0.011, "ha_cortadas": 293.55, "ha_planta": 831.14, "ndvi_lavandin": 0.2359, "ndvi_lavanda_fina": 0.2214, "purpura_lavandin": 0.0183, "purpura_lavanda_fina": 0.0227 },
        { "fecha": "2026-08-05", "pct_cortado": 0.365, "pct_probable": 0.009, "ha_cortadas": 303.03, "ha_planta": 831.14, "ndvi_lavandin": 0.2216, "ndvi_lavanda_fina": 0.2137, "purpura_lavandin": 0.0232, "purpura_lavanda_fina": 0.0247 },
        { "fecha": "2026-08-10", "pct_cortado": 0.379, "pct_probable": 0.090, "ha_cortadas": 314.60, "ha_planta": 831.14, "ndvi_lavandin": 0.2131, "ndvi_lavanda_fina": 0.2244, "purpura_lavandin": 0.0190, "purpura_lavanda_fina": 0.0206 },
        { "fecha": "2026-08-12", "pct_cortado": 0.481, "pct_probable": 0.073, "ha_cortadas": 399.72, "ha_planta": 831.14, "ndvi_lavandin": 0.2145, "ndvi_lavanda_fina": 0.2138, "purpura_lavandin": 0.0201, "purpura_lavanda_fina": 0.0219 },
        { "fecha": "2026-08-15", "pct_cortado": 0.523, "pct_probable": 0.037, "ha_cortadas": 434.27, "ha_planta": 831.14, "ndvi_lavandin": 0.1838, "ndvi_lavanda_fina": 0.1878, "purpura_lavandin": 0.0227, "purpura_lavanda_fina": 0.0203 },
        { "fecha": "2026-08-20", "pct_cortado": 0.553, "pct_probable": 0.030, "ha_cortadas": 459.52, "ha_planta": 831.14, "ndvi_lavandin": 0.2059, "ndvi_lavanda_fina": 0.2157, "purpura_lavandin": 0.0140, "purpura_lavanda_fina": 0.0157 },
        { "fecha": "2026-08-22", "pct_cortado": 0.554, "pct_probable": 0.035, "ha_cortadas": 460.53, "ha_planta": 830.67, "ndvi_lavandin": 0.2224, "ndvi_lavanda_fina": 0.2024, "purpura_lavandin": 0.0160, "purpura_lavanda_fina": 0.0211 },
        { "fecha": "2026-08-25", "pct_cortado": 0.565, "pct_probable": 0.037, "ha_cortadas": 468.92, "ha_planta": 830.67, "ndvi_lavandin": 0.1939, "ndvi_lavanda_fina": 0.2255, "purpura_lavandin": 0.0296, "purpura_lavanda_fina": 0.0297 },
        { "fecha": "2026-08-30", "pct_cortado": 0.573, "pct_probable": 0.019, "ha_cortadas": 475.92, "ha_planta": 830.67, "ndvi_lavandin": 0.2140, "ndvi_lavanda_fina": 0.2072, "purpura_lavandin": 0.0224, "purpura_lavanda_fina": 0.0225 },
        { "fecha": "2026-09-01", "pct_cortado": 0.602, "pct_probable": 0.000, "ha_cortadas": 500.06, "ha_planta": 830.67, "ndvi_lavandin": 0.2071, "ndvi_lavanda_fina": 0.1987, "purpura_lavandin": 0.0199, "purpura_lavanda_fina": 0.0239 },
        { "fecha": "2026-09-04", "pct_cortado": 0.602, "pct_probable": 0.001, "ha_cortadas": 500.06, "ha_planta": 830.67, "ndvi_lavandin": 0.2002, "ndvi_lavanda_fina": 0.1959, "purpura_lavandin": 0.0229, "purpura_lavanda_fina": 0.0239 },
        { "fecha": "2026-09-09", "pct_cortado": 0.602, "pct_probable": 0.001, "ha_cortadas": 500.06, "ha_planta": 830.67, "ndvi_lavandin": 0.2144, "ndvi_lavanda_fina": 0.2013, "purpura_lavandin": 0.0189, "purpura_lavanda_fina": 0.0235 },
        { "fecha": "2026-09-11", "pct_cortado": 0.602, "pct_probable": 0.000, "ha_cortadas": 500.06, "ha_planta": 830.67, "ndvi_lavandin": 0.2122, "ndvi_lavanda_fina": 0.2091, "purpura_lavandin": 0.0230, "purpura_lavanda_fina": 0.0243 },
        { "fecha": "2026-09-14", "pct_cortado": 0.602, "pct_probable": 0.000, "ha_cortadas": 500.06, "ha_planta": 830.67, "ndvi_lavandin": 0.2111, "ndvi_lavanda_fina": 0.2004, "purpura_lavandin": 0.0265, "purpura_lavanda_fina": 0.0316 },
        { "fecha": "2026-09-19", "pct_cortado": 0.602, "pct_probable": 0.000, "ha_cortadas": 500.06, "ha_planta": 830.37, "ndvi_lavandin": 0.2091, "ndvi_lavanda_fina": 0.2031, "purpura_lavandin": 0.0236, "purpura_lavanda_fina": 0.0262 },
        { "fecha": "2026-09-21", "pct_cortado": 0.602, "pct_probable": 0.000, "ha_cortadas": 500.06, "ha_planta": 830.37, "ndvi_lavandin": 0.2070, "ndvi_lavanda_fina": 0.1986, "purpura_lavandin": 0.0213, "purpura_lavanda_fina": 0.0234 },
        { "fecha": "2026-09-24", "pct_cortado": 0.603, "pct_probable": 0.000, "ha_cortadas": 500.06, "ha_planta": 829.37, "ndvi_lavandin": 0.2079, "ndvi_lavanda_fina": 0.2017, "purpura_lavandin": 0.0275, "purpura_lavanda_fina": 0.0309 },
        { "fecha": "2026-09-29", "pct_cortado": 0.603, "pct_probable": 0.016, "ha_cortadas": 500.06, "ha_planta": 829.37, "ndvi_lavandin": 0.1604, "ndvi_lavanda_fina": 0.1262, "purpura_lavandin": 0.0287, "purpura_lavanda_fina": 0.0268 }
      ]
    },
    "hayedos_otono": {
      "referencia_fechas": [
        { "hayedo": "tejera_negra", "hito": "inicio", "anios": 8, "doy_mediana": 280.2, "fecha_mediana": "10-07", "doy_min": 262.1, "fecha_min": "09-19", "doy_max": 297.9, "fecha_max": "10-25" },
        { "hayedo": "tejera_negra", "hito": "avanzado", "anios": 8, "doy_mediana": 287.4, "fecha_mediana": "10-14", "doy_min": 270.5, "fecha_min": "09-27", "doy_max": 302.6, "fecha_max": "10-30" },
        { "hayedo": "tejera_negra", "hito": "pleno", "anios": 6, "doy_mediana": 292.0, "fecha_mediana": "10-19", "doy_min": 278.6, "fecha_min": "10-05", "doy_max": 352.7, "fecha_max": "12-18" },
        { "hayedo": "montejo", "hito": "inicio", "anios": 7, "doy_mediana": 301.3, "fecha_mediana": "10-28", "doy_min": 290.6, "fecha_min": "10-17", "doy_max": 313.4, "fecha_max": "11-09" },
        { "hayedo": "montejo", "hito": "avanzado", "anios": 7, "doy_mediana": 309.5, "fecha_mediana": "11-05", "doy_min": 299.1, "fecha_min": "10-26", "doy_max": 315.6, "fecha_max": "11-11" },
        { "hayedo": "montejo", "hito": "pleno", "anios": 6, "doy_mediana": 314.3, "fecha_mediana": "11-10", "doy_min": 305.8, "fecha_min": "11-01", "doy_max": 317.2, "fecha_max": "11-13" }
      ],
      "otono_hitos_2026": [
        {
          "hayedo": "tejera_negra",
          "hito": "inicio",
          "fecha": "2026-09-04",
          "confirmado": "2026-09-07",
          "revisar": true,
          "contexto_climatico": "Pico de calor seco el 2026-09-04 (tmax 30.0°C, tmin 16.6°C, lluvia 0.0 mm tras solo 3.4 mm en agosto); el enfriamiento otoñal real arranca entre el 2026-10-07 (tmax 10.4°C, lluvia 8.4 mm) y el 2026-10-18 (tmax 6.0°C, tmin 2.8°C, lluvia 7.4 mm)."
        }
      ],
      "estadisticas_por_zona_tejera_negra": [
        { "parcela": "tejera_negra_01", "n_obs_validas": 30, "ndvi_mean": 0.8708, "ndvi_min": 0.5861, "ndvi_max": 0.9349, "purpura_med_mean": -0.3855, "ari_med_median": 15.1625, "ebi_med_mean": 0.0147 },
        { "parcela": "tejera_negra_02", "n_obs_validas": 31, "ndvi_mean": 0.8676, "ndvi_min": 0.6096, "ndvi_max": 0.9472, "purpura_med_mean": -0.3779, "ari_med_median": 14.7677, "ebi_med_mean": 0.0187 },
        { "parcela": "tejera_negra_03", "n_obs_validas": 32, "ndvi_mean": 0.8623, "ndvi_min": 0.5864, "ndvi_max": 0.9237, "purpura_med_mean": -0.3582, "ari_med_median": 16.2479, "ebi_med_mean": 0.0436 },
        { "parcela": "tejera_negra_04", "n_obs_validas": 34, "ndvi_mean": 0.8242, "ndvi_min": 0.5417, "ndvi_max": 0.8901, "purpura_med_mean": -0.2832, "ari_med_median": 15.9216, "ebi_med_mean": 0.0205 },
        { "parcela": "tejera_negra_05", "n_obs_validas": 32, "ndvi_mean": 0.7821, "ndvi_min": 0.5201, "ndvi_max": 0.8951, "purpura_med_mean": -0.2016, "ari_med_median": 15.1695, "ebi_med_mean": 0.0397 },
        { "parcela": "tejera_negra_06", "n_obs_validas": 32, "ndvi_mean": 0.8325, "ndvi_min": 0.5666, "ndvi_max": 0.9163, "purpura_med_mean": -0.2806, "ari_med_median": 16.7199, "ebi_med_mean": 0.0399 },
        { "parcela": "tejera_negra_07", "n_obs_validas": 31, "ndvi_mean": 0.7376, "ndvi_min": 0.4952, "ndvi_max": 0.8390, "purpura_med_mean": -0.1478, "ari_med_median": 13.6335, "ebi_med_mean": 0.0662 }
      ],
      "serie_avance_completa_2026_tejera_negra": [
        { "fecha": "2026-07-21", "zonas": 7, "color": -0.188, "color_p25": -0.207, "color_p75": -0.136, "hoja_perdida": -0.085, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-07-23", "zonas": 7, "color": -0.185, "color_p25": -0.237, "color_p75": -0.129, "hoja_perdida": -0.056, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-07-26", "zonas": 7, "color": -0.166, "color_p25": -0.212, "color_p75": -0.112, "hoja_perdida": -0.100, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-07-29", "zonas": 7, "color": -0.039, "color_p25": -0.144, "color_p75": -0.003, "hoja_perdida": 0.000, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-07-31", "zonas": 7, "color": -0.090, "color_p25": -0.157, "color_p75": -0.047, "hoja_perdida": 0.002, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-02", "zonas": 7, "color": -0.085, "color_p25": -0.107, "color_p75": -0.020, "hoja_perdida": -0.006, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-05", "zonas": 4, "color": -0.044, "color_p25": -0.052, "color_p75": -0.042, "hoja_perdida": -0.018, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-08", "zonas": 7, "color": 0.000, "color_p25": -0.037, "color_p75": 0.022, "hoja_perdida": 0.018, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-10", "zonas": 7, "color": 0.067, "color_p25": 0.013, "color_p75": 0.147, "hoja_perdida": 0.063, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-12", "zonas": 7, "color": 0.000, "color_p25": -0.004, "color_p75": 0.018, "hoja_perdida": -0.027, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-13", "zonas": 6, "color": 0.094, "color_p25": 0.055, "color_p75": 0.131, "hoja_perdida": 0.227, "tmax": null, "tmin": null, "lluvia": null },
        { "fecha": "2026-08-18", "zonas": 7, "color": 0.041, "color_p25": 0.024, "color_p75": 0.099, "hoja_perdida": -0.009, "tmax": 29.5, "tmin": 14.2, "lluvia": 0.0 },
        { "fecha": "2026-08-22", "zonas": 4, "color": -0.001, "color_p25": -0.048, "color_p75": 0.130, "hoja_perdida": 0.030, "tmax": 22.8, "tmin": 12.5, "lluvia": 0.0 },
        { "fecha": "2026-08-28", "zonas": 7, "color": 0.034, "color_p25": 0.008, "color_p75": 0.060, "hoja_perdida": 0.001, "tmax": 16.2, "tmin": 6.1, "lluvia": 0.4 },
        { "fecha": "2026-08-30", "zonas": 7, "color": 0.005, "color_p25": -0.036, "color_p75": 0.058, "hoja_perdida": -0.015, "tmax": 22.9, "tmin": 11.2, "lluvia": 0.0 },
        { "fecha": "2026-09-01", "zonas": 7, "color": 0.025, "color_p25": 0.007, "color_p75": 0.062, "hoja_perdida": 0.017, "tmax": 24.9, "tmin": 13.6, "lluvia": 0.0 },
        { "fecha": "2026-09-02", "zonas": 7, "color": 0.026, "color_p25": 0.014, "color_p75": 0.084, "hoja_perdida": 0.001, "tmax": 27.6, "tmin": 13.2, "lluvia": 0.0 },
        { "fecha": "2026-09-04", "zonas": 6, "color": 0.249, "color_p25": 0.220, "color_p75": 0.320, "hoja_perdida": 0.303, "tmax": 30.0, "tmin": 16.6, "lluvia": 0.0 },
        { "fecha": "2026-09-07", "zonas": 7, "color": 0.314, "color_p25": 0.193, "color_p75": 0.408, "hoja_perdida": 0.106, "tmax": 28.5, "tmin": 15.4, "lluvia": 0.0 },
        { "fecha": "2026-09-11", "zonas": 7, "color": 0.391, "color_p25": 0.250, "color_p75": 0.500, "hoja_perdida": 0.193, "tmax": 21.8, "tmin": 8.8, "lluvia": 0.0 },
        { "fecha": "2026-09-12", "zonas": 7, "color": 0.334, "color_p25": 0.229, "color_p75": 0.381, "hoja_perdida": 0.165, "tmax": 22.9, "tmin": 9.9, "lluvia": 0.0 },
        { "fecha": "2026-09-14", "zonas": 7, "color": 0.300, "color_p25": 0.215, "color_p75": 0.330, "hoja_perdida": 0.203, "tmax": 26.5, "tmin": 12.8, "lluvia": 0.0 },
        { "fecha": "2026-09-17", "zonas": 6, "color": 0.280, "color_p25": 0.227, "color_p75": 0.335, "hoja_perdida": 0.167, "tmax": 17.9, "tmin": 5.2, "lluvia": 0.0 },
        { "fecha": "2026-09-21", "zonas": 7, "color": 0.233, "color_p25": 0.112, "color_p75": 0.302, "hoja_perdida": 0.177, "tmax": 25.1, "tmin": 11.8, "lluvia": 0.0 },
        { "fecha": "2026-09-22", "zonas": 5, "color": 0.264, "color_p25": 0.220, "color_p75": 0.271, "hoja_perdida": 0.193, "tmax": 24.6, "tmin": 10.9, "lluvia": 0.0 },
        { "fecha": "2026-09-24", "zonas": 7, "color": 0.252, "color_p25": 0.164, "color_p75": 0.323, "hoja_perdida": 0.139, "tmax": 26.0, "tmin": 13.3, "lluvia": 0.0 },
        { "fecha": "2026-10-04", "zonas": 3, "color": 0.228, "color_p25": 0.168, "color_p75": 0.231, "hoja_perdida": 0.279, "tmax": 16.1, "tmin": 8.8, "lluvia": 0.2 },
        { "fecha": "2026-10-09", "zonas": 7, "color": 0.240, "color_p25": 0.175, "color_p75": 0.322, "hoja_perdida": 0.175, "tmax": 12.1, "tmin": 0.8, "lluvia": 0.0 },
        { "fecha": "2026-10-12", "zonas": 7, "color": 0.214, "color_p25": 0.136, "color_p75": 0.335, "hoja_perdida": 0.231, "tmax": 17.7, "tmin": 8.3, "lluvia": 0.0 },
        { "fecha": "2026-10-14", "zonas": 4, "color": 0.257, "color_p25": 0.205, "color_p75": 0.307, "hoja_perdida": 0.232, "tmax": 19.5, "tmin": 10.3, "lluvia": 0.0 }
      ],
      "cierre_climatico_octubre_2026": [
        { "fecha": "2026-10-15", "tmax": 18.7, "tmin": 10.3, "lluvia": 1.3 },
        { "fecha": "2026-10-16", "tmax": 17.6, "tmin": 9.4, "lluvia": 0.8 },
        { "fecha": "2026-10-17", "tmax": 10.9, "tmin": 6.0, "lluvia": 10.7 },
        { "fecha": "2026-10-18", "tmax": 6.0, "tmin": 2.8, "lluvia": 7.4 }
      ]
    }
  }
}
