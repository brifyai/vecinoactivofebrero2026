import React from 'react';
import { Card } from '../components/ui/Card';
import { Star, Phone, MapPin, Clock, Store } from 'lucide-react';

export function Services() {
  const [businesses, setBusinesses] = React.useState([
    {
      id: 1,
      name: 'Verdulería La Fresca',
      category: 'Almacén',
      rating: 4.8,
      address: 'Calle Los Pinos 123',
      hours: '09:00 - 20:00',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 2,
      name: 'Gasfitería Don José',
      category: 'Servicios',
      rating: 4.9,
      address: 'A domicilio',
      hours: '24/7',
      image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 3,
      name: 'Panadería El Horno',
      category: 'Alimentos',
      rating: 4.7,
      address: 'Av. Principal 456',
      hours: '07:00 - 21:00',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop'
    }
  ]);

  const handleContact = (businessId: number) => {
    const business = businesses.find(b => b.id === businessId);
    console.log('Contactando:', business?.name);
    if (business) {
      alert(`Contactando a ${business.name}\nDirección: ${business.address}\nHorario: ${business.hours}`);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 animate-fade-in pt-16 lg:pt-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-4 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            Servicios Locales <Store className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-400" />
          </h1>
          <p className="text-gray-400 text-sm lg:text-base">Apoya el comercio de tu barrio.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="overflow-hidden p-0 group hover:shadow-2xl transition-all duration-300 border-white/10 hover:border-emerald-500/30">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={business.image} 
                  alt={business.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-xs font-bold">{business.rating}</span>
                </div>
              </div>
              
              <div className="p-4 lg:p-6 space-y-4">
                <div>
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">{business.category}</span>
                  <h3 className="text-lg lg:text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">{business.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{business.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>{business.hours}</span>
                  </div>
                </div>

                <button onClick={() => handleContact(business.id)} className="w-full py-2 bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-2">
                  <Phone className="w-4 h-4" />
                  Contactar
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
