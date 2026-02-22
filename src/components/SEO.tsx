import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event' | 'business';
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'Vecino Activo - Conecta con tu Barrio | Comunidad Digital Chile',
  description: 'Vecino Activo es la plataforma digital que conecta vecinos en Chile. Reporta incidentes de seguridad, participa en eventos comunitarios, descubre negocios locales y mantente informado sobre tu barrio.',
  keywords: 'vecinos, comunidad, junta de vecinos, seguridad vecinal, Chile, unidades vecinales, alertas comunitarias, eventos barrio, negocios locales',
  image: 'https://vecinoactivo.cl/og-image.jpg',
  url: 'https://vecinoactivo.cl/',
  type: 'website' as const,
};

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const seo = {
    title: title ? `${title} | Vecino Activo` : DEFAULT_SEO.title,
    description: description || DEFAULT_SEO.description,
    keywords: keywords || DEFAULT_SEO.keywords,
    image: image || DEFAULT_SEO.image,
    url: url || DEFAULT_SEO.url,
    type,
  };

  useEffect(() => {
    // Update document title
    document.title = seo.title;

    // Helper function to update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update basic meta tags
    updateMeta('description', seo.description);
    updateMeta('keywords', seo.keywords);
    
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Update Open Graph tags
    updateMeta('og:title', seo.title, true);
    updateMeta('og:description', seo.description, true);
    updateMeta('og:image', seo.image, true);
    updateMeta('og:url', seo.url, true);
    updateMeta('og:type', seo.type, true);

    // Update Twitter tags
    updateMeta('twitter:title', seo.title, true);
    updateMeta('twitter:description', seo.description, true);
    updateMeta('twitter:image', seo.image, true);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = seo.url;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = seo.url;
      document.head.appendChild(canonical);
    }

  }, [seo, noindex]);

  return null;
}

// Preset SEO configurations for different pages
export const PAGE_SEO = {
  home: {
    title: undefined, // Use default
    description: 'Vecino Activo es la plataforma digital que conecta vecinos en Chile. Reporta incidentes de seguridad, participa en eventos comunitarios, descubre negocios locales y mantente informado sobre tu barrio.',
    keywords: 'vecinos, comunidad, junta de vecinos, seguridad vecinal, Chile, unidades vecinales, alertas comunitarias, eventos barrio, negocios locales, participación ciudadana',
  },
  login: {
    title: 'Iniciar Sesión',
    description: 'Accede a tu cuenta de Vecino Activo para conectarte con tu comunidad, ver alertas de seguridad y participar en eventos de tu barrio.',
    keywords: 'login, iniciar sesión, cuenta vecino, acceso comunidad',
    noindex: true,
  },
  register: {
    title: 'Crear Cuenta',
    description: 'Únete a Vecino Activo y conecta con tu comunidad. Registro gratuito para vecinos de Chile. Participa en eventos, reporta alertas y descubre negocios locales.',
    keywords: 'registro, crear cuenta, unirse comunidad, vecinos Chile, registro gratis',
  },
  dashboard: {
    title: 'Panel Principal',
    description: 'Tu panel de comunidad. Mira las últimas actividades, alertas de seguridad y eventos próximos en tu unidad vecinal.',
    keywords: 'dashboard, panel, actividades, alertas, eventos',
    noindex: true,
  },
  noticias: {
    title: 'Noticias y Feed',
    description: 'Mantente informado con las últimas noticias y publicaciones de tu barrio. Comparte información con tus vecinos.',
    keywords: 'noticias, feed, publicaciones, información barrio, comunidad',
  },
  eventos: {
    title: 'Eventos Comunitarios',
    description: 'Descubre y participa en eventos de tu comunidad. Asambleas, ferias, talleres y actividades deportivas en tu barrio.',
    keywords: 'eventos, actividades, asambleas, ferias, talleres, deportes, comunidad',
  },
  seguridad: {
    title: 'Seguridad Vecinal',
    description: 'Reporta incidentes de seguridad, activa alertas SOS y mantente informado sobre la seguridad de tu barrio. Contactos de emergencia y plan cuadrante.',
    keywords: 'seguridad, alertas, SOS, emergencias, plan cuadrante, carabineros, incidentes',
  },
  servicios: {
    title: 'Servicios y Negocios Locales',
    description: 'Directorio de negocios y servicios en tu barrio. Encuentra almacenes, gasfiteros, panaderías, farmacias y más. Apoya el comercio local.',
    keywords: 'negocios, servicios, comercio local, almacenes, farmacias, directorio, PYMES',
  },
  mapa: {
    title: 'Mapa de Unidades Vecinales',
    description: 'Explora el mapa interactivo de unidades vecinales de Chile. Encuentra tu barrio y descubre información sobre tu comunidad.',
    keywords: 'mapa, unidades vecinales, geolocalización, Chile, barrios',
  },
  terminos: {
    title: 'Términos de Servicio',
    description: 'Términos y condiciones de uso de la plataforma Vecino Activo. Lee nuestras políticas de uso y condiciones de servicio.',
    keywords: 'términos, condiciones, políticas, uso, servicio',
  },
  privacidad: {
    title: 'Política de Privacidad',
    description: 'Política de privacidad y protección de datos de Vecino Activo. Conoce cómo protegemos tu información personal.',
    keywords: 'privacidad, protección datos, información personal, políticas',
  },
  contacto: {
    title: 'Contacto',
    description: 'Contacta con el equipo de Vecino Activo. Envíanos tus consultas, sugerencias o reportes. Estamos aquí para ayudarte.',
    keywords: 'contacto, soporte, ayuda, consultas, sugerencias',
  },
};
