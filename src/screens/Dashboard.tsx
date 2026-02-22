import React from 'react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  MessageCircle, 
  ArrowRight,
  Hand
} from 'lucide-react';

export function Dashboard() {
  const recentActivities = [
    { id: 1, user: 'Ana María', action: 'Reportó un incidente', time: 'Hace 5m', type: 'alert' },
    { id: 2, user: 'Juan Pérez', action: 'Publicó en Mercado', time: 'Hace 15m', type: 'market' },
    { id: 3, user: 'Junta Vecinal', action: 'Nuevo evento', time: 'Hace 1h', type: 'event' },
    { id: 4, user: 'Roberto Gómez', action: 'Comentó en Seguridad', time: 'Hace 2h', type: 'comment' },
  ];

  const handleViewAll = () => {
    console.log('Ver toda la actividad');
  };

  const handleActivityClick = (activity: any) => {
    console.log('Actividad clickeada:', activity);
  };

  const handleEventClick = () => {
    console.log('Evento clickeado: Asamblea General');
  };

  return (
    <div className="p-4 lg:p-8 lg:ml-[400px] space-y-6 lg:space-y-8 animate-fade-in pt-16 lg:pt-8">
      <header className="mb-4 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          Hola, Vecino <Hand className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
        </h1>
        <p className="text-gray-400 text-sm lg:text-base">Aquí está el resumen de tu comunidad hoy.</p>
      </header>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard 
          label="Vecinos Activos" 
          value="1,248" 
          trend="+12%" 
          trendUp={true}
          icon={<Users className="w-4 h-4 lg:w-5 lg:h-5" />}
          color="blue"
        />
        <StatCard 
          label="Alertas Hoy" 
          value="3" 
          trend="-2" 
          trendUp={false}
          icon={<AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" />}
          color="red"
        />
        <StatCard 
          label="Eventos Próximos" 
          value="5" 
          trend="+2" 
          trendUp={true}
          icon={<MapPin className="w-4 h-4 lg:w-5 lg:h-5" />}
          color="green"
        />
        <StatCard 
          label="Nuevos Mensajes" 
          value="42" 
          trend="+15%" 
          trendUp={true}
          icon={<MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />}
          color="yellow"
        />
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-semibold text-white text-sm lg:text-base">Actividad Reciente</h3>
              <button onClick={handleViewAll} className="text-xs lg:text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Ver todo</button>
            </div>
            <div className="divide-y divide-white/5">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  onClick={() => handleActivityClick(activity)} 
                  className="p-3 lg:p-4 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'alert' ? 'bg-rose-500/20 text-rose-400' :
                      activity.type === 'event' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {activity.user.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm lg:text-base truncate">{activity.user}</p>
                      <p className="text-xs lg:text-sm text-gray-400 truncate">{activity.action}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                    <span className="text-xs text-gray-500 hidden sm:inline">{activity.time}</span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/20 border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white text-sm lg:text-base">Estado de Seguridad</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Nivel de Alerta</span>
                <span className="px-2 lg:px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20">BAJO</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                El vecindario se encuentra tranquilo. Última ronda de seguridad realizada hace 30 minutos.
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-white mb-4 text-sm lg:text-base">Próximo Evento</h3>
            <div className="space-y-4">
              <div onClick={handleEventClick} className="p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-emerald-400">MAÑANA, 18:00</span>
                  <MapPin className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-white font-medium mb-1 text-sm lg:text-base">Asamblea General</h4>
                <p className="text-xs lg:text-sm text-gray-400">Sede Social #3</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
