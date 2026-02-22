import React from 'react';
import { 
  Users, 
  Map, 
  MessageSquare, 
  Calendar, 
  ShieldAlert, 
  Settings, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Card } from '../ui/Card';

interface SidebarProps {
  onNavigate: (view: string) => void;
  activeView: string;
  onLogout?: () => void;
}

export function Sidebar({ onNavigate, activeView, onLogout }: SidebarProps) {
  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, view: 'dashboard' },
    { label: 'Noticias', icon: <MessageSquare className="w-5 h-5" />, view: 'noticias' },
    { label: 'Mapa', icon: <Map className="w-5 h-5" />, view: 'mapa' },
    { label: 'Servicios', icon: <Users className="w-5 h-5" />, view: 'servicios' },
    { label: 'Eventos', icon: <Calendar className="w-5 h-5" />, view: 'eventos' },
    { label: 'Seguridad', icon: <ShieldAlert className="w-5 h-5" />, view: 'seguridad' },
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Sidebar - Desktop siempre visible con margen izquierdo */}
      <div
        className="h-screen w-64 p-4 fixed top-0 z-50"
        style={{
          left: '244px',
          position: 'fixed',
        } as React.CSSProperties}
      >
        <style>{`
          .sidebar-container {
            left: 224px !important;
          }
        `}</style>
        <Card className="h-full flex flex-col justify-between backdrop-blur-xl border border-white/5 bg-black/60">
          <div>
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="whitespace-nowrap">
                <h2 className="font-bold text-white text-lg">Vecino Activo</h2>
                <p className="text-xs text-emerald-400">Comunidad Segura</p>
              </div>
            </div>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleNavigate(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    activeView === item.view 
                      ? 'bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/10' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/5">
            <button 
              onClick={() => handleNavigate('configuracion')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeView === 'configuracion'
                  ? 'bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/10'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
