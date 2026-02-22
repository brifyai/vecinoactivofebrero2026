import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '../components/ui/Card';
import { MapPin, Navigation, Map, Loader2, ZoomIn, ZoomOut, Locate, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Feature, Geometry, FeatureCollection } from 'geojson';

// Corregir el problema de los iconos de Leaflet en Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Tipos para las propiedades del GeoJSON
interface UVProperties {
  t_reg_ca: string;
  t_prov_ca: string;
  t_com: string;
  t_reg_nom: string;
  t_prov_nom: string;
  t_com_nom: string;
  t_id_uv_ca: string;
  uv_carto: string;
  t_uv_nom: string;
  PERSONAS: string;
  HOGARES: number;
  HOMBRE: string;
  MUJER: string;
  AREA_VERDE: number;
  T_EDUCACIO: number;
  TOTAL_SALU: number;
  DEPORTE: number;
}

// Componente para controles personalizados
function MapControls({ onZoomIn, onZoomOut, onLocate }: { 
  onZoomIn: () => void; 
  onZoomOut: () => void; 
  onLocate: () => void;
}) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="bg-white/95 hover:bg-white p-2 rounded-lg shadow-lg transition-colors border border-gray-200"
        title="Acercar"
      >
        <ZoomIn className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={onZoomOut}
        className="bg-white/95 hover:bg-white p-2 rounded-lg shadow-lg transition-colors border border-gray-200"
        title="Alejar"
      >
        <ZoomOut className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={onLocate}
        className="bg-white/95 hover:bg-white p-2 rounded-lg shadow-lg transition-colors border border-gray-200"
        title="Mi ubicación"
      >
        <Locate className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

// Componente para manejar eventos del mapa
function MapEventHandler({ onBoundsChange, onZoomChange }: { 
  onBoundsChange: (bounds: L.LatLngBounds) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    onBoundsChange(map.getBounds());
    onZoomChange(map.getZoom());
  }, [map, onBoundsChange, onZoomChange]);
  
  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  
  return null;
}

// Colores por región (paleta más vibrante y distinguible)
const REGION_COLORS: Record<string, { fill: string; border: string }> = {
  '15': { fill: '#ef4444', border: '#dc2626' }, // Arica y Parinacota - Rojo
  '01': { fill: '#f97316', border: '#ea580c' }, // Tarapacá - Naranja
  '02': { fill: '#f59e0b', border: '#d97706' }, // Antofagasta - Ámbar
  '03': { fill: '#84cc16', border: '#65a30d' }, // Atacama - Lima
  '04': { fill: '#22c55e', border: '#16a34a' }, // Coquimbo - Verde
  '05': { fill: '#14b8a6', border: '#0d9488' }, // Valparaíso - Teal
  '06': { fill: '#06b6d4', border: '#0891b2' }, // O'Higgins - Cyan
  '07': { fill: '#0ea5e9', border: '#0284c7' }, // Maule - Sky
  '08': { fill: '#3b82f6', border: '#2563eb' }, // Biobío - Azul
  '09': { fill: '#6366f1', border: '#4f46e5' }, // Araucanía - Indigo
  '14': { fill: '#8b5cf6', border: '#7c3aed' }, // Los Ríos - Violeta
  '10': { fill: '#a855f7', border: '#9333ea' }, // Los Lagos - Púrpura
  '11': { fill: '#d946ef', border: '#c026d3' }, // Aysén - Fucsia
  '12': { fill: '#ec4899', border: '#db2777' }, // Magallanes - Rosa
  '13': { fill: '#f43f5e', border: '#e11d48' }, // Metropolitana - Rose
};

// Función para estilizar las unidades vecinales
const getStyle = (feature: Feature<Geometry, UVProperties> | undefined, isSelected: boolean = false): L.PathOptions => {
  if (!feature || !feature.properties) {
    return { 
      fillColor: '#10b981', 
      weight: 1, 
      opacity: 1, 
      color: 'white', 
      fillOpacity: 0.5 
    };
  }
  
  const regionCode = feature.properties.t_reg_ca;
  const colors = REGION_COLORS[regionCode] || { fill: '#10b981', border: '#059669' };
  
  return {
    fillColor: colors.fill,
    weight: isSelected ? 3 : 0.5,
    opacity: isSelected ? 1 : 0.8,
    color: isSelected ? '#ffffff' : colors.border,
    fillOpacity: isSelected ? 0.8 : 0.6,
  };
};

// Centro aproximado de Chile
const CHILE_CENTER: [number, number] = [-35.6751, -71.5430];
const INITIAL_ZOOM = 5;

export function MapScreen() {
  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, UVProperties> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UVProperties | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentZoom, setCurrentZoom] = useState(INITIAL_ZOOM);
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  // Cargar GeoJSON
  useEffect(() => {
    const loadGeoJSON = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Cargando GeoJSON desde /unidades_vecinales_simple.geojson...');
        const response = await fetch('/unidades_vecinales_simple.geojson');
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('GeoJSON cargado:', data.type, 'Features:', data.features?.length);
        
        setGeoData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando GeoJSON:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el mapa');
        setLoading(false);
      }
    };
    
    loadGeoJSON();
  }, []);

  // Filtrar unidades vecinales por búsqueda y bounds
  // Solo mostrar unidades cuando el zoom es suficientemente alto (zoom >= 8)
  const filteredFeatures = useMemo(() => {
    if (!geoData || !geoData.features) return [];
    
    // Filtrar por término de búsqueda - siempre mostrar resultados de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      return geoData.features.filter(f => {
        const props = f.properties;
        return (
          props.t_com_nom?.toLowerCase().includes(term) ||
          props.t_reg_nom?.toLowerCase().includes(term) ||
          props.t_uv_nom?.toLowerCase().includes(term) ||
          props.t_prov_nom?.toLowerCase().includes(term) ||
          props.t_id_uv_ca?.toLowerCase().includes(term)
        );
      });
    }
    
    // Solo mostrar unidades vecinales cuando el zoom es alto (>= 8)
    // Esto evita que se muestren todas las unidades al cargar el mapa
    if (currentZoom < 8) {
      return [];
    }
    
    // Filtrar por bounds para mostrar solo unidades visibles
    if (currentBounds) {
      return geoData.features.filter(f => {
        const geometry = f.geometry;
        
        // Función para verificar si un punto está dentro de los bounds
        const isPointInBounds = (coord: number[]): boolean => {
          const [lng, lat] = coord;
          const south = currentBounds.getSouth();
          const north = currentBounds.getNorth();
          const west = currentBounds.getWest();
          const east = currentBounds.getEast();
          return lat >= south && lat <= north && lng >= west && lng <= east;
        };
        
        if (geometry.type === 'Polygon') {
          return geometry.coordinates[0].some(coord => isPointInBounds(coord));
        }
        
        if (geometry.type === 'MultiPolygon') {
          return geometry.coordinates.some(polygon => 
            polygon[0].some(coord => isPointInBounds(coord))
          );
        }
        
        return false;
      });
    }
    
    return [];
  }, [geoData, searchTerm, currentBounds, currentZoom]);

  // Manejadores de eventos
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleLocate = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef.current) {
            mapRef.current.setView([position.coords.latitude, position.coords.longitude], 14);
          }
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          alert('No se pudo obtener tu ubicación. Por favor, habilita los permisos de ubicación.');
        }
      );
    }
  }, []);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    setCurrentBounds(bounds);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  // Función para cada feature
  const onEachFeature = useCallback((feature: Feature<Geometry, UVProperties>, layer: L.Layer) => {
    const props = feature.properties;
    
    // Eventos del mouse
    layer.on({
      click: () => {
        setSelectedUnit(props);
        
        // Hacer zoom a la feature seleccionada
        const polygonLayer = layer as L.Polygon;
        if (polygonLayer.getBounds) {
          const bounds = polygonLayer.getBounds();
          mapRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      },
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({
          weight: 3,
          fillOpacity: 0.8,
          color: '#ffffff',
        });
        target.bringToFront();
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        const isSelected = selectedUnit?.t_id_uv_ca === props.t_id_uv_ca;
        target.setStyle(getStyle(feature, isSelected));
      },
    });
    
    // Tooltip con información
    const tooltipContent = `
      <div style="font-family: system-ui, sans-serif; padding: 4px;">
        <strong style="font-size: 14px; color: #1f2937;">${props.t_uv_nom || 'UV ' + props.uv_carto}</strong><br/>
        <span style="color: #6b7280; font-size: 12px;">${props.t_com_nom}, ${props.t_reg_nom}</span><br/>
        <span style="color: #059669; font-size: 11px;">👥 ${parseInt(props.PERSONAS || '0').toLocaleString()} habitantes</span>
      </div>
    `;
    
    layer.bindTooltip(tooltipContent, { 
      sticky: true, 
      direction: 'auto',
      className: 'custom-tooltip'
    });
  }, [selectedUnit]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!geoData || !geoData.features) return null;
    
    const totalFeatures = geoData.features.length;
    const totalPoblacion = geoData.features.reduce((sum, f) => sum + parseInt(f.properties.PERSONAS || '0'), 0);
    const totalHogares = geoData.features.reduce((sum, f) => sum + (f.properties.HOGARES || 0), 0);
    
    return { totalFeatures, totalPoblacion, totalHogares };
  }, [geoData]);

  // Estilos CSS personalizados para tooltips
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-tooltip {
        background: white !important;
        border: none !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        padding: 8px !important;
      }
      .custom-tooltip::before {
        border-top-color: white !important;
      }
      .leaflet-container {
        background: #1a1a2e;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="p-4 lg:p-8 lg:ml-[400px] flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <header className="mb-3 lg:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0 pt-12 lg:pt-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-1 flex items-center gap-2 lg:gap-3">
            Mapa de Unidades Vecinales <Map className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm">Explora las {stats?.totalFeatures.toLocaleString() || ''} unidades vecinales de Chile.</p>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Buscar comuna, región..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 lg:px-4 py-2 pl-9 lg:pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 lg:w-64 text-xs lg:text-sm"
            />
            <Navigation className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          <button 
            onClick={handleLocate} 
            className="flex items-center gap-1 lg:gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-2 lg:px-3 py-2 rounded-lg transition-colors text-xs lg:text-sm flex-shrink-0"
          >
            <Navigation className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Mi Ubicación</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4 min-h-0">
        {/* Mapa */}
        <div className="lg:col-span-3 relative rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900" style={{ minHeight: '300px', maxHeight: 'calc(100vh - 180px)' }}>
          {loading && (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-[1001]">
              <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mb-4" />
              <p className="text-white text-xl mb-2">Cargando mapa de Chile...</p>
              <p className="text-gray-400 text-sm">Cargando {stats?.totalFeatures.toLocaleString() || 'unidades vecinales'}...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-[1001]">
              <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
              <p className="text-red-400 text-xl mb-2">Error al cargar el mapa</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <MapContainer
              center={CHILE_CENTER}
              zoom={INITIAL_ZOOM}
              minZoom={4}
              maxZoom={18}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              zoomControl={false}
              preferCanvas={true}
            >
              {/* Capa base con mejor calidad - CartoDB Positron */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />
              
              <MapEventHandler 
                onBoundsChange={handleBoundsChange}
                onZoomChange={handleZoomChange}
              />
              
              {filteredFeatures.length > 0 && (
                <GeoJSON
                  key={`geojson-${searchTerm}-${currentZoom}`}
                  ref={geoJsonRef}
                  data={(() => {
                    const collection: FeatureCollection<Geometry, UVProperties> = {
                      type: 'FeatureCollection',
                      features: filteredFeatures
                    };
                    return collection;
                  })()}
                  style={(feature) => getStyle(feature as Feature<Geometry, UVProperties>, selectedUnit?.t_id_uv_ca === feature?.properties?.t_id_uv_ca)}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
          )}
          
          {/* Controles personalizados */}
          <MapControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onLocate={handleLocate}
          />
          
          {/* Indicador de zoom y features */}
          <div className="absolute top-4 left-4 bg-white/95 rounded-lg px-2 lg:px-3 py-1 lg:py-2 z-[1000] text-xs shadow-lg">
            <span className="text-gray-600">Zoom: </span>
            <span className="font-medium text-gray-800">{currentZoom}</span>
            <span className="text-gray-400 mx-1 lg:mx-2">|</span>
            <span className="text-gray-600">Visibles: </span>
            <span className="font-medium text-gray-800">{filteredFeatures.length.toLocaleString()}</span>
            {currentZoom < 8 && !searchTerm && (
              <div className="mt-1 text-amber-600 text-xs">
                🔍 Haz zoom in para ver las unidades
              </div>
            )}
          </div>
          
          {/* Leyenda - Oculta en mobile, visible en desktop */}
          <div className="hidden lg:block absolute bottom-4 left-4 bg-white/95 rounded-lg p-4 z-[1000] text-xs shadow-lg">
            <p className="font-semibold text-gray-700 mb-2 text-sm">Regiones de Chile</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#ef4444'}}></span><span className="text-gray-600">XV Arica</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#f97316'}}></span><span className="text-gray-600">I Tarapacá</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b'}}></span><span className="text-gray-600">II Antofagasta</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#84cc16'}}></span><span className="text-gray-600">III Atacama</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#22c55e'}}></span><span className="text-gray-600">IV Coquimbo</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#14b8a6'}}></span><span className="text-gray-600">V Valparaíso</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#06b6d4'}}></span><span className="text-gray-600">VI O'Higgins</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#0ea5e9'}}></span><span className="text-gray-600">VII Maule</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#3b82f6'}}></span><span className="text-gray-600">VIII Biobío</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#6366f1'}}></span><span className="text-gray-600">IX Araucanía</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#8b5cf6'}}></span><span className="text-gray-600">XIV Los Ríos</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#a855f7'}}></span><span className="text-gray-600">X Los Lagos</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#d946ef'}}></span><span className="text-gray-600">XI Aysén</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#ec4899'}}></span><span className="text-gray-600">XII Magallanes</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{backgroundColor: '#f43f5e'}}></span><span className="text-gray-600">RM Metropolitana</span></div>
            </div>
          </div>
        </div>

        {/* Panel lateral - Oculto en mobile, visible en desktop */}
        <div className="hidden lg:block space-y-4 overflow-y-auto">
          {/* Estadísticas */}
          {stats && (
            <Card variant="solid" className="bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3">📊 Estadísticas Generales</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Unidades:</span>
                  <span className="text-white font-bold text-lg">{stats.totalFeatures.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Población Total:</span>
                  <span className="text-emerald-400 font-bold">{stats.totalPoblacion.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Hogares:</span>
                  <span className="text-blue-400 font-medium">{stats.totalHogares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Visibles ahora:</span>
                  <span className="text-yellow-400 font-medium">{filteredFeatures.length.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          )}
          
          {/* Unidad seleccionada */}
          {selectedUnit && (
            <Card variant="solid" className="bg-emerald-900/30 border border-emerald-500/30">
              <h3 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Unidad Vecinal
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-black/20 rounded-lg p-3">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Nombre</span>
                  <p className="text-white font-bold text-lg">{selectedUnit.t_uv_nom || 'UV ' + selectedUnit.uv_carto}</p>
                  <p className="text-gray-400 text-xs">ID: {selectedUnit.t_id_uv_ca}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-2">
                    <span className="text-gray-400 text-xs">Comuna</span>
                    <p className="text-white font-medium">{selectedUnit.t_com_nom}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2">
                    <span className="text-gray-400 text-xs">Provincia</span>
                    <p className="text-white font-medium">{selectedUnit.t_prov_nom}</p>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-2">
                  <span className="text-gray-400 text-xs">Región</span>
                  <p className="text-white font-medium">{selectedUnit.t_reg_nom}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div className="text-center bg-blue-900/30 rounded-lg p-2">
                    <span className="text-blue-300 text-xs block mb-1">Población</span>
                    <p className="text-white font-bold text-lg">{parseInt(selectedUnit.PERSONAS || '0').toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-purple-900/30 rounded-lg p-2">
                    <span className="text-purple-300 text-xs block mb-1">Hogares</span>
                    <p className="text-white font-bold text-lg">{(selectedUnit.HOGARES || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-sky-900/30 rounded-lg p-2">
                    <span className="text-sky-300 text-xs block mb-1">Hombres</span>
                    <p className="text-sky-400 font-bold">{parseInt(selectedUnit.HOMBRE || '0').toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-pink-900/30 rounded-lg p-2">
                    <span className="text-pink-300 text-xs block mb-1">Mujeres</span>
                    <p className="text-pink-400 font-bold">{parseInt(selectedUnit.MUJER || '0').toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <div className="text-center bg-yellow-900/30 rounded-lg p-2">
                    <span className="text-yellow-300 text-xs block">Educación</span>
                    <p className="text-yellow-400 font-bold text-lg">{selectedUnit.T_EDUCACIO || 0}</p>
                  </div>
                  <div className="text-center bg-red-900/30 rounded-lg p-2">
                    <span className="text-red-300 text-xs block">Salud</span>
                    <p className="text-red-400 font-bold text-lg">{selectedUnit.TOTAL_SALU || 0}</p>
                  </div>
                  <div className="text-center bg-green-900/30 rounded-lg p-2">
                    <span className="text-green-300 text-xs block">Deporte</span>
                    <p className="text-green-400 font-bold text-lg">{selectedUnit.DEPORTE || 0}</p>
                  </div>
                </div>
                
                {selectedUnit.AREA_VERDE > 0 && (
                  <div className="text-center bg-emerald-900/30 rounded-lg p-2">
                    <span className="text-emerald-300 text-xs">Área Verde</span>
                    <p className="text-emerald-400 font-bold">{selectedUnit.AREA_VERDE.toLocaleString()} m²</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="mt-4 w-full text-center text-sm text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg py-2"
              >
                Cerrar detalles
              </button>
            </Card>
          )}
          
          {/* Instrucciones */}
          <Card variant="solid" className="bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-3">💡 Cómo usar</h3>
            <ul className="text-sm text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Usa el scroll del mouse para hacer zoom</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Arrastra para mover el mapa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Haz clic en una unidad para ver detalles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Busca por comuna, región o nombre</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">•</span>
                <span>Los colores indican la región</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
