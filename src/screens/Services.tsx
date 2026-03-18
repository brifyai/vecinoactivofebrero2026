import React from 'react';
import { Card } from '../components/ui/Card';
import { Star, Phone, MapPin, Clock, Store, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  rating: number;
  review_count: number;
  image_url?: string;
  is_verified: boolean;
}

export function Services() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/services`);
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (service: Service) => {
    const message = `Contactando a ${service.name}\n`;
    const details = [];
    if (service.phone) details.push(`Teléfono: ${service.phone}`);
    if (service.email) details.push(`Email: ${service.email}`);
    if (service.address) details.push(`Dirección: ${service.address}`);
    if (service.description) details.push(`Descripción: ${service.description}`);
    
    alert(message + details.join('\n'));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-6 pt-16 lg:pt-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando servicios...</p>
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
            onClick={fetchServices}
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
        <header className="mb-4 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Servicios Locales <Store className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
          </h1>
          <p className="text-gray-400 text-sm lg:text-base">Apoya el comercio de tu barrio.</p>
        </header>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay servicios disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden p-0 group hover:shadow-2xl transition-all duration-300 border-white/10 hover:border-emerald-500/30">
                {service.image_url && (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={service.image_url} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-bold">{service.rating}</span>
                    </div>
                  </div>
                )}
                
                <div className="p-4 lg:p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">{service.category}</span>
                      {service.is_verified && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Verificado</span>
                      )}
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    {service.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>{service.address}</span>
                      </div>
                    )}
                    {service.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span>{service.phone}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleContact(service)} 
                    className="w-full py-2 bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Phone className="w-4 h-4" />
                    Contactar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
