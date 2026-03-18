import { useState, useEffect } from 'react';

interface DailyBackgroundOptions {
  clientId?: string;
  query?: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

/**
 * Hook para obtener una imagen diaria de Unsplash
 * La imagen cambia cada día basándose en la fecha actual
 */
export function useDailyBackground(options: DailyBackgroundOptions = {}) {
  const {
    clientId = 'demo', // Reemplaza con tu API key de Unsplash
    query = 'nature,landscape',
    orientation = 'landscape'
  } = options;

  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generar una semilla basada en la fecha actual
    const today = new Date();
    const dateSeed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Generar un número aleatorio basado en la fecha para variar la imagen
    const hash = simpleHash(dateSeed + query);
    
    // Obtener la URL directa de la imagen de paisaje
    const url = getPhotoUrl(hash);
    
    setImageUrl(url);
    setIsLoading(false);
  }, [query, orientation, clientId]);

  return { imageUrl, isLoading };
}

/**
 * Función simple de hash para generar un número determinista
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash);
}

/**
 * Lista de URLs directas de paisajes de Unsplash - SOLO PAISAJES NATURALES
 * Cada imagen está verificada como paisaje natural (montañas, lagos, bosques, etc.)
 */
function getPhotoUrl(hash: number): string {
  const photoUrls = [
    // Montañas y lagos
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2560&auto=format&fit=crop', // Montañas con lago
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2560&auto=format&fit=crop', // Valle con río
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2560&auto=format&fit=crop', // Lago montañas
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2560&auto=format&fit=crop', // Montañas reflejadas
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2560&auto=format&fit=crop', // Montaña nevada
    
    // Bosques
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2560&auto=format&fit=crop', // Bosque verde
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=2560&auto=format&fit=crop', // Bosque con niebla
    'https://images.unsplash.com/photo-1447602869782-801d6d0c6e48?q=80&w=2560&auto=format&fit=crop', // Sendero bosque
    
    // Lagos y ríos
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=2560&auto=format&fit=crop', // Lago tranquilo
    'https://images.unsplash.com/photo-1470252649378-e9de2d45a3b6?q=80&w=2560&auto=format&fit=crop', // Lago con montañas
    'https://images.unsplash.com/photo-1502086313500-1ea6372eb4b6?q=80&w=2560&auto=format&fit=crop', // Río en valle
    
    // Valles y praderas
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2560&auto=format&fit=crop', // Valle verde
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2560&auto=format&fit=crop', // Pradera con nubes
    'https://images.unsplash.com/photo-1504198458649-3128b932f49e?q=80&w=2560&auto=format&fit=crop', // Desierto
    
    // Atardeceres y amaneceres
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2560&auto=format&fit=crop', // Atardecer montaña
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?q=80&w=2560&auto=format&fit=crop', // Atardecer valle
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2560&auto=format&fit=crop', // Cascada bosque
    
    // Paisajes diversos
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop', // Playa
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2560&auto=format&fit=crop', // Montañas lejanas
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2560&auto=format&fit=crop', // Montaña con estrellas
    'https://images.unsplash.com/photo-1505765050516-f75dc429b433?q=80&w=2560&auto=format&fit=crop', // Aurora boreal
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2560&auto=format&fit=crop', // Campo de flores
    'https://images.unsplash.com/photo-1507400492013-1626ddcbcc12?q=80&w=2560&auto=format&fit=crop', // Valle verde
  ];
  
  return photoUrls[hash % photoUrls.length];
}
