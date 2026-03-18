import { useEffect } from 'react';
import { useDailyBackground } from '../hooks/useDailyBackground';
import { useImageContrast } from '../hooks/useImageContrast';

interface BackgroundProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor de fondo inteligente que:
 * 1. Cambia la imagen de fondo diariamente
 * 2. Analiza el contraste de la imagen automáticamente
 * 3. Ajusta los colores de texto y overlay dinámicamente
 */
export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const { imageUrl, isLoading: isLoadingImage } = useDailyBackground({
    query: 'landscape,nature,mountain,forest,lake,valley',
    orientation: 'landscape'
  });

  const { contrast, isLoading: isLoadingContrast } = useImageContrast(imageUrl);

  useEffect(() => {
    if (!isLoadingImage && !isLoadingContrast && imageUrl) {
      // Aplicar la imagen de fondo al body
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      
      // Aplicar variables CSS para los colores dinámicos
      document.documentElement.style.setProperty('--dynamic-text-color', contrast.textColor);
      document.documentElement.style.setProperty('--dynamic-overlay-color', contrast.overlayColor);
      
      // Aplicar el overlay al body
      document.body.style.setProperty('--overlay-color', contrast.overlayColor);
    }
  }, [imageUrl, contrast, isLoadingImage, isLoadingContrast]);

  return <>{children}</>;
}
