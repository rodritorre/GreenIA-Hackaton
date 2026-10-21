// Packs de viaje por época. Cada pack va ligado a un destino de destinos.js.
// Todos los restaurantes, alojamientos y lugares son reales y se comprobaron en
// octubre de 2026 (ver `fuentes`). Solo se ponen precios cuando una fuente los da;
// horarios y precios cambian, así que la UI pide confirmar antes de ir.
//
// Campos de texto bilingües: { es, en }. `tipo` de parada: restaurante | alojamiento | actividad.

const comprobado = "2026-10";

const packs = [
  {
    id: "invierno-alpujarra",
    temporada: "invierno",
    destinoId: "alpujarra",
    meses: { es: "ene – feb", en: "Jan – Feb" },
    titulo: {
      es: "Almendros del Poqueira y cocina alpujarreña",
      en: "Poqueira almond blossom and Alpujarra cooking",
    },
    duracion: { es: "2 días · 1 noche", en: "2 days · 1 night" },
    resumen: {
      es: "Laderas blancas de almendro en las cotas bajas, pueblos encalados del barranco del Poqueira y platos de invierno junto a la chimenea.",
      en: "White almond slopes on the lower ground, the whitewashed villages of the Poqueira gorge and winter dishes by the fire.",
    },
    plato: {
      es: "Plato alpujarreño, migas y jamón de Trevélez",
      en: "Plato alpujarreño, migas and Trevélez ham",
    },
    dias: [
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Subida por Lanjarón y Órgiva",
          lugar: "Lanjarón · Órgiva",
          nota: {
            es: "La flor del almendro llega antes a las cotas bajas: esta carretera de entrada a la Alpujarra es la que más color tiene a principios de temporada.",
            en: "Almond blossom reaches the lower ground first: this approach road into the Alpujarra has the most colour early in the season.",
          },
        },
        {
          momento: { es: "Comida", en: "Lunch" },
          tipo: "restaurante",
          nombre: "El Corral del Castaño",
          lugar: "Plaza del Calvario, Capileira",
          nota: {
            es: "Casa alpujarreña del siglo XVI en la plaza del pueblo. Cocina tradicional con elaboración creativa; carnes y quesos de la zona. Cierra los miércoles.",
            en: "A 16th-century Alpujarra house on the village square. Traditional food with a creative touch; local meat and cheese. Closed on Wednesdays.",
          },
          tel: "958 76 34 14",
        },
        {
          momento: { es: "Tarde", en: "Afternoon" },
          tipo: "actividad",
          nombre: "Sendero Capileira – Bubión – Pampaneira",
          lugar: "Barranco del Poqueira",
          nota: {
            es: "Los tres pueblos del barranco se unen por caminos de herradura. Bajando desde Capileira es un paseo cómodo con vistas al valle.",
            en: "The three gorge villages are linked by old mule tracks. Walking down from Capileira is an easy stroll with valley views.",
          },
        },
        {
          momento: { es: "Noche", en: "Night" },
          tipo: "alojamiento",
          nombre: "Villa Turística de Bubión",
          lugar: "Bubión",
          nota: {
            es: "Villas de estilo alpujarreño y habitaciones en el edificio principal, con restaurante y cafetería para la cena.",
            en: "Alpujarra-style villas and rooms in the main building, with a restaurant and café for dinner.",
          },
        },
      ],
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Trevélez y sus secaderos de jamón",
          lugar: "Trevélez",
          nota: {
            es: "Uno de los pueblos más altos de España, famoso por el jamón que se cura con el aire frío de Sierra Nevada.",
            en: "One of the highest villages in Spain, famous for ham cured in the cold Sierra Nevada air.",
          },
        },
        {
          momento: { es: "Comida", en: "Lunch" },
          tipo: "restaurante",
          nombre: "La Fragua",
          lugar: "Barrio Medio, Trevélez",
          nota: {
            es: "Cocina alpujarreña y mediterránea de raíz morisca: arroz de caza, perdiz y jamón de Trevélez con vino de la tierra.",
            en: "Alpujarra and Mediterranean cooking with Moorish roots: game rice, partridge and Trevélez ham with local wine.",
          },
          alternativa: {
            nombre: "Restaurante Teide (Bubión)",
            nota: {
              es: "Cocina alpujarreña clásica: asados, sopas, migas y embutidos. Cierra los martes.",
              en: "Classic Alpujarra food: roasts, soups, migas and cured meats. Closed on Tuesdays.",
            },
          },
        },
      ],
    ],
    fuentes: [
      { nombre: "Andalucía.org · Teide", url: "https://andalucia.org/en/bubion-where-to-eat-teide" },
      { nombre: "Andalucía.org · La Fragua", url: "https://andalucia.org/en/trevelez-where-to-eat-la-fragua" },
      {
        nombre: "Andalucía.org · Villa Turística de Bubión",
        url: "https://andalucia.org/en/bubion-acommodation-villa-turistica-de-bubion-hotel",
      },
      { nombre: "GastroRanking · El Corral del Castaño", url: "https://gastroranking.es/r/el-corral-del-castano_23669/" },
    ],
  },
  {
    id: "primavera-jerte",
    temporada: "primavera",
    destinoId: "jerte",
    meses: { es: "mar – abr", en: "Mar – Apr" },
    titulo: {
      es: "Cerezo en flor y cocina extremeña",
      en: "Cherry blossom and Extremadura cooking",
    },
    duracion: { es: "2 días · 1 noche", en: "2 days · 1 night" },
    resumen: {
      es: "Más de un millón de cerezos en flor, miradores en lo alto del valle y la Garganta de los Infiernos con el agua del deshielo.",
      en: "Over a million cherry trees in bloom, viewpoints high above the valley and the Garganta de los Infiernos full of snowmelt.",
    },
    plato: {
      es: "Gazpacho de cereza, migas extremeñas y patatas revolconas",
      en: "Cherry gazpacho, migas extremeñas and patatas revolconas",
    },
    dias: [
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Miradores de Piornal y Puerto de Tornavacas",
          lugar: "Valle del Jerte",
          nota: {
            es: "Las mejores vistas del manto blanco salen desde arriba: la carretera hacia Piornal o la bajada desde el Puerto de Tornavacas.",
            en: "The best views of the white blanket are from above: the road up to Piornal or the descent from the Tornavacas pass.",
          },
        },
        {
          momento: { es: "Comida y noche", en: "Lunch and night" },
          tipo: "restaurante",
          nombre: "Hotel Restaurante Judería Valle del Jerte",
          lugar: "C/ Federico Bajo 18, Cabezuela del Valle",
          nota: {
            es: "Junto a la iglesia de San Miguel. Cocina con producto del valle: solomillo con cereza, migas y pluma ibérica. Tiene habitaciones dobles y familiares para dormir aquí.",
            en: "Next to San Miguel church. Valley produce: sirloin with cherry, migas and Iberian pluma. Double and family rooms if you want to stay the night.",
          },
          web: "https://restaurantejuderiavalledeljerte.com",
          tel: "927 47 25 30",
        },
        {
          momento: { es: "Tarde", en: "Afternoon" },
          tipo: "actividad",
          nombre: "Fiesta del Cerezo en Flor",
          lugar: "Pueblos del valle",
          nota: {
            es: "Fiesta de Interés Turístico Nacional. Las fechas dependen de la floración: consulta el programa oficial antes de ir.",
            en: "A festival of national tourist interest. Dates follow the bloom: check the official programme before you go.",
          },
        },
      ],
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Los Pilones, Garganta de los Infiernos",
          lugar: "Reserva Natural, Jerte",
          nota: {
            es: "Pozas de granito pulidas por el agua. Ruta de media jornada desde el centro de interpretación.",
            en: "Granite pools polished by the water. A half-day walk from the visitor centre.",
          },
        },
        {
          momento: { es: "Comida", en: "Lunch" },
          tipo: "restaurante",
          nombre: "La Cabaña del Jerte",
          lugar: "Av. Ramón y Cajal 17, Jerte",
          nota: {
            es: "Gazpacho de cereza, ensalada de queso de cabra, patatas revolconas y migas extremeñas.",
            en: "Cherry gazpacho, goat's cheese salad, patatas revolconas and migas extremeñas.",
          },
          precio: "20 – 30 €",
          tel: "645 23 39 53",
        },
      ],
    ],
    fuentes: [
      { nombre: "Web oficial · Judería Valle del Jerte", url: "https://restaurantejuderiavalledeljerte.com" },
      { nombre: "GastroRanking · La Cabaña del Jerte", url: "https://gastroranking.es/r/restaurante-la-cabana-6_59661/" },
      { nombre: "Escapada Rural · Cerezos en flor", url: "https://www.escapadarural.com/blog/cerezos-en-flor-del-valle-del-jerte/" },
    ],
  },
  {
    id: "verano-brihuega",
    temporada: "verano",
    destinoId: "brihuega",
    meses: { es: "jun – jul", en: "Jun – Jul" },
    titulo: {
      es: "Lavanda al atardecer y cabrito alcarreño",
      en: "Lavender at sunset and Alcarria roast kid",
    },
    duracion: { es: "2 días · 1 noche", en: "2 days · 1 night" },
    resumen: {
      es: "Campos morados alrededor de la villa amurallada, una noche en la antigua Real Fábrica de Paños y cocina con miel de la Alcarria.",
      en: "Purple fields around the walled town, a night in the old Royal Cloth Factory and cooking with Alcarria honey.",
    },
    plato: {
      es: "Cabrito al horno de leña y queso frito con miel de la Alcarria",
      en: "Wood-fired roast kid and fried cheese with Alcarria honey",
    },
    dias: [
      [
        {
          momento: { es: "Tarde", en: "Afternoon" },
          tipo: "actividad",
          nombre: "Campos de lavanda al atardecer",
          lugar: "Alrededores de Brihuega",
          nota: {
            es: "La mejor luz llega en la última hora de sol. La cosecha empieza a finales de julio; en julio se celebra el Festival de la Lavanda.",
            en: "The best light is in the last hour of sun. Harvest starts in late July; the Lavender Festival is held in July.",
          },
        },
        {
          momento: { es: "Cena", en: "Dinner" },
          tipo: "restaurante",
          nombre: "El Kiosko de la Alameda",
          lugar: "Parque de María Cristina, Brihuega",
          nota: {
            es: "Solete de la Guía Repsol. Cocina de autor sin gluten con producto de temporada, con terraza en los jardines e invernadero acristalado. Prueba el lomo de vaca madurada.",
            en: "Guía Repsol Solete. Gluten-free signature cooking with seasonal produce, a garden terrace and a glass greenhouse. Try the aged beef loin.",
          },
          precio: "< 35 €",
          web: "https://www.elkioskodelaalameda.com/",
          tel: "633 757 401",
        },
        {
          momento: { es: "Noche", en: "Night" },
          tipo: "alojamiento",
          nombre: "Castilla Termal Brihuega",
          lugar: "Paseo de la Fábrica 14 A, Brihuega",
          nota: {
            es: "Hotel de cinco estrellas en la antigua Real Fábrica de Paños (siglo XVIII), con piscina termal y tratamientos con lavanda.",
            en: "Five-star hotel in the 18th-century Royal Cloth Factory, with a thermal pool and lavender treatments.",
          },
          web: "https://www.castillatermal.com/hoteles/castilla-la-mancha/castilla-termal-brihuega/",
        },
      ],
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Muralla y castillo de Piedra Bermeja",
          lugar: "Casco histórico de Brihuega",
          nota: {
            es: "Paseo por la villa amurallada, la Puerta de la Cadena y el castillo sobre el valle del Tajuña.",
            en: "A walk through the walled town, the Puerta de la Cadena and the castle above the Tajuña valley.",
          },
        },
        {
          momento: { es: "Comida", en: "Lunch" },
          tipo: "restaurante",
          nombre: "Restaurante Princesa Elima",
          lugar: "Paseo de la Fábrica 15, Brihuega",
          nota: {
            es: "Cocina alcarreña en la Hospedería Princesa Elima: cabrito al horno de leña, queso frito con miel y croquetas caseras. Cierra los domingos por la noche.",
            en: "Alcarria cooking at the Hospedería Princesa Elima: wood-fired roast kid, fried cheese with honey and homemade croquetas. Closed Sunday evenings.",
          },
          precio: "20 – 30 €",
          alternativa: {
            nombre: "Asador El Tolmo (Av. de la Constitución 26)",
            nota: {
              es: "Tapas castellanas, croquetas caseras y asados. 20 – 30 €.",
              en: "Castilian tapas, homemade croquetas and roasts. €20 – 30.",
            },
          },
        },
      ],
    ],
    fuentes: [
      { nombre: "Guía Repsol · El Kiosco de la Alameda", url: "https://www.guiarepsol.com/es/fichas/restaurante/el-kiosco-de-la-alameda-334090/" },
      { nombre: "Spain.info · Castilla Termal Brihuega", url: "https://www.spain.info/es/balneario/balneario-castilla-termal-brihuega/" },
      { nombre: "La Maleta Inquieta · Dónde comer en Brihuega", url: "https://lamaletainquieta.com/donde-comer-brihuega/" },
    ],
  },
  {
    id: "otono-tejera-negra",
    temporada: "otono",
    destinoId: "tejera-negra",
    meses: { es: "oct – nov", en: "Oct – Nov" },
    titulo: {
      es: "Hayedo en color y asados de la sierra",
      en: "Beech forest in colour and mountain roasts",
    },
    duracion: { es: "2 días · 1 noche", en: "2 days · 1 night" },
    resumen: {
      es: "Uno de los hayedos más meridionales de Europa en pleno color, pueblos de arquitectura negra de pizarra y asados de la Sierra Norte.",
      en: "One of Europe's southernmost beech forests in full colour, black-slate villages and roasts from the Sierra Norte.",
    },
    plato: {
      es: "Cordero y cochinillo asados (por encargo) y guisos de sierra",
      en: "Roast lamb and suckling pig (to order) and mountain stews",
    },
    dias: [
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Senda de Carretas",
          lugar: "Hayedo de Tejera Negra, Cantalojas",
          nota: {
            es: "Ruta circular de unos 6 km (3 h) desde el aparcamiento de El Casarejo. En otoño, fines de semana y festivos, hay que reservar el aparcamiento en la web de la Junta.",
            en: "A loop of about 6 km (3 h) from the El Casarejo car park. On autumn weekends and holidays the car park must be booked on the regional government website.",
          },
        },
        {
          momento: { es: "Comida", en: "Lunch" },
          tipo: "restaurante",
          nombre: "Restaurante Los Bonales",
          lugar: "Camping Los Bonales, Cantalojas",
          nota: {
            es: "Cocina casera de la sierra y menú del día. Cordero y cochinillo asados por encargo con 48 h. Cierra los lunes.",
            en: "Homestyle mountain cooking and a set lunch. Roast lamb and suckling pig to order 48 h ahead. Closed on Mondays.",
          },
          web: "https://campinglosbonales.es/restaurante/",
          tel: "643 450 152",
          alternativa: {
            nombre: "Restaurante El Hayedo (Cantalojas)",
            nota: {
              es: "Asados y carnes del norte de la provincia. Tel. 677 27 77 73.",
              en: "Roasts and meat from the north of the province. Tel. 677 27 77 73.",
            },
          },
        },
        {
          momento: { es: "Cena y noche", en: "Dinner and night" },
          tipo: "alojamiento",
          nombre: "El Nido de Valverde",
          mesa: true, // cena en su restaurante
          lugar: "C/ Escuelas 1, Valverde de los Arroyos",
          nota: {
            es: "Hotel y casa rural con restaurante de cocina de autor con producto ecológico, en un pueblo de arquitectura negra al pie del Ocejón.",
            en: "Rural hotel with a restaurant serving signature cooking with organic produce, in a black-slate village below the Ocejón peak.",
          },
          web: "https://elnidodevalverde.es",
          tel: "660 420 649",
        },
      ],
      [
        {
          momento: { es: "Mañana", en: "Morning" },
          tipo: "actividad",
          nombre: "Chorreras de Despeñalagua",
          lugar: "Valverde de los Arroyos",
          nota: {
            es: "Cascadas a un paseo del pueblo; en otoño llevan más agua y el bosque de ribera se tiñe de amarillo.",
            en: "Waterfalls a short walk from the village; in autumn they carry more water and the riverside trees turn yellow.",
          },
        },
      ],
    ],
    fuentes: [
      { nombre: "Web oficial · Los Bonales", url: "https://campinglosbonales.es/restaurante/" },
      { nombre: "Web oficial · El Nido de Valverde", url: "https://elnidodevalverde.es" },
      {
        nombre: "Casa Coche Curro · Dónde comer en Tejera Negra",
        url: "https://www.casacochecurro.com/los-mejores-sitios-donde-comer-en-el-hayedo-de-la-tejera-negra.html",
      },
    ],
  },
];

// Orden de las pestañas a lo largo del año.
const temporadas = ["invierno", "primavera", "verano", "otono"];

export { comprobado, packs, temporadas };
