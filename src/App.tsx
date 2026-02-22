import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { BackgroundProvider } from './components/BackgroundProvider';
import { Sidebar } from './components/layout/Sidebar';
import { Home } from './screens/Home';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ContactScreen } from './screens/ContactScreen';
import { TermsScreen } from './screens/TermsScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { Dashboard } from './screens/Dashboard';
import { Feed } from './screens/Feed';
import { MapScreen } from './screens/MapScreen';
import { Services } from './screens/Services';
import { Events } from './screens/Events';
import { Security } from './screens/Security';
import { Settings } from './screens/Settings';

// Usuario de demostración
const DEMO_USER = {
  email: 'demo@vecino.cl',
  password: 'demo123',
  name: 'Camilo Alegria',
};

interface User {
  email: string;
  name: string;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('vecino-activo-auth');
    return saved === 'true';
  });
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('vecino-activo-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('vecino-activo-current-view');
    return savedView || 'dashboard';
  });

  // Función de login
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const userData = { email: DEMO_USER.email, name: DEMO_USER.name };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('vecino-activo-auth', 'true');
      localStorage.setItem('vecino-activo-user', JSON.stringify(userData));
      navigate('/dashboard');
      return true;
    }
    return false;
  };

  // Función de registro
  const handleRegister = async (name: string, email: string, password: string, phone: string, address: string): Promise<boolean> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // En una app real, aquí se enviarían los datos al backend
    console.log('Registro:', { name, email, password, phone, address });
    
    // Simular registro exitoso y redirigir a login
    navigate('/login');
    return true;
  };

  // Función de logout
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vecino-activo-auth');
    localStorage.removeItem('vecino-activo-user');
    localStorage.removeItem('vecino-activo-current-view');
    navigate('/');
  };

  // Sincronizar la URL con el estado
  useEffect(() => {
    if (isAuthenticated) {
      const pathToView = location.pathname.slice(1) || 'dashboard';
      setCurrentView(pathToView);
    }
  }, [location, isAuthenticated]);

  // Guardar la vista actual en localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('vecino-activo-current-view', currentView);
    }
  }, [currentView, isAuthenticated]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    navigate(`/${view}`);
  };

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated 
            ? <Navigate to="/dashboard" replace /> 
            : <LoginScreen onLogin={handleLogin} />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated 
            ? <Navigate to="/dashboard" replace /> 
            : <RegisterScreen onRegister={handleRegister} />
        } 
      />
      <Route path="/contacto" element={<ContactScreen />} />
      <Route path="/terminos" element={<TermsScreen />} />
      <Route path="/privacidad" element={<PrivacyScreen />} />
      
      {/* Rutas protegidas */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <BackgroundProvider>
              <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30">
                <Sidebar onNavigate={handleNavigate} activeView={currentView} onLogout={handleLogout} />
                <main className="transition-all duration-300">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/noticias" element={<Feed />} />
                    <Route path="/mapa" element={<MapScreen />} />
                    <Route path="/servicios" element={<Services />} />
                    <Route path="/eventos" element={<Events />} />
                    <Route path="/seguridad" element={<Security />} />
                    <Route path="/configuracion" element={<Settings user={user} onLogout={handleLogout} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </BackgroundProvider>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export function App() {
  return <AppContent />;
}
