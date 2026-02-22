import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Send,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BackgroundProvider } from '../components/BackgroundProvider';

export function ContactScreen() {
  const navigate = useNavigate();

  // Scroll al inicio al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Email',
      value: 'contacto@vecinoactivo.cl',
      description: 'Respuesta en 24-48 horas',
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: 'Teléfono',
      value: '+56 2 2345 6789',
      description: 'Lun-Vie 9:00 - 18:00',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Oficina Central',
      value: 'Santiago, Chile',
      description: 'Solo con cita previa',
    },
  ];

  const subjects = [
    'Consulta general',
    'Soporte técnico',
    'Sugerencia',
    'Reporte de problema',
    'Colaboración',
    'Otro',
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                Contáctanos
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                ¿Tienes preguntas o sugerencias? Estamos aquí para ayudarte. 
                Completa el formulario y te responderemos a la brevedad.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{info.title}</h3>
                        <p className="text-emerald-400 text-sm">{info.value}</p>
                        <p className="text-gray-500 text-xs mt-1">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Response time */}
                <Card className="p-5 border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-medium">Tiempo de respuesta</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Nos comprometemos a responder todas las consultas en un máximo de 48 horas hábiles.
                  </p>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="p-6 lg:p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        ¡Mensaje enviado!
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Gracias por contactarnos. Te responderemos pronto.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                      >
                        Enviar otro mensaje
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Users className="w-4 h-4 inline mr-2" />
                            Nombre completo
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          Asunto
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-slate-800">Selecciona un asunto</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject} className="bg-slate-800">
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mensaje
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                          placeholder="Escribe tu mensaje aquí..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Enviar Mensaje
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </Card>
              </div>
            </div>
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
