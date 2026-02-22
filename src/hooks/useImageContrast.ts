import { useState, useEffect, useCallback } from 'react';

interface ContrastResult {
  isDark: boolean;
  luminance: number;
  textColor: string;
  overlayColor: string;
}

/**
 * Analiza el contraste de una imagen usando la fórmula WCAG de luminancia
 * @param imageUrl - URL de la imagen a analizar
 * @returns Información sobre el contraste de la imagen
 */
export function useImageContrast(imageUrl: string) {
  const [contrast, setContrast] = useState<ContrastResult>({
    isDark: true,
    luminance: 0,
    textColor: '#e2e8f0',
    overlayColor: 'rgba(0, 0, 0, 0.5)'
  });
  const [isLoading, setIsLoading] = useState(false);

  const analyzeImage = useCallback(async (url: string) => {
    setIsLoading(true);
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Crear un canvas oculto para analizar los píxeles
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }

      // Redimensionar para mejor rendimiento
      const maxSize = 100;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Obtener los píxeles
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Calcular la luminancia promedio usando la fórmula WCAG
      let totalLuminance = 0;
      let pixelCount = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Ignorar píxeles transparentes
        if (a < 128) continue;

        // Fórmula WCAG para luminancia relativa
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        totalLuminance += luminance;
        pixelCount++;
      }

      const avgLuminance = pixelCount > 0 ? totalLuminance / pixelCount : 0.5;
      const isDark = avgLuminance < 0.5;

      // Colores basados en el análisis
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const overlayColor = isDark 
        ? `rgba(0, 0, 0, ${Math.max(0.3, 0.5 - avgLuminance * 0.3)})` 
        : `rgba(255, 255, 255, ${Math.max(0.3, 0.5 - (1 - avgLuminance) * 0.3)})`;

      setContrast({
        isDark,
        luminance: avgLuminance,
        textColor,
        overlayColor
      });

    } catch (error) {
      console.error('Error al analizar la imagen:', error);
      // Valores por defecto en caso de error
      setContrast({
        isDark: true,
        luminance: 0,
        textColor: '#e2e8f0',
        overlayColor: 'rgba(0, 0, 0, 0.5)'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (imageUrl) {
      analyzeImage(imageUrl);
    }
  }, [imageUrl, analyzeImage]);

  return { contrast, isLoading };
}
