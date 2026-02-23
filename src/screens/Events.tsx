import React from 'react';
import { Card } from '../components/ui/Card';
import { MapPin, Users, Clock, Calendar, Loader2, Plus } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  category: string;
  organizer_name?: string;
  max_attendees?: number;
  current_attendees: number;
  image_url?: string;
  is_active: boolean;
}

export function Events() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [attending, setAttending] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    fetchEvents();
  }, []);

  const getToken = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.token;
    }
    return null;
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/events`);
      if (!response.ok) throw new Error('Error al cargar eventos');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async (eventId: string, isAttending: boolean) => {
    const token = getToken();
    if (!token) {
      alert('Debes iniciar sesión para asistir a eventos');
      return;
    }

    try {
      const method = isAttending ? 'DELETE' : 'POST';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/events/${eventId}/attend`,
        {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al procesar la solicitud');
      }

      const result = await response.json();
      alert(result.message);

      // Actualizar estado local
      if (isAttending) {
        setAttending(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, current_attendees: Math.max(0, e.current_attendees - 1) } : e
        ));
      } else {
        setAttending(prev => new Set([...prev, eventId]));
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, current_attendees: e.current_attendees + 1 } : e
        ));
      }
    } catch (err: any) {
      console.error('Error attending event:', err);
      alert(err.message || 'Error al procesar la solicitud');
    }
  };

  const handleNewEvent = () => {
    alert('Funcionalidad para crear eventos próximamente disponible');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return {
      month: months[date.getMonth()],
      day: date.getDate(),
      time: date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-6 pt-16 lg:pt-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 lg:p-6 pt-16 lg:pt-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          <button onClick={handleNewEvent} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20 text-sm lg:text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        </header>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay eventos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {events.map((event) => {
              const { month, day, time } = formatDate(event.date);
              const isAttending = attending.has(event.id);
              
              return (
                <Card key={event.id} className="group overflow-hidden p-0 border-white/10 hover:border-emerald-500/30">
                  {event.image_url && (
                    <div className="relative h-48">
                      <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-black px-3 py-1 rounded-lg text-center font-bold shadow-lg">
                        <span className="block text-xs uppercase tracking-wider text-emerald-600">{month}</span>
                        <span className="block text-xl leading-none">{day}</span>
                      </div>
                      {event.max_attendees && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <span className="text-white text-xs font-medium">
                            {event.current_attendees}/{event.max_attendees}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 lg:p-6 space-y-4">
                    <div>
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">{event.category}</span>
                      <h3 className="text-lg lg:text-xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>{time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span>{event.current_attendees} asistente{event.current_attendees !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAttend(event.id, isAttending)}
                      className={`w-full mt-4 py-2 rounded-xl font-medium transition-all ${
                        isAttending 
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' 
                          : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {isAttending ? 'Cancelar asistencia' : 'Asistiré'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
