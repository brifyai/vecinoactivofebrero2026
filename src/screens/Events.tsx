import React from 'react';
import { Card } from '../components/ui/Card';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';

export function Events() {
  const [events, setEvents] = React.useState([
    {
      id: 1,
      title: 'Feria de las Pulgas',
      date: '15 MAY',
      time: '10:00 - 18:00',
      location: 'Plaza Central',
      attendees: 45,
      image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Clase de Yoga',
      date: '16 MAY',
      time: '09:00 - 10:30',
      location: 'Sede Social',
      attendees: 12,
      image: 'https://images.unsplash.com/photo-1544367563-121910aace75?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Reunión de Seguridad',
      date: '20 MAY',
      time: '19:00 - 20:30',
      location: 'Zoom',
      attendees: 28,
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop'
    }
  ]);

  const handleNewEvent = () => {
    console.log('Crear nuevo evento');
  };

  const handleAttend = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    console.log('Asistir al evento:', event?.title);
    if (event) {
      alert(`¡Te has registrado para: ${event.title}!\nFecha: ${event.date}\nHora: ${event.time}\nUbicación: ${event.location}`);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 animate-fade-in pt-16 lg:pt-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-4 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Eventos Comunitarios <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
            </h1>
            <p className="text-gray-400 text-sm lg:text-base">Participa en las actividades de tu barrio.</p>
          </div>
          <button onClick={handleNewEvent} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 text-sm lg:text-base">
            + Nuevo Evento
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {events.map((event) => (
            <Card key={event.id} className="group overflow-hidden p-0 border-white/10 hover:border-emerald-500/30">
              <div className="relative h-48">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-black px-3 py-1 rounded-lg text-center font-bold shadow-lg">
                  <span className="block text-xs uppercase tracking-wider text-emerald-600">MAY</span>
                  <span className="block text-xl leading-none">{event.date.split(' ')[0]}</span>
                </div>
              </div>

              <div className="p-4 lg:p-6 space-y-4">
                <h3 className="text-lg lg:text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{event.title}</h3>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>{event.attendees} asistentes</span>
                  </div>
                </div>

                <button onClick={() => handleAttend(event.id)} className="w-full mt-4 py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl font-medium transition-all">
                  Asistiré
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
