// Tarjetas "tipo Booking": una por mes y destino, con varias opciones de alojamiento.
//
// Precio mostrado = por persona, 1 noche en habitación doble compartida (precio de la
// habitación / 2) + extras con precio publicado (menús, visitas). Todo son tarifas
// "desde" o medias publicadas, consultadas en octubre de 2026 (ver `fuente` en cada dato).
// Lo que no tiene precio publicado (comidas a la carta, aparcamientos) NO se suma:
// se lista en `noIncluye` para que el total no invente nada.

const alojamientos = {
  fragua2: {
    nombre: "Hotel La Fragua II",
    lugar: "Trevélez",
    web: "https://www.casasrurales.net/hoteles-rurales/hotel-la-fragua-ii--c68022",
    fuente: "casasrurales.net",
  },
  bubion: {
    nombre: "Villa Turística de Bubión",
    lugar: "Bubión",
    web: "https://www.kayak.es/Bubion-Hoteles-Villa-Turistica-de-Bubion.158234.ksp",
    fuente: "KAYAK",
  },
  juderia: {
    nombre: "Hotel Judería Valle del Jerte",
    lugar: "Cabezuela del Valle",
    web: "https://restaurantejuderiavalledeljerte.com/reservar-hotel/",
    fuente: "web oficial",
  },
  elima: {
    nombre: "Hospedería Princesa Elima",
    lugar: "Brihuega",
    web: "https://www.casasrurales.net/hoteles-rurales/hospederia-princesa-elima--c65406",
    fuente: "casasrurales.net",
  },
  termal: {
    nombre: "Castilla Termal Brihuega",
    lugar: "Brihuega",
    web: "https://www.castillatermal.com/hoteles/castilla-la-mancha/castilla-termal-brihuega/",
    fuente: "Central de Reservas",
  },
  bonales: {
    nombre: "Camping Los Bonales",
    lugar: "Cantalojas",
    web: "https://www.tuscasasrurales.com/camping-los-bonales-f25025.htm",
    fuente: "tuscasasrurales.com",
  },
  nido: {
    nombre: "El Nido de Valverde",
    lugar: "Valverde de los Arroyos",
    web: "https://www.elnidodevalverde.es/suites-y-precios/",
    fuente: "web oficial",
  },
};

// Opciones reutilizables por destino. Cada una tiene la tarifa tal como se publica:
//   `noche` = precio de la habitación por noche (cabe `cap` personas, 2 por defecto), o
//   `pp`    = precio por persona y noche (el alojamiento lo publica así).
const opciones = {
  alpujarra: [
    {
      id: "fragua",
      etiqueta: { es: "Económica", en: "Budget" },
      aloj: "fragua2",
      habitacion: { es: "Habitación doble", en: "Double room" },
      pp: 32,
    },
    {
      id: "bubion-semana",
      etiqueta: { es: "Entre semana", en: "Midweek" },
      aloj: "bubion",
      habitacion: { es: "Doble, noches de domingo a jueves", en: "Double, Sunday to Thursday nights" },
      noche: 85,
      nota: { es: "Precio medio publicado", en: "Published average price" },
    },
    {
      id: "bubion-finde",
      etiqueta: { es: "Fin de semana", en: "Weekend" },
      aloj: "bubion",
      habitacion: { es: "Doble, noches de viernes y sábado", en: "Double, Friday and Saturday nights" },
      noche: 155,
      nota: { es: "Precio medio publicado", en: "Published average price" },
    },
  ],
  jerte: [
    {
      id: "juderia-doble",
      etiqueta: { es: "Doble", en: "Double" },
      aloj: "juderia",
      habitacion: { es: "Habitación doble con desayuno", en: "Double room with breakfast" },
      noche: 55,
      desayuno: true,
    },
    {
      id: "juderia-suite",
      etiqueta: { es: "Suite", en: "Suite" },
      aloj: "juderia",
      habitacion: { es: "Suite con desayuno", en: "Suite with breakfast" },
      noche: 90,
      desayuno: true,
    },
  ],
  brihuega: [
    {
      id: "elima-int",
      etiqueta: { es: "Económica", en: "Budget" },
      aloj: "elima",
      habitacion: { es: "Doble interior", en: "Inside double" },
      pp: 29,
    },
    {
      id: "elima-ext",
      etiqueta: { es: "Con vistas", en: "With a view" },
      aloj: "elima",
      habitacion: { es: "Doble exterior", en: "Outside double" },
      pp: 34,
    },
  ],
  "tejera-negra": [
    {
      id: "bonales",
      etiqueta: { es: "Económica", en: "Budget" },
      aloj: "bonales",
      habitacion: { es: "Bungalow (2–6 personas)", en: "Bungalow (2–6 people)" },
      pp: 21,
      cap: 6,
    },
    {
      id: "nido-suite",
      etiqueta: { es: "Hotel rural", en: "Rural hotel" },
      aloj: "nido",
      habitacion: { es: "Suite Alondra o Ruiseñor, con desayuno", en: "Alondra or Ruiseñor suite, with breakfast" },
      noche: 155,
      desayuno: true,
    },
    {
      id: "nido-majada",
      etiqueta: { es: "Suite superior", en: "Top suite" },
      aloj: "nido",
      habitacion: { es: "Suite Majada del Sol, con desayuno", en: "Majada del Sol suite, with breakfast" },
      noche: 175,
      desayuno: true,
    },
  ],
};

const meses = [
  {
    id: "2027-01",
    destinoId: "alpujarra",
    temporada: "invierno",
    mes: { es: "Enero", en: "January" },
    fase: "inicio",
    titulo: { es: "Almendros en las cotas bajas", en: "Almond blossom on the lower slopes" },
    dia: {
      es: "La flor arranca a finales de mes entre Lanjarón y Órgiva. Subes por esa carretera, comes en El Corral del Castaño (Capileira) y bajas a pie por el barranco del Poqueira hasta Bubión.",
      en: "Blossom starts late in the month between Lanjarón and Órgiva. Drive up that road, have lunch at El Corral del Castaño (Capileira) and walk down the Poqueira gorge to Bubión.",
    },
    extras: [],
    noIncluye: { es: "Comidas a la carta (sin precio publicado)", en: "À la carte meals (no published price)" },
  },
  {
    id: "2027-02",
    destinoId: "alpujarra",
    temporada: "invierno",
    mes: { es: "Febrero", en: "February" },
    fase: "pleno",
    titulo: { es: "Pleno blanco y rosa", en: "Full white and pink" },
    dia: {
      es: "Hacia el 10 de febrero el almendro está en pleno. Mañana en Trevélez entre secaderos de jamón y comida en Mesón La Fragua; tarde por los tres pueblos del Poqueira.",
      en: "Around 10 February the almond trees peak. Morning in Trevélez among the ham-curing houses and lunch at Mesón La Fragua; afternoon through the three Poqueira villages.",
    },
    aviso: {
      es: "Febrero suele ser el mes más barato en Bubión: un 33 % por debajo de la media (KAYAK).",
      en: "February is usually the cheapest month in Bubión: 33% below average (KAYAK).",
    },
    extras: [],
    noIncluye: { es: "Comidas a la carta (sin precio publicado)", en: "À la carte meals (no published price)" },
  },
  {
    id: "2027-03",
    destinoId: "jerte",
    temporada: "primavera",
    mes: { es: "Marzo", en: "March" },
    fase: "inicio",
    titulo: { es: "El valle empieza a blanquear", en: "The valley starts turning white" },
    dia: {
      es: "La flor empieza en el fondo del valle hacia el 20 de marzo, con la fiesta del Despertar del Valle. Miradores de Piornal por la mañana y comida en La Cabaña del Jerte.",
      en: "Blossom starts on the valley floor around 20 March, with the Despertar del Valle festival. Piornal viewpoints in the morning and lunch at La Cabaña del Jerte.",
    },
    extras: [{ concepto: { es: "Comida en La Cabaña del Jerte", en: "Lunch at La Cabaña del Jerte" }, pp: 20 }],
    noIncluye: { es: "Bebidas y extras", en: "Drinks and extras" },
  },
  {
    id: "2027-04",
    destinoId: "jerte",
    temporada: "primavera",
    mes: { es: "Abril", en: "April" },
    fase: "pleno",
    titulo: { es: "Cerezo en flor en los pueblos altos", en: "Blossom up in the high villages" },
    dia: {
      es: "Pleno hacia el 4 de abril; luego la flor aguanta más arriba, en Tornavacas. Ruta a Los Pilones (Garganta de los Infiernos, gratis) y comida en La Cabaña del Jerte.",
      en: "Peak around 4 April; after that the blossom lasts higher up, in Tornavacas. Walk to Los Pilones (Garganta de los Infiernos, free) and lunch at La Cabaña del Jerte.",
    },
    extras: [{ concepto: { es: "Comida en La Cabaña del Jerte", en: "Lunch at La Cabaña del Jerte" }, pp: 20 }],
    noIncluye: { es: "Bebidas y extras", en: "Drinks and extras" },
  },
  {
    id: "2027-06",
    destinoId: "brihuega",
    temporada: "verano",
    mes: { es: "Junio", en: "June" },
    fase: "inicio",
    titulo: { es: "Primeros campos morados", en: "First purple fields" },
    dia: {
      es: "La lavanda empieza a colorear hacia el 15 de junio. Paseo libre por los campos (gratis) al atardecer y menú del día en la Hospedería Princesa Elima.",
      en: "Lavender starts colouring around 15 June. Wander the fields on your own (free) at sunset and have the set lunch at the Hospedería Princesa Elima.",
    },
    // Princesa Elima no publica el precio de su menú: no se suma.
    extras: [],
    noIncluye: {
      es: "Comida en Princesa Elima (20–30 €) y cena en El Kiosko de la Alameda (menos de 35 €)",
      en: "Lunch at Princesa Elima (€20–30) and dinner at El Kiosko de la Alameda (under €35)",
    },
  },
  {
    id: "2027-07",
    destinoId: "brihuega",
    temporada: "verano",
    mes: { es: "Julio", en: "July" },
    fase: "pleno",
    titulo: { es: "Pleno morado y Festival de la Lavanda", en: "Full purple and the Lavender Festival" },
    dia: {
      es: "El pico cae en la primera quincena; la siega empieza a finales de mes. Visita guiada municipal a los campos (vie–dom, 19:00 o 20:30) y menú del día en Princesa Elima.",
      en: "Peak bloom is in the first half of the month; harvest starts at the end. Town-run guided visit to the fields (Fri–Sun, 19:00 or 20:30) and set lunch at Princesa Elima.",
    },
    // Ni la visita guiada ni el menú tienen precio publicado en las fuentes: no se suman.
    extras: [],
    noIncluye: {
      es: "Visita guiada municipal, comida en Princesa Elima (20–30 €) y Festival de la Lavanda",
      en: "Town-run guided visit, lunch at Princesa Elima (€20–30) and the Lavender Festival",
    },
  },
  {
    id: "2026-10",
    destinoId: "tejera-negra",
    temporada: "otono",
    mes: { es: "Octubre", en: "October" },
    fase: "avance",
    titulo: { es: "El hayedo se enciende", en: "The beech forest lights up" },
    dia: {
      es: "El color avanza durante el mes y llega al pleno hacia el 31. Senda de Carretas (unos 6 km, 3 h), comida en Los Bonales y noche en la sierra.",
      en: "Colour builds through the month and peaks around the 31st. Senda de Carretas (about 6 km, 3 h), lunch at Los Bonales and a night in the mountains.",
    },
    aviso: {
      es: "Fines de semana y festivos de otoño: reserva obligatoria del aparcamiento de El Casarejo en la web de la Junta.",
      en: "Autumn weekends and holidays: the El Casarejo car park must be booked on the regional government website.",
    },
    extras: [],
    noIncluye: { es: "Comidas y reserva de aparcamiento", en: "Meals and car park booking" },
  },
  {
    id: "2026-11",
    destinoId: "tejera-negra",
    temporada: "otono",
    mes: { es: "Noviembre", en: "November" },
    fase: "pleno",
    titulo: { es: "Último color antes del invierno", en: "Last colour before winter" },
    dia: {
      es: "Pleno hasta la primera semana; después cae la hoja. Mañana en el hayedo, tarde en Valverde de los Arroyos y paseo a las Chorreras de Despeñalagua.",
      en: "Peak until the first week; then the leaves drop. Morning in the beech forest, afternoon in Valverde de los Arroyos and a walk to the Despeñalagua waterfalls.",
    },
    aviso: {
      es: "Fines de semana y festivos de otoño: reserva obligatoria del aparcamiento de El Casarejo en la web de la Junta.",
      en: "Autumn weekends and holidays: the El Casarejo car park must be booked on the regional government website.",
    },
    extras: [],
    noIncluye: { es: "Comidas y reserva de aparcamiento", en: "Meals and car park booking" },
  },
];

// Presupuesto de una opción para un grupo:
//   habitaciones = las pedidas o, si el grupo no cabe, las que hacen falta (`cap` por habitación)
//   alojamiento  = tarifa × noches (por habitación o por persona, según se publique)
//   extras       = extras con precio × adultos (menús y visitas infantiles no tienen precio publicado)
function cotizar(op, mes, { adultos = 2, ninos = 0, habs = 1, noches = 1 } = {}) {
  const personas = adultos + ninos,
    cap = op.cap ?? 2,
    habitaciones = Math.max(habs, Math.ceil(personas / cap)),
    alojamiento = op.pp ? op.pp * personas * noches : op.noche * habitaciones * noches,
    extras = mes.extras.reduce((s, e) => s + e.pp, 0) * adultos,
    total = alojamiento + extras;
  return {
    alojamiento,
    extras,
    total,
    porPersona: total / personas,
    habitaciones,
    ajustado: habitaciones > habs,
  };
}

// La opción más barata para el grupo.
function masBarata(destinoId, mes, grupo) {
  return opciones[destinoId]
    .map((op) => ({ op, q: cotizar(op, mes, grupo) }))
    .sort((x, y) => x.q.total - y.q.total)[0];
}

export { alojamientos, cotizar, masBarata, meses, opciones };
