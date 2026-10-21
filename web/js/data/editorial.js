// Lo que cuenta cada destino (separado de lo que calcula el sistema), con sus fuentes.
// Todo lo que aparece aquí está sacado de las fuentes enlazadas (consultadas el 21/10/2026).
// Si un dato no tiene fuente, no se pone.

const greenia = { nombre: "Datos proporcionados por Greenia (CSV del reto)", url: null };

const editorial = {
  "tejera-negra": {
    lat: 41.2153,
    lon: -3.3965,
    texto: {
      historia:
        "Hayedo de 1.641 ha en Cantalojas, integrado desde 2011 en el Parque Natural de la Sierra Norte de Guadalajara. Forma parte del Patrimonio Mundial de la UNESCO «Hayedos primarios de los Cárpatos y otras regiones de Europa».",
      queVer: [
        "Senda de Carretas: 6 km, dificultad media, sale del aparcamiento de El Casarejo",
        "Senda del Robledal: 17 km, sale del Centro de Interpretación",
      ],
      comoLlegar:
        "Por Cantalojas (Guadalajara). El último tramo hasta el aparcamiento es una pista forestal.",
      acceso:
        "En otoño y en Semana Santa hay que reservar online plaza en el aparcamiento de El Casarejo. A pie o en bici desde el Centro de Interpretación no hace falta reserva.",
      consejos: [
        "La pista puede cerrarse por nieve o hielo, y el hayedo por motivos de seguridad: consulta su estado antes de ir.",
        "Las tasas del aparcamiento varían según la fuente: compruébalas en la web oficial.",
      ],
    },
    fuentes: [
      greenia,
      {
        nombre: "Wikipedia · Hayedo de Tejera Negra",
        url: "https://es.wikipedia.org/wiki/Hayedo_de_Tejera_Negra",
      },
      {
        nombre: "Spain.info · Hayedo de Tejera Negra",
        url: "https://www.spain.info/es/naturaleza/parque-natural-hayedo-tejera-negra/",
      },
      {
        nombre: "eldiario.es · Ruta por el Hayedo de Tejera Negra",
        url: "https://www.eldiario.es/viajes/hayedo-tejera-negra-reserva_1_10591102.html",
      },
    ],
  },
  brihuega: {
    texto: {
      historia:
        "En torno a Brihuega se cultivan unas 2.000 ha de lavanda y lavandín desde 1960, según el folleto oficial que citan las guías. Los datos de Greenia vigilan por satélite unas 830 ha repartidas en 329 parcelas.",
      queVer: [
        "Campos de lavanda en flor: el máximo esplendor suele darse en la primera quincena de julio",
        "Festival de la Lavanda: en 2026 cumplió 10 años, con conciertos al atardecer los días 10, 11, 17 y 18 de julio en los Campos de la Batalla",
      ],
      comoLlegar:
        "Brihuega (Guadalajara). Los conciertos del festival se celebran en la zona de Malacuera y Olmeda del Extremo.",
      acceso:
        "Los campos son fincas de cultivo: no entres en las parcelas. El festival es de pago (en 2026, entradas de 35 a 150 €).",
      consejos: [
        "El estado real de la flor solo se conoce a lo largo de junio: confírmalo antes de viajar.",
        "La cosecha empieza a finales de julio (en 2026, el 10 % estaba cortado el 21 de julio) y después los campos quedan sin flor.",
      ],
    },
    fuentes: [
      greenia,
      {
        nombre: "La Maleta Inquieta · Festival de la Lavanda 2026",
        url: "https://lamaletainquieta.com/festival-lavanda-brihuega/",
      },
      {
        nombre: "Festivales de España · Festival de la Lavanda",
        url: "https://www.festivalesdeespana.com/festival/festival-lavanda-brihuega",
      },
    ],
  },
  montejo: {
    lat: 41.1033,
    lon: -3.4898,
    texto: {
      historia:
        "Hayedo de 250 ha en Montejo de la Sierra, Sitio Natural de Interés Nacional desde 1974 y parte del Patrimonio Mundial de la UNESCO (hayedos primarios de Europa) desde 2017. Está en la Reserva de la Biosfera Sierra del Rincón.",
      queVer: [
        "Rutas guiadas por educadores ambientales",
        "El otoño, su mejor época y la de más demanda",
      ],
      comoLlegar:
        "La visita parte del Centro de Recursos de la Reserva de la Biosfera, en la calle Real 64 de Montejo de la Sierra (Madrid).",
      acceso:
        "Las visitas son siempre guiadas y gratuitas. Hay que inscribirse antes en la web (las plazas se sortean) o pedir autorización el mismo día en el Centro de Recursos, desde las 9:30 y hasta agotar plazas.",
      consejos: [
        "No se admiten perros (salvo de asistencia), ni recoger plantas, setas o frutos, ni volar drones.",
        "En otoño inscríbete con antelación: es cuando más plazas se piden.",
      ],
    },
    fuentes: [
      greenia,
      {
        nombre: "Wikipedia · Hayedo de Montejo",
        url: "https://es.wikipedia.org/wiki/Hayedo_de_Montejo",
      },
      {
        nombre: "visitmadrid.es · Hayedo de Montejo",
        url: "https://www.visitmadrid.es/hayedo-montejo",
      },
      {
        nombre: "La Maleta Inquieta · Cómo visitar el Hayedo de Montejo",
        url: "https://lamaletainquieta.com/hayedo-de-montejo/",
      },
    ],
  },
  jerte: {
    lat: 40.19,
    lon: -5.81,
    texto: {
      historia:
        "En el Valle del Jerte (Cáceres) florecen millones de cerezos. La flor sube por el valle: empieza en las zonas bajas y acaba en las altas, y en cada zona dura unos 10 días.",
      queVer: [
        "Programa Primavera y Cerezo en Flor: en 2026, del 20 de marzo al 3 de mayo, con el bloque central «Cerezo en Flor» del 27 de marzo al 12 de abril",
        "Ruta del puerto de Tornavacas a Navaconcejo, pasando por Jerte",
        "Pueblos de la ladera sur: Valdastillas, Piornal, Barrado, Cabrero, Casas del Castañar, El Torno y Rebollar",
      ],
      comoLlegar: "Cabezuela del Valle está en el centro del valle.",
      acceso: "Pueblos y caminos de acceso libre. Respeta las fincas de cerezos.",
      consejos: [
        "La fecha cambia con el invierno: en 2016 y 2018 no hubo flor hasta abril, y en 2019, 2020 y 2021 empezó en la segunda semana de marzo.",
        "Si llegas tarde a las zonas bajas, sube a los pueblos altos: allí la flor llega después.",
      ],
    },
    fuentes: [
      {
        nombre: "Guías Viajar · Fechas de los cerezos en flor del Jerte",
        url: "https://guias-viajar.com/espana/extremadura-fechas-cerezos-en-flor-valle-jerte/",
      },
      {
        nombre: "La Portada de Extremadura · Programa Cerezo en Flor 2026",
        url: "https://www.laportadadeextremadura.com/extremadura/valle-jerte-presenta-su-primavera-cerezo-en-flor-2026-fechas-programa-detallado_3578_102.html",
      },
    ],
  },
  alpujarra: {
    lat: 36.877,
    lon: -3.298,
    texto: {
      historia:
        "En la Alpujarra granadina los almendros florecen en pleno invierno. Cada árbol dura en flor dos o tres semanas, y la altitud y el microclima alargan la temporada.",
      queVer: [
        "Ruta de los almendros en flor: de Castillo de Baños por Polopos y la Haza del Lino, y después por Torvizcón y Almegíjar hasta Trevélez",
        "Torvizcón a finales de febrero",
      ],
      comoLlegar:
        "La ruta arranca en la costa de Granada, en Castillo de Baños, y sube hacia la Alpujarra.",
      acceso: "Carreteras de montaña: conduce con calma.",
      consejos: [
        "Según el año, la flor va de mediados de enero a finales de marzo: consulta partes de floración recientes antes de ir.",
      ],
    },
    fuentes: [
      {
        nombre: "Los Viajeros · Ruta de los almendros en flor al sur de Granada",
        url: "https://www.losviajeros.com/Tips.php?p=1881",
      },
      {
        nombre: "FotoRed · Almendros en flor en la Alpujarra",
        url: "https://www.fotored.es/foto/ficha/almendros-en-flor-en-la-alpujarra-15339",
      },
      {
        nombre: "Granada Blog · Rutas para ver almendros",
        url: "https://granadablog.es/3-rutas-para-ver-almendros-en-granada/",
      },
    ],
  },
  tejeda: {
    texto: {
      historia:
        "Tejeda está en el centro de Gran Canaria, dentro de la Reserva de la Biosfera de la isla. El almendro fue durante siglos clave en su economía, y sus Fiestas del Almendro en Flor se celebran desde 1970 y son de Interés Turístico Nacional.",
      queVer: [
        "Fiestas del Almendro en Flor: la 53.ª edición fue del 31 de enero al 8 de febrero de 2026, con artesanía, gastronomía local, música canaria y una Muestra de Oficios Tradicionales",
        "Ruta del almendro en flor por Valsequillo, Tejeda y Artenara (en 2026, del 24 de enero al 15 de febrero)",
        "Paisaje cultural de Risco Caído y las Montañas Sagradas de Gran Canaria",
      ],
      comoLlegar: "Tejeda, en la cumbre de Gran Canaria.",
      acceso:
        "Las fiestas las organizan el Cabildo de Gran Canaria y el Ayuntamiento de Tejeda: consulta su programa de 2027.",
      consejos: ["Las fechas de la fiesta cambian cada año con la floración."],
    },
    fuentes: [
      {
        nombre: "RTVC · Tejeda celebra la 53.ª edición del Almendro en Flor",
        url: "https://rtvc.es/tejeda-celebra-fiestas-almendro-flor-simbolo-identidad-naturaleza-3-febrero-2026/",
      },
      {
        nombre: "Festivales de España · Fiestas del Almendro en Flor de Tejeda",
        url: "https://www.festivalesdeespana.com/festival/fiestas-del-almendro-en-flor-tejeda-tejeda/2026",
      },
      {
        nombre: "Festivales de España · Ruta de Valsequillo, Tejeda y Artenara",
        url: "https://www.festivalesdeespana.com/festival/almendro-en-flor-ruta-de-valsequillo-y-tejeda-gran-canaria-tejeda-valsequillo-artenara",
      },
    ],
  },
  teide: {
    texto: {
      historia:
        "El tajinaste rojo (Echium wildpretii) es una planta de hasta 2 m que solo crece en Tenerife, en Las Cañadas del Teide, un parque que supera los 2.000 m de altitud. Es bienal: florece una sola vez y después muere.",
      queVer: [
        "Llano de Ucanca",
        "Roques de García y el Sendero de los Roques",
        "Miradores de La Ruleta y Boca Tauce",
      ],
      comoLlegar: "Parque Nacional del Teide, en el centro de Tenerife.",
      acceso:
        "Especie protegida: no salgas de los senderos, no toques las plantas ni recojas flores o semillas. En mayo de 2026 se denunció a turistas por arrancar un ejemplar, con multas de hasta 1.500 €.",
      consejos: [
        "La floración se adelanta o se retrasa según las lluvias y las temperaturas del invierno anterior.",
        "El mejor momento suele ir de mediados de mayo a principios de junio.",
      ],
    },
    fuentes: [
      {
        nombre: "parquenacionalteide.com · Dónde ver el tajinaste rojo",
        url: "https://www.parquenacionalteide.com/tajinaste-rojo-donde-verlo/",
      },
      {
        nombre: "Webtenerife · Tajinaste rojo",
        url: "https://www.webtenerife.co.uk/tenerife/the-island/flora-fauna/plant/tajinaste-rojo/",
      },
      {
        nombre: "Diario de Avisos · Sanción por arrancar un tajinaste rojo",
        url: "https://diariodeavisos.elespanol.com/2026/05/turistas-sancion-teide-arrancar-tajinaste-rojo/",
      },
      {
        nombre: "¡Hola! · El Teide y la floración del tajinaste",
        url: "https://www.hola.com/viajes/20210506189081/que-ver-tenerife-teide-floracion-tajinaste-primavera-swng/",
      },
    ],
  },
};

// Fechas habituales con fuente, para los destinos sin datos de Greenia.
// Son rangos orientativos que resumen lo que dicen las fuentes de editorial[id].fuentes.
const habitualesConFuente = {
  // "Entre finales de marzo y principios de abril"; años tempranos desde la 2.ª semana de marzo,
  // años tardíos desde principios de abril; un año duró "hasta el 10/12 de abril"
  jerte: [
    { fase: "inicio", tipica: "03-25", rangoMin: "03-08", rangoMax: "04-05" },
    { fase: "avance", tipica: "03-28", rangoMin: "03-15", rangoMax: "04-08" },
    { fase: "pleno", tipica: "04-01", rangoMin: "03-20", rangoMax: "04-10" },
    { fase: "final", tipica: "04-08", rangoMin: "03-28", rangoMax: "04-15" },
  ],
  // "De mediados de enero a finales de marzo según el año"; mejor momento "a finales de febrero"
  alpujarra: [
    { fase: "inicio", tipica: "01-25", rangoMin: "01-15", rangoMax: "02-10" },
    { fase: "avance", tipica: "02-10", rangoMin: "01-25", rangoMax: "02-25" },
    { fase: "pleno", tipica: "02-25", rangoMin: "02-10", rangoMax: "03-10" },
    { fase: "final", tipica: "03-15", rangoMin: "03-01", rangoMax: "03-31" },
  ],
  // "Entre enero y febrero"; fiestas 2026 del 31 ene al 8 feb, ruta del 24 ene al 15 feb
  tejeda: [
    { fase: "inicio", tipica: "01-15", rangoMin: "01-01", rangoMax: "01-25" },
    { fase: "avance", tipica: "01-25", rangoMin: "01-10", rangoMax: "02-05" },
    { fase: "pleno", tipica: "02-01", rangoMin: "01-20", rangoMax: "02-15" },
    { fase: "final", tipica: "02-15", rangoMin: "02-05", rangoMax: "02-28" },
  ],
  // "Mayo y junio"; empieza "a primeros de mayo", máximo "una semana después",
  // mejor "de mediados de mayo a principios de junio"
  teide: [
    { fase: "inicio", tipica: "05-05", rangoMin: "05-01", rangoMax: "05-15" },
    { fase: "avance", tipica: "05-12", rangoMin: "05-05", rangoMax: "05-25" },
    { fase: "pleno", tipica: "05-25", rangoMin: "05-15", rangoMax: "06-07" },
    { fase: "final", tipica: "06-10", rangoMin: "06-01", rangoMax: "06-20" },
  ],
};

export { editorial, habitualesConFuente };
