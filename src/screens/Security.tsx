import React from 'react';
import { Card } from '../components/ui/Card';
import { AlertTriangle, Shield, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react';

export function Security() {
  const [alerts, setAlerts] = React.useState([
    {
      id: 1,
      type: 'Sospecha',
      time: 'Hace 10m',
      desc: 'Auto desconocido estacionado frente a casa #45',
      location: 'Calle Los Robles',
      status: 'active'
    },
    {
      id: 2,
      type: 'Ruido Molesto',
      time: 'Hace 2h',
      desc: 'Música alta en departamento 302',
      location: 'Edificio A',
      status: 'resolved'
    }
  ]);

  const handleSOSAlert = () => {
    console.log('ALERTA SOS activada');
    if (confirm('¿Estás seguro de activar la alerta SOS? Esto notificará a todos los vecinos.')) {
      alert('🚨 ALERTA SOS ENVIADA A TODOS LOS VECINOS 🚨\n\nLos vecinos han sido notificados de tu emergencia.');
    }
  };

  const handleAlertDetails = (alertId: number) => {
    const alertData = alerts.find(a => a.id === alertId);
    console.log('Ver detalles de alerta:', alertData);
    if (alertData) {
      window.alert(`Detalles de la alerta:\n\nTipo: ${alertData.type}\nDescripción: ${alertData.desc}\nUbicación: ${alertData.location}\nHora: ${alertData.time}\nEstado: ${alertData.status === 'active' ? 'ACTIVO' : 'RESUELTO'}`);
    }
  };

  const handleEmergencyCall = (service: string, number: string) => {
    console.log(`Llamando a ${service}: ${number}`);
    if (confirm(`¿Deseas llamar a ${service} (${number})?`)) {
      window.location.href = `tel:${number}`;
    }
  };

  const handleQuadranteCall = () => {
    console.log('Llamando al patrullero');
    if (confirm('¿Deseas llamar al Sgto. Juan Muñoz (+56 9 1234 5678)?')) {
      window.location.href = 'tel:+56912345678';
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 animate-fade-in pt-16 lg:pt-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-4 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Seguridad Vecinal <ShieldCheck className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
          </h1>
          <p className="text-gray-400 text-sm lg:text-base">Reporta incidentes y mantén seguro tu barrio.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <Card className="bg-rose-900/20 border-rose-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-500/20 rounded-xl animate-pulse">
                  <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-white">¿Tienes una emergencia?</h2>
                  <p className="text-gray-400 text-sm lg:text-base">Presiona el botón para alertar a todos los vecinos.</p>
                </div>
              </div>
              <button onClick={handleSOSAlert} className="w-full py-3 lg:py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-base lg:text-lg rounded-xl shadow-lg shadow-rose-500/20 transition-all transform hover:scale-[1.02]">
                ALERTA SOS
              </button>
            </Card>

            <Card>
              <h3 className="font-bold text-white mb-4 text-sm lg:text-base">Alertas Recientes</h3>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3 lg:p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-start">
                    <div className="flex gap-3 lg:gap-4">
                      <div className={`p-2 rounded-lg h-fit ${alert.status === 'active' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        <Shield className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm lg:text-base">{alert.type}</span>
                          {alert.status === 'active' && (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded-full border border-rose-500/20 animate-pulse">ACTIVO</span>
                          )}
                        </div>
                        <p className="text-gray-300 text-xs lg:text-sm mb-2">{alert.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {alert.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {alert.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleAlertDetails(alert.id)} className="text-xs text-gray-400 hover:text-white underline">Ver detalles</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <Card className="bg-gradient-to-br from-emerald-900/40 to-black border-emerald-500/20">
              <h3 className="font-bold text-white mb-4 text-sm lg:text-base">Teléfonos de Emergencia</h3>
              <div className="space-y-3">
                <button onClick={() => handleEmergencyCall('Carabineros', '133')} className="w-full flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl border border-emerald-500/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-white font-medium text-sm lg:text-base">Carabineros</span>
                  </div>
                  <span className="text-emerald-400 font-bold">133</span>
                </button>
                
                <button onClick={() => handleEmergencyCall('Bomberos', '132')} className="w-full flex items-center justify-between p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="text-white font-medium text-sm lg:text-base">Bomberos</span>
                  </div>
                  <span className="text-rose-400 font-bold">132</span>
                </button>

                <button onClick={() => handleEmergencyCall('Ambulancia', '131')} className="w-full flex items-center justify-between p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-white font-medium text-sm lg:text-base">Ambulancia</span>
                  </div>
                  <span className="text-blue-400 font-bold">131</span>
                </button>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-white mb-2 text-sm lg:text-base">Plan Cuadrante</h3>
              <p className="text-xs lg:text-sm text-gray-400 mb-4">Contacta directamente al patrullero de tu zona.</p>
              <div className="p-3 bg-white/5 rounded-xl flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Oficial" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium text-sm">Sgto. Juan Muñoz</p>
                  <p className="text-emerald-400 text-xs">+56 9 1234 5678</p>
                </div>
                <button onClick={handleQuadranteCall} className="ml-auto p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
