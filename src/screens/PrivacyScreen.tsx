import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Shield,
  CheckCircle,
  Lock,
  Eye,
  Database,
  UserCheck,
  Bell,
  Trash2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BackgroundProvider } from '../components/BackgroundProvider';

export function PrivacyScreen() {
  const navigate = useNavigate();

  // Scroll al inicio al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <Database className="w-5 h-5" />,
      title: '1. Información que Recopilamos',
      content: `Recopilamos información que usted nos proporciona directamente al:

• Crear una cuenta (nombre, email, teléfono, dirección)
• Completar su perfil de usuario
• Participar en actividades comunitarias
• Enviar formularios de contacto o soporte
• Publicar contenido en la plataforma

También recopilamos información de manera automática:
• Datos de ubicación (con su permiso)
• Información del dispositivo y navegador
• Estadísticas de uso de la plataforma
• Cookies y tecnologías similares`
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: '2. Cómo Utilizamos su Información',
      content: `Utilizamos su información personal para:

• Proporcionar y mejorar nuestros servicios
• Facilitar la comunicación entre vecinos
• Enviar notificaciones relevantes sobre su comunidad
• Personalizar su experiencia en la plataforma
• Garantizar la seguridad de la comunidad
• Cumplir con obligaciones legales
• Enviar comunicaciones de servicio (no promocionales)

Nunca vendemos su información personal a terceros.`
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: '3. Compartición de Información',
      content: `Podemos compartir su información en las siguientes circunstancias:

• Con otros usuarios: Solo la información que usted hace pública en su perfil
• Con autoridades: Cuando sea requerido por ley o para proteger la seguridad
• Con proveedores de servicios: Empresas que nos ayudan a operar la plataforma
• En caso de fusión o adquisición: Con la entidad resultante

Los proveedores de servicios están obligados a proteger su información y solo pueden utilizarla para los fines especificados.`
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: '4. Seguridad de los Datos',
      content: `Implementamos medidas de seguridad técnicas y organizativas para proteger su información:

• Encriptación de datos en tránsito y en reposo
• Autenticación segura de usuarios
• Acceso restringido a datos personales
• Monitoreo continuo de seguridad
• Copias de seguridad regulares

Aunque nos esforzamos por proteger sus datos, ningún método de transmisión por internet es 100% seguro.`
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: '5. Sus Derechos de Privacidad',
      content: `Como usuario, usted tiene derecho a:

• Acceder a sus datos personales
• Rectificar información incorrecta
• Solicitar la eliminación de sus datos
• Oponerse a ciertos tratamientos de datos
• Solicitar la portabilidad de sus datos
• Retirar su consentimiento en cualquier momento
• Presentar una reclamación ante la autoridad de protección de datos

Para ejercer estos derechos, contáctenos a privacidad@vecinoactivo.cl`
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: '6. Notificaciones y Comunicaciones',
      content: `Puede controlar las notificaciones que recibe:

• Notificaciones de seguridad: Siempre activas para su protección
• Alertas comunitarias: Configurables según sus preferencias
• Noticias y eventos: Puede activar o desactivar
• Comunicaciones de servicio: Necesarias para el funcionamiento

Puede ajustar sus preferencias en la sección de Configuración de su cuenta.`
    },
    {
      icon: <Trash2 className="w-5 h-5" />,
      title: '7. Retención y Eliminación de Datos',
      content: `Conservamos sus datos mientras:

• Su cuenta esté activa
• Sea necesario para proporcionar los servicios
• Sea requerido por ley

Al eliminar su cuenta:
• Sus datos personales se eliminan en un plazo de 30 días
• El contenido público puede conservarse de forma anónima
• Algunos datos pueden conservarse por obligaciones legales`
    },
    {
      title: '8. Cookies y Tecnologías Similares',
      content: `Utilizamos cookies para:

• Mantener su sesión activa
• Recordar sus preferencias
• Analizar el uso de la plataforma
• Mejorar nuestros servicios

Puede configurar su navegador para rechazar cookies, pero algunas funcionalidades pueden no estar disponibles.

Tipos de cookies que utilizamos:
• Cookies esenciales: Necesarias para el funcionamiento
• Cookies de preferencias: Recuerdan sus configuraciones
• Cookies analíticas: Nos ayudan a mejorar la plataforma`
    },
    {
      title: '9. Ubicación Geográfica',
      content: `La funcionalidad de mapa y ubicación requiere acceso a su ubicación:

• Solo se accede con su permiso explícito
• Se utiliza para mostrar su unidad vecinal
• Puede desactivarse en cualquier momento
• Los datos de ubicación no se comparten con terceros

La ubicación precisa nunca se muestra a otros usuarios sin su consentimiento.`
    },
    {
      title: '10. Privacidad de Menores',
      content: `Vecino Activo no está dirigido a menores de 14 años. No recopilamos intencionalmente información de menores.

Si detectamos que hemos recopilado información de un menor sin consentimiento parental, eliminaremos dicha información de inmediato.

Padres o tutores que detecten que un menor ha creado una cuenta deben contactarnos a privacidad@vecinoactivo.cl`
    },
    {
      title: '11. Transferencias Internacionales',
      content: `Sus datos pueden ser procesados en servidores ubicados fuera de Chile. En tales casos:

• Aplicamos las mismas protecciones de privacidad
• Utilizamos cláusulas contractuales estándar
• Cumplimos con las regulaciones de transferencia de datos

Siempre protegeremos su información según estos estándares, independientemente de dónde se procese.`
    },
    {
      title: '12. Cambios a esta Política',
      content: `Podemos actualizar esta Política de Privacidad periódicamente. Los cambios significativos serán notificados:

• A través de un aviso en la plataforma
• Por correo electrónico
• Con al menos 30 días de anticipación

Le recomendamos revisar esta política regularmente para estar informado sobre cómo protegemos su información.`
    },
    {
      title: '13. Contacto',
      content: `Para consultas sobre privacidad o para ejercer sus derechos:

• Email: privacidad@vecinoactivo.cl
• Formulario: vecinoactivo.cl/contacto
• Dirección: Santiago, Chile

Responderemos a su solicitud en un plazo máximo de 30 días.`
    }
  ];

  return (
    <BackgroundProvider>
      <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xl font-bold text-white">Vecino Activo</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 lg:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Política de Privacidad
              </h1>
              <p className="text-gray-400">
                Última actualización: Febrero 2026
              </p>
            </div>

            {/* Intro */}
            <Card className="p-6 mb-8 border-emerald-500/30 bg-emerald-500/10">
              <p className="text-gray-300 text-sm leading-relaxed">
                En Vecino Activo, nos tomamos muy en serio la protección de su privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, compartimos y protegemos su información personal cuando utiliza nuestra plataforma de participación ciudadana.
              </p>
            </Card>

            {/* Content */}
            <Card className="p-6 lg:p-8">
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={index} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      {section.icon ? (
                        <span className="w-5 h-5 text-emerald-400 flex-shrink-0">{section.icon}</span>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {section.title}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Footer note */}
            <p className="text-center text-gray-500 text-sm mt-8">
              Al utilizar Vecino Activo, usted acepta las prácticas descritas en esta Política de Privacidad.
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/10 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-500 text-sm">
              © 2026 Vecino Activo. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </BackgroundProvider>
  );
}
