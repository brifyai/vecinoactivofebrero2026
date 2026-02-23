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
import { api, User } from './lib/api';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('vecino-token');
    return !!token;
  });
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('vecino-activo-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('vecino-activo-current-view');
    return savedView || 'dashboard';
  });

  // Escuchar cambios en localStorage para autenticación
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vecino-token') {
        const token = e.newValue;
        setIsAuthenticated(!!token);
        if (!token) {
          setUser(null);
          navigate('/');
        }
      }
      if (e.key === 'vecino-activo-user') {
        const savedUser = e.newValue;
        setUser(savedUser ? JSON.parse(savedUser) : null);
      }
    };

    // También escuchar evento personalizado para login
    const handleLogin = () => {
      const token = localStorage.getItem('vecino-token');
      const savedUser = localStorage.getItem('vecino-activo-user');
      setIsAuthenticated(!!token);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('login-success', handleLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login-success', handleLogin);
    };
  }, [navigate]);

  // Función de logout
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
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
            : <LoginScreen />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <RegisterScreen />
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
              <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden">
                <Sidebar onNavigate={handleNavigate} activeView={currentView} onLogout={handleLogout} />
                <main className="transition-all duration-300 lg:ml-[276px] lg:mr-[20px] px-4 sm:px-6 lg:px-8">
                  <div className="max-w-7xl mx-auto">
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
                </div>
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
