// Configuración de despliegue. Es lo ÚNICO que hay que tocar para publicar la web.
// Las claves de EmailJS son públicas por diseño (se ven en el navegador): protege la
// cuenta limitando los dominios permitidos en el panel de EmailJS (Account → Security).

const config = {
  // URL pública final, sin barra al final. Se usa en los correos (enlaces de vuelta).
  siteUrl: "https://TU-DOMINIO.es",

  // true solo en local: muestra cuentas de prueba, casos de prueba del alta de negocio
  // y el panel interno (#admin). En producción, false.
  demo: false,

  emailjs: {
    // EmailJS → Account → General → Public Key
    publicKey: "",
    // EmailJS → Email Services → Service ID
    serviceId: "",
    templates: {
      // Plantilla que recibe el equipo con cada formulario (emailjs/equipo.html)
      equipo: "",
      // Plantilla de confirmación que recibe quien rellena el formulario (emailjs/usuario.html)
      usuario: "",
    },
  },
};

const emailConfigurado = () =>
  !!(config.emailjs.publicKey && config.emailjs.serviceId && config.emailjs.templates.equipo);

export { config, emailConfigurado };
