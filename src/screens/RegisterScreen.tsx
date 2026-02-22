import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Lock, User, Phone, MapPin, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BackgroundProvider } from '../components/BackgroundProvider';

interface RegisterScreenProps {
  onRegister?: (name: string, email: string, password: string, phone: string, address: string) => Promise<boolean>;
}

export function RegisterScreen({ onRegister }: RegisterScreenProps) {
  const navigate = useNavigate();

  // Scroll al inicio al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Por favor completa todos los campos');
        return;
      }
      setStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      if (onRegister) {
        const success = await onRegister(
          formData.name,
          formData.email,
          formData.password,
          formData.phone,
          formData.address
        );
        if (!success) {
          setError('No se pudo completar el registro');
        }
      } else {
        // Simular registro exitoso
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/login');
      }
    } catch {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <BackgroundProvider>
      <div className="min-h-screen flex items-center justify-center p-4 text-slate-200 selection:bg-emerald-500/30">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => step === 1 ? navigate('/') : setStep(1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <Card className="p-6 lg:p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Crear Cuenta
            </h1>
            <p className="text-gray-400 text-center mb-6">
              {step === 1 ? 'Paso 1: Información Personal' : 'Paso 2: Crear Contraseña'}
            </p>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
              <div className={`w-12 h-1 rounded ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-600'}`} />
            </div>

            {error && (
              <div className="bg-rose-500/20 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="+56 9 1234 5678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Dirección (opcional)
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Tu dirección"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Repite tu contraseña"
                      required
                    />
                  </div>

                  {/* Password requirements */}
                  <div className="bg-white/5 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-gray-400 mb-2">La contraseña debe tener:</p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${formData.password.length >= 6 ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className={formData.password.length >= 6 ? 'text-emerald-400' : 'text-gray-500'}>
                        Al menos 6 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${formData.password === formData.confirmPassword && formData.password.length > 0 ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className={formData.password === formData.confirmPassword && formData.password.length > 0 ? 'text-emerald-400' : 'text-gray-500'}>
                        Las contraseñas coinciden
                      </span>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : step === 1 ? (
                  'Continuar'
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Inicia Sesión
                </button>
              </p>
            </div>
          </Card>

          {/* Terms */}
          <p className="text-center text-gray-500 text-xs mt-6">
            Al registrarte, aceptas nuestros{' '}
            <button onClick={() => navigate('/terminos')} className="text-emerald-400 hover:text-emerald-300">
              Términos de Servicio
            </button>{' '}
            y{' '}
            <button onClick={() => navigate('/privacidad')} className="text-emerald-400 hover:text-emerald-300">
              Política de Privacidad
            </button>
          </p>
        </div>
      </div>
    </BackgroundProvider>
  );
}
