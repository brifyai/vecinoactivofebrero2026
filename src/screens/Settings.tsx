import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Bell, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  Camera,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';

interface UserProps {
  email: string;
  name: string;
}

interface SettingsProps {
  user: UserProps | null;
  onLogout: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
}

interface NotificationSettings {
  alerts: boolean;
  events: boolean;
  messages: boolean;
  security: boolean;
}

interface PrivacySettings {
  showPhone: boolean;
  showAddress: boolean;
  showEmail: boolean;
}

export function Settings({ user, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || 'Vecino',
    email: user?.email || '',
    phone: '+56 9 1234 5678',
    address: 'Calle Los Pinos 123, Villa Verde',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop'
  });

  // Actualizar perfil cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    alerts: true,
    events: true,
    messages: true,
    security: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showPhone: false,
    showAddress: false,
    showEmail: true
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSaveProfile = () => {
    console.log('Guardando perfil:', profile);
    setSaveMessage('Perfil guardado exitosamente');
    setTimeout(() => setSaveMessage(''), 3000);
    // TODO: Guardar en backend
  };

  const handleSaveNotifications = () => {
    console.log('Guardando notificaciones:', notifications);
    setSaveMessage('Configuración de notificaciones guardada');
    setTimeout(() => setSaveMessage(''), 3000);
    // TODO: Guardar en backend
  };

  const handleSavePrivacy = () => {
    console.log('Guardando privacidad:', privacy);
    setSaveMessage('Configuración de privacidad guardada');
    setTimeout(() => setSaveMessage(''), 3000);
    // TODO: Guardar en backend
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwords.new.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    console.log('Cambiando contraseña');
    setSaveMessage('Contraseña actualizada exitosamente');
    setTimeout(() => setSaveMessage(''), 3000);
    setPasswords({ current: '', new: '', confirm: '' });
    // TODO: Actualizar contraseña en backend
  };

  const handleAvatarChange = () => {
    console.log('Cambiar avatar');
    // TODO: Abrir selector de imágenes
    alert('Funcionalidad para cambiar avatar próximamente');
  };

  const handleLogoutClick = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      onLogout();
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
    { id: 'privacy' as const, label: 'Privacidad', icon: Shield },
    { id: 'security' as const, label: 'Seguridad', icon: Lock },
  ];

  return (
    <div className="p-4 lg:p-6 animate-fade-in min-h-screen pt-16 lg:pt-6">
      <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          Configuración <SettingsIcon className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
        </h1>
        <p className="text-gray-400 text-sm lg:text-base">Administra tu cuenta y preferencias.</p>
      </header>

      {saveMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm lg:text-base">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar de tabs */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 mb-1 text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Contenido del tab activo */}
        <div className="lg:col-span-3">
          <Card className="p-4 lg:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Información del Perfil</h2>
                
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
                  <div className="relative">
                    <img 
                      src={profile.avatar} 
                      alt="Avatar" 
                      className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-emerald-500/30"
                    />
                    <button 
                      onClick={handleAvatarChange}
                      className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-white font-medium">{profile.name}</h3>
                    <p className="text-gray-400 text-sm">Vecino activo desde 2024</p>
                  </div>
                </div>

                {/* Formulario de perfil */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm lg:text-base"
                >
                  <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                  Guardar Cambios
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Configuración de Notificaciones</h2>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Alertas de Seguridad</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Recibe notificaciones de alertas SOS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.alerts}
                        onChange={(e) => setNotifications({ ...notifications, alerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Eventos Comunitarios</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Notificaciones sobre nuevos eventos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.events}
                        onChange={(e) => setNotifications({ ...notifications, events: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Mensajes</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Notificaciones de nuevos mensajes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.messages}
                        onChange={(e) => setNotifications({ ...notifications, messages: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Actualizaciones de Seguridad</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Informes del plan cuadrante</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.security}
                        onChange={(e) => setNotifications({ ...notifications, security: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm lg:text-base"
                >
                  <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                  Guardar Cambios
                </button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Configuración de Privacidad</h2>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Mostrar Teléfono</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Permite que otros vecinos vean tu teléfono</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.showPhone}
                        onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Mostrar Dirección</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Permite que otros vecinos vean tu dirección</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.showAddress}
                        onChange={(e) => setPrivacy({ ...privacy, showAddress: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 lg:p-4 bg-white/5 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium text-sm lg:text-base">Mostrar Email</h3>
                      <p className="text-gray-400 text-xs lg:text-sm">Permite que otros vecinos vean tu email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.showEmail}
                        onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSavePrivacy}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm lg:text-base"
                >
                  <Save className="w-4 h-4 lg:w-5 lg:h-5" />
                  Guardar Cambios
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Seguridad de la Cuenta</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm lg:text-base"
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm lg:text-base"
                >
                  <Lock className="w-4 h-4 lg:w-5 lg:h-5" />
                  Actualizar Contraseña
                </button>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-white font-medium mb-3 text-sm lg:text-base">Zona de Peligro</h3>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-6 py-3 rounded-xl font-medium transition-colors text-sm lg:text-base"
                  >
                    <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
