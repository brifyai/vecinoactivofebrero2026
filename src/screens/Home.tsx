import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Shield, 
  Bell, 
  Users, 
  Calendar, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  Map,
  AlertTriangle,
  Store,
  HandHeart,
  Vote,
  Clock,
  Star,
  Building,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BackgroundProvider } from '../components/BackgroundProvider';
import { SEO, PAGE_SEO } from '../components/SEO';
import { useDailyBackground } from '../hooks/useDailyBackground';
import { useImageContrast } from '../hooks/useImageContrast';

export function Home() {
  const navigate = useNavigate();

  // Scroll al inicio al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Obtener imagen de fondo diaria
  const { imageUrl, isLoading: isLoadingImage } = useDailyBackground({
    query: 'landscape,nature,mountain,forest,lake,valley',
    orientation: 'landscape'
  });

  // Analizar contraste de la imagen
  const { contrast, isLoading: isLoadingContrast } = useImageContrast(imageUrl);

  // Aplicar estilos dinámicos basados en el contraste
  useEffect(() => {
    if (!isLoadingImage && !isLoadingContrast && imageUrl) {
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.documentElement.style.setProperty('--dynamic-text-color', contrast.textColor);
      document.documentElement.style.setProperty('--dynamic-overlay-color', contrast.overlayColor);
      document.body.style.setProperty('--overlay-color', contrast.overlayColor);
    }
  }, [imageUrl, contrast, isLoadingImage, isLoadingContrast]);

  const features = [
    {
      icon: <Map className="w-7 h-7" aria-hidden="true" />,
      title: 'CONEXIÓN VECINAL',
      subtitle: 'Geolocalización',
      description: 'Unidad Vecinal • Mapa Interactivo',
      color: 'emerald',
    },
    {
      icon: <AlertTriangle className="w-7 h-7" aria-hidden="true" />,
      title: 'SEGURIDAD Y EMERGENCIAS',
      subtitle: 'Alertas Comunitarias',
      description: 'Botón de Pánico • Reportes',
      color: 'rose',
    },
    {
      icon: <Store className="w-7 h-7" aria-hidden="true" />,
      title: 'NEGOCIOS LOCALES',
      subtitle: 'Directorio Comercial',
      description: 'Economía Local • Pymes',
      color: 'amber',
    },
  ];

  const stats = [
    { value: '14.5M', label: 'Habitantes' },
    { value: '4.5M', label: 'Hogares' },
    { value: '100%', label: 'Verificados' },
    { value: '24/7', label: 'Actividad' },
  ];

  const communityCards = [
    {
      icon: <HandHeart className="w-6 h-6" aria-hidden="true" />,
      title: 'AYUDA VECINAL',
      subtitle: 'Necesidades Locales y Recursos',
      rating: '4.9',
      items: ['Solicitudes activas', 'Búsqueda de habilidades'],
      buttonText: 'Pedir Ayuda',
      coordinator: 'Coordinador: A. Clark',
    },
    {
      icon: <Vote className="w-6 h-6" aria-hidden="true" />,
      title: 'PARTICIPACIÓN',
      subtitle: 'Votaciones y Encuestas Ciudadanas',
      rating: '5.0',
      items: ['Decisiones colectivas', 'Proyectos'],
      buttonText: 'Participar',
      coordinator: 'Moderador: P. Bush',
    },
  ];

  const news = [
    {
      category: 'FUNCIONALIDAD',
      title: 'Nuevo Mapa de Delitos y Seguridad',
      description: 'Ahora puedes reportar incidentes de seguridad en tiempo real y ver las zonas con mayor actividad para tomar precauciones...',
      time: 'Hace 2 horas',
      comments: 18,
      author: 'Admin',
    },
    {
      category: 'HISTORIA',
      title: 'Éxito Comunitario: La Nueva Huerta Vecinal',
      description: 'Gracias a la organización de los vecinos de la Unidad 4, el sitio eriazo se ha convertido en un espacio verde productivo...',
      time: 'Ayer',
      comments: 34,
      author: 'Carlos M.',
    },
  ];

  // Determinar si usar texto oscuro o claro basado en el contraste
  const textClass = contrast.isDark ? 'text-slate-200' : 'text-slate-800';
  const textMutedClass = contrast.isDark ? 'text-gray-400' : 'text-gray-600';
  const textWhiteClass = contrast.isDark ? 'text-white' : 'text-slate-900';

  return (
    <BackgroundProvider>
      {/* SEO Component */}
      <SEO {...PAGE_SEO.home} />
      
      <div className={`min-h-screen ${textClass} selection:bg-emerald-500/30`}>
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-500 text-white px-4 py-2 rounded-lg z-[100]"
        >
          Saltar al contenido principal
        </a>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30" aria-hidden="true">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className={`text-xl font-bold ${textWhiteClass}`}>Vecino Activo</span>
                </div>
              </div>
              <nav aria-label="Navegación principal">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className={`px-4 py-2 ${textMutedClass} hover:text-white transition-colors text-sm lg:text-base`}
                    aria-label="Iniciar sesión en tu cuenta"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 lg:px-6 lg:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors text-sm lg:text-base"
                    aria-label="Crear una cuenta nueva"
                  >
                    Comenzar
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" role="main">
          {/* Hero Section */}
          <section className="pt-32 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-title">
            <div className="max-w-7xl mx-auto text-center">
              <h1 id="hero-title" className={`text-3xl sm:text-4xl lg:text-6xl font-bold ${textWhiteClass} mb-6 leading-tight`}>
                Conecta con tu Barrio y
                <span className="text-emerald-400 block">Transforma tu Comunidad Digital</span>
              </h1>
              <p className={`text-lg lg:text-xl ${textMutedClass} max-w-2xl mx-auto mb-8`}>
                La plataforma digital que une a los vecinos de Chile. Seguridad, eventos, negocios locales y participación ciudadana en un solo lugar.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-12 max-w-4xl mx-auto" role="list" aria-label="Estadísticas de la comunidad">
                {stats.map((stat, index) => (
                  <Card key={index} className="p-4 lg:p-6 text-center" role="listitem">
                    <div className="text-2xl lg:text-4xl font-bold text-emerald-400 mb-1" aria-label={stat.value}>{stat.value}</div>
                    <div className={`${textMutedClass} text-sm`}>{stat.label}</div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8" aria-labelledby="features-title">
            <div className="max-w-7xl mx-auto">
              <h2 id="features-title" className={`text-2xl lg:text-3xl font-bold ${textWhiteClass} mb-8 text-center`}>
                Características Principales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
                {features.map((feature, index) => (
                  <article
                    key={index}
                    className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-default"
                    role="listitem"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${
                      feature.color === 'emerald' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                        : feature.color === 'rose'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                    }`} aria-hidden="true">
                      {feature.icon}
                    </div>
                    <h3 className={`text-sm font-bold ${textMutedClass} mb-1`}>{feature.title}</h3>
                    <h4 className={`text-lg font-semibold ${textWhiteClass} mb-2`}>{feature.subtitle}</h4>
                    <p className={`${textMutedClass} text-sm`}>{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Transform Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8" aria-labelledby="transform-title">
            <div className="max-w-7xl mx-auto">
              <Card className="p-8 lg:p-12 text-center border-emerald-500/30 bg-emerald-500/10">
                <h2 id="transform-title" className={`text-2xl lg:text-3xl font-bold ${textWhiteClass} mb-6`}>
                  Transformamos vecindarios físicos en comunidades digitales activas
                </h2>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8" role="list">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl" role="listitem">
                    <Building className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    <span className={`${textWhiteClass} font-medium`}>Únete a tu Junta de Vecinos</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl" role="listitem">
                    <MapPin className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    <span className={`${textWhiteClass} font-medium`}>CHILE Conectado</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl" role="listitem">
                    <Users className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                    <span className={`${textWhiteClass} font-medium`}>Hub Comunitario</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                  aria-label="Comienza a usar Vecino Activo ahora"
                >
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </Card>
            </div>
          </section>

          {/* Community Cards Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8" aria-labelledby="community-title">
            <div className="max-w-7xl mx-auto">
              <h2 id="community-title" className={`text-2xl lg:text-3xl font-bold ${textWhiteClass} mb-8 text-center`}>
                Participa en tu Comunidad
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {communityCards.map((card, index) => (
                  <article key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20" aria-hidden="true">
                          {card.icon}
                        </div>
                        <div>
                          <h3 className={`text-sm font-bold ${textMutedClass}`}>{card.title}</h3>
                          <p className={`${textWhiteClass} font-medium`}>{card.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-lg" aria-label={`Calificación: ${card.rating} de 5 estrellas`}>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                        <span className={`${textWhiteClass} font-bold text-sm`}>{card.rating}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {card.items.map((item, i) => (
                        <li key={i} className={`flex items-center gap-2 ${textClass} text-sm`}>
                          <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors">
                        {card.buttonText}
                      </button>
                      <span className={`${textMutedClass} text-sm`}>{card.coordinator}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Event Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8" aria-labelledby="event-title">
            <div className="max-w-7xl mx-auto">
              <article className="p-6 rounded-2xl border-amber-500/30 bg-amber-500/10 border border-white/10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30" aria-hidden="true">
                      <Calendar className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-amber-400 text-sm font-medium mb-1">Próximo Sábado</p>
                      <h3 id="event-title" className={`text-xl font-bold ${textWhiteClass}`}>Gran Asamblea General de Seguridad Vecinal</h3>
                      <p className={`${textMutedClass} text-sm`}>
                        <MapPin className="w-4 h-4 inline mr-1" aria-hidden="true" />
                        Sede Social, Tu Barrio • Comité de Seguridad
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors whitespace-nowrap">
                    Confirmar Asistencia
                  </button>
                </div>
              </article>
            </div>
          </section>

          {/* News Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8" aria-labelledby="news-title">
            <div className="max-w-7xl mx-auto">
              <h2 id="news-title" className={`text-2xl lg:text-3xl font-bold ${textWhiteClass} mb-8`}>
                Noticias del Barrio
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {news.map((item, index) => (
                  <article key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <h3 className={`text-lg font-bold ${textWhiteClass} mt-3 mb-2`}>{item.title}</h3>
                    <p className={`${textMutedClass} text-sm mb-4 line-clamp-2`}>{item.description}</p>
                    <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {item.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" aria-hidden="true" />
                          {item.comments} Comentarios
                        </span>
                      </div>
                      <span>Por {item.author}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
            <div className="max-w-4xl mx-auto text-center">
              <h2 id="cta-title" className={`text-2xl lg:text-4xl font-bold ${textWhiteClass} mb-4`}>
                ¿Listo para conectar con tu comunidad?
              </h2>
              <p className={`${textClass} mb-8 max-w-xl mx-auto`}>
                Únete a miles de vecinos que ya están usando Vecino Activo para mantenerse informados y seguros.
              </p>
              
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-300 text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 inline-flex items-center gap-2"
                aria-label="Crear una cuenta gratuita en Vecino Activo"
              >
                Crear Cuenta Gratis
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 backdrop-blur-sm bg-black/20" role="contentinfo">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30" aria-hidden="true">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className={`text-xl font-bold ${textWhiteClass}`}>Vecino Activo</span>
                </div>
                <p className={`${textMutedClass} text-sm max-w-md mb-4`}>
                  La plataforma digital que conecta vecinos en Chile. Seguridad, participación ciudadana y comunidad en un solo lugar.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://facebook.com/vecinoactivo" target="_blank" rel="noopener noreferrer" className={`${textMutedClass} hover:text-emerald-400 transition-colors`} aria-label="Síguenos en Facebook">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com/vecinoactivo" target="_blank" rel="noopener noreferrer" className={`${textMutedClass} hover:text-emerald-400 transition-colors`} aria-label="Síguenos en Twitter">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com/vecinoactivo" target="_blank" rel="noopener noreferrer" className={`${textMutedClass} hover:text-emerald-400 transition-colors`} aria-label="Síguenos en Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              {/* Links */}
              <nav aria-label="Enlaces del pie de página">
                <h3 className={`font-semibold ${textWhiteClass} mb-4`}>Enlaces</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => navigate('/eventos')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Eventos</button></li>
                  <li><button onClick={() => navigate('/seguridad')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Seguridad</button></li>
                  <li><button onClick={() => navigate('/servicios')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Servicios</button></li>
                  <li><button onClick={() => navigate('/mapa')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Mapa</button></li>
                </ul>
              </nav>
              
              {/* Legal */}
              <nav aria-label="Enlaces legales">
                <h3 className={`font-semibold ${textWhiteClass} mb-4`}>Legal</h3>
                <ul className="space-y-2">
                  <li><button onClick={() => navigate('/terminos')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Términos</button></li>
                  <li><button onClick={() => navigate('/privacidad')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Privacidad</button></li>
                  <li><button onClick={() => navigate('/contacto')} className={`${textMutedClass} hover:text-white transition-colors text-sm`}>Contacto</button></li>
                </ul>
              </nav>
            </div>
            
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className={`${textMutedClass} text-sm`}>
                © {new Date().getFullYear()} Vecino Activo. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <a href="tel:+56912345678" className={`flex items-center gap-1 ${textMutedClass} hover:text-white transition-colors`}>
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  +56 9 1234 5678
                </a>
                <a href="mailto:contacto@vecinoactivo.cl" className={`flex items-center gap-1 ${textMutedClass} hover:text-white transition-colors`}>
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  contacto@vecinoactivo.cl
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BackgroundProvider>
  );
}
