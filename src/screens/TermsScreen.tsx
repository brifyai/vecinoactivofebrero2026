import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BackgroundProvider } from '../components/BackgroundProvider';

export function TermsScreen() {
  const navigate = useNavigate();

  // Scroll al inicio al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: '1. Aceptación de los Términos',
      content: `Al acceder y utilizar la plataforma Vecino Activo, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no deberá utilizar nuestros servicios.

Vecino Activo es una plataforma de participación ciudadana diseñada para fortalecer la comunicación entre vecinos, mejorar la seguridad comunitaria y facilitar la organización de actividades locales.`
    },
    {
      title: '2. Registro de Cuenta',
      content: `Para utilizar ciertas funcionalidades de la plataforma, deberá crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de:

• Mantener la confidencialidad de su contraseña
• Proporcionar información personal correcta
• Actualizar sus datos cuando sea necesario
• Notificar cualquier uso no autorizado de su cuenta

Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos.`
    },
    {
      title: '3. Uso Aceptable',
      content: `Los usuarios se comprometen a utilizar la plataforma de manera responsable y respetuosa. Está prohibido:

• Publicar contenido ofensivo, discriminatorio o ilegal
• Suplantar la identidad de otras personas
• Compartir información privada de terceros sin consentimiento
• Utilizar la plataforma para actividades comerciales no autorizadas
• Interferir con el funcionamiento normal de la plataforma
• Realizar actividades que puedan dañar la reputación de la comunidad`
    },
    {
      title: '4. Contenido del Usuario',
      content: `Usted es el único responsable del contenido que publica en la plataforma. Al publicar contenido, usted declara que:

• Es el autor original o tiene los derechos necesarios
• El contenido no viola derechos de terceros
• Autoriza a Vecino Activo a mostrar y distribuir dicho contenido

Nos reservamos el derecho de eliminar contenido que viole estos términos sin previo aviso.`
    },
    {
      title: '5. Privacidad y Protección de Datos',
      content: `El tratamiento de sus datos personales se rige por nuestra Política de Privacidad. Vecino Activo se compromete a:

• Proteger la información personal de los usuarios
• Utilizar los datos únicamente para los fines especificados
• Implementar medidas de seguridad adecuadas
• Cumplir con la legislación chilena sobre protección de datos

Para más detalles, consulte nuestra Política de Privacidad.`
    },
    {
      title: '6. Seguridad Comunitaria',
      content: `La funcionalidad de alertas y seguridad está diseñada para situaciones de emergencia real. El uso indebido de estas funciones incluye:

• Reportar alertas falsas o engañosas
• Utilizar el botón de pánico para situaciones no urgentes
• Proporcionar información falsa sobre incidentes

El mal uso de estas funciones puede resultar en la suspensión permanente de su cuenta.`
    },
    {
      title: '7. Propiedad Intelectual',
      content: `Todos los derechos de propiedad intelectual sobre la plataforma, incluyendo software, diseños, marcas y contenido original, pertenecen a Vecino Activo.

Los usuarios conservan los derechos sobre su contenido, pero otorgan a Vecino Activo una licencia no exclusiva para usar, mostrar y distribuir dicho contenido en relación con los servicios de la plataforma.`
    },
    {
      title: '8. Limitación de Responsabilidad',
      content: `Vecino Activo no se hace responsable por:

• Contenido publicado por terceros
• Daños directos o indirectos derivados del uso de la plataforma
• Interrupciones del servicio por causas ajenas a nuestro control
• Acciones de otros usuarios que violen estos términos

La plataforma se proporciona "tal cual" sin garantías de ningún tipo.`
    },
    {
      title: '9. Modificaciones',
      content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma o por correo electrónico.

El uso continuado de la plataforma después de las modificaciones constituye la aceptación de los nuevos términos.`
    },
    {
      title: '10. Terminación',
      content: `Podemos suspender o terminar su acceso a la plataforma si:

• Viola estos términos de servicio
• Utiliza la plataforma de manera fraudulenta
• Realiza actividades ilegales a través de la plataforma

Usted puede solicitar la eliminación de su cuenta en cualquier momento a través de la configuración de su perfil.`
    },
    {
      title: '11. Legislación Aplicable',
      content: `Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa será resuelta por los tribunales competentes de Santiago de Chile.`
    },
    {
      title: '12. Contacto',
      content: `Para consultas sobre estos términos, puede contactarnos a través de:

• Email: legal@vecinoactivo.cl
• Formulario de contacto: vecinoactivo.cl/contacto
• Dirección: Santiago, Chile`
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
                <FileText className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Términos de Servicio
              </h1>
              <p className="text-gray-400">
                Última actualización: Febrero 2026
              </p>
            </div>

            {/* Content */}
            <Card className="p-6 lg:p-8">
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={index} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
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
              Al utilizar Vecino Activo, usted confirma que ha leído y acepta estos términos.
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
