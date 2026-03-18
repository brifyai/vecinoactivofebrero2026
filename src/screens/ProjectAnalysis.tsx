import React from 'react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Check, Clock, AlertCircle } from 'lucide-react';

export function ProjectAnalysis() {
  const modules = [
    { name: 'Autenticación', status: 'completed', desc: 'Login, Registro, Recuperar contraseña' },
    { name: 'Panel Admin', status: 'pending', desc: 'Gestión de tickets, usuarios y reportes' },
    { name: 'Feed Social', status: 'completed', desc: 'Publicaciones, likes y comentarios' },
    { name: 'Mapa Interactivo', status: 'completed', desc: 'Visualización de eventos y alertas' },
    { name: 'Mensajería', status: 'pending', desc: 'Chat en tiempo real y notificaciones' },
    { name: 'Seguridad', status: 'completed', desc: 'Botón de pánico y reporte de incidentes' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in ml-64">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Análisis del Proyecto</h1>
        <p className="text-gray-400">Estado actual del desarrollo de Vecino Activo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Módulos Completados"
          value="4/6"
          trend="+2"
          trendUp={true}
          icon={<Check className="w-5 h-5 text-emerald-400" />}
          color="green"
        />
        <StatCard
          label="En Progreso"
          value="1"
          trend="WIP"
          trendUp={true}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          color="yellow"
        />
        <StatCard
          label="Pendientes"
          value="1"
          trend="Needs Attention"
          trendUp={false}
          icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-white mb-6">Desglose por Módulo</h3>
          <div className="space-y-4">
            {modules.map((mod, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="font-medium text-white">{mod.name}</h4>
                  <p className="text-sm text-gray-400">{mod.desc}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  mod.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                    : mod.status === 'pending'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                }`}>
                  {mod.status === 'completed' ? 'Completado' : mod.status === 'pending' ? 'Pendiente' : 'En Progreso'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
