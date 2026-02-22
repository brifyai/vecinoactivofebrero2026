import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Users, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { BackgroundProvider } from '../components/BackgroundProvider';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigate = useNavigate();

  // Scroll al inicio al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    if (!password.trim()) {
      setError('Por favor, ingresa tu contraseña');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Credenciales incorrectas. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundProvider>
      <div className="min-h-screen flex items-center justify-center p-4 text-slate-200 selection:bg-emerald-500/30">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>

          <Card className="p-6 lg:p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-400 text-center mb-6">
              Bienvenido de vuelta a tu comunidad
            </p>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-600 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  Recordarme
                </label>
                <button
                  type="button"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-gray-400 text-center mb-2">Credenciales de prueba:</p>
              <p className="text-xs text-gray-300 text-center">
                <span className="text-emerald-400">Email:</span> demo@vecino.cl
              </p>
              <p className="text-xs text-gray-300 text-center">
                <span className="text-emerald-400">Contraseña:</span> demo123
              </p>
            </div>
          </Card>
        </div>
      </div>
    </BackgroundProvider>
  );
}
