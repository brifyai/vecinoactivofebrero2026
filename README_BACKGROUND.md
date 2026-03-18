# Sistema de Fondo Dinámico Inteligente

Este proyecto implementa un sistema inteligente de fondo que cambia diariamente y ajusta automáticamente los colores de texto para garantizar un contraste óptimo.

## Características

### 🎨 Fondo Diario
- Cambia automáticamente cada día basándose en la fecha actual
- Utiliza imágenes de alta calidad de Unsplash
- Rotación determinista: la misma fecha siempre muestra la misma imagen

### 🧠 Análisis de Contraste Inteligente
- Analiza la luminancia de cada imagen usando la fórmula WCAG
- Calcula automáticamente si el texto debe ser claro u oscuro
- Ajusta dinámicamente el overlay para mejorar la legibilidad

### 🎯 WCAG Compliance
- Utiliza la fórmula estándar de luminancia relativa de WCAG:
  ```
  Luminancia = (0.299 × R + 0.587 × G + 0.114 × B) / 255
  ```
- Garantiza un contraste de al menos 4.5:1 para texto normal
- Garantiza un contraste de al menos 3:1 para texto grande

## Cómo Funciona

### 1. `useDailyBackground` Hook
```typescript
const { imageUrl, isLoading } = useDailyBackground({
  query: 'nature,landscape,mountain,forest',
  orientation: 'landscape'
});
```

- Genera una semilla basada en la fecha actual
- Selecciona una imagen de una lista predefinida de Unsplash
- La misma fecha siempre muestra la misma imagen

### 2. `useImageContrast` Hook
```typescript
const { contrast, isLoading } = useImageContrast(imageUrl);
```

- Carga la imagen en un Canvas oculto
- Analiza los píxeles para calcular la luminancia promedio
- Determina si el fondo es claro u oscuro
- Retorna colores de texto y overlay apropiados

### 3. `BackgroundProvider` Componente
```tsx
<BackgroundProvider>
  <App />
</BackgroundProvider>
```

- Orquesta ambos hooks
- Aplica las variables CSS dinámicas
- Maneja las transiciones suaves

## Variables CSS Dinámicas

El sistema actualiza las siguientes variables CSS:

```css
--dynamic-text-color: #e2e8f0;  /* Color del texto principal */
--dynamic-overlay-color: rgba(0, 0, 0, 0.5);  /* Color del overlay */
```

Puedes usar estas variables en tu CSS:

```css
.custom-element {
  color: var(--dynamic-text-color);
  background: var(--dynamic-overlay-color);
}
```

## Personalización

### Cambiar la Categoría de Imágenes

Edita [`useDailyBackground.ts`](src/hooks/useDailyBackground.ts):

```typescript
const { imageUrl } = useDailyBackground({
  query: 'beach,ocean',  // Cambia la categoría
  orientation: 'landscape'
});
```

### Agregar Más Imágenes

Edita la lista de IDs en [`useDailyBackground.ts`](src/hooks/useDailyBackground.ts):

```typescript
const photoIds = [
  'tu-photo-id-1',
  'tu-photo-id-2',
  // Agrega más IDs de Unsplash
];
```

### Ajustar el Algoritmo de Contraste

Edita [`useImageContrast.ts`](src/hooks/useImageContrast.ts):

```typescript
// Ajustar el umbral de luminancia
const isDark = avgLuminance < 0.5;  // Cambia 0.5 por otro valor

// Ajustar la opacidad del overlay
const overlayColor = isDark 
  ? `rgba(0, 0, 0, ${Math.max(0.3, 0.5 - avgLuminance * 0.3)})`
  : `rgba(255, 255, 255, ${Math.max(0.3, 0.5 - (1 - avgLuminance) * 0.3)})`;
```

## Uso de la API de Unsplash

Para usar tu propia API key de Unsplash:

1. Regístrate en [unsplash.com/developers](https://unsplash.com/developers)
2. Crea una aplicación y obtén tu Access Key
3. Actualiza el hook `useDailyBackground`:

```typescript
const { imageUrl } = useDailyBackground({
  clientId: 'tu-access-key-aqui',
  query: 'nature,landscape',
  orientation: 'landscape'
});
```

## Notas Importantes

### CORS y Canvas
El análisis de imagen requiere que las imágenes tengan CORS habilitado. Las imágenes de Unsplash soportan CORS por defecto.

### Rendimiento
- El análisis de imagen se realiza una sola vez al cargar
- El canvas se redimensiona a 100x100 píxeles para mejor rendimiento
- Los resultados se cachean mientras la URL de la imagen no cambie

### Accesibilidad
- El sistema cumple con las pautas WCAG 2.1
- El contraste se recalcula automáticamente si la imagen cambia
- Las transiciones son suaves para evitar parpadeos

## Troubleshooting

### Las imágenes no cargan
- Verifica tu conexión a internet
- Asegúrate de que los IDs de Unsplash sean válidos

### El contraste no es óptimo
- Ajusta el umbral de luminancia en `useImageContrast.ts`
- Modifica la fórmula del overlay para más control

### El texto es difícil de leer
- Aumenta la opacidad mínima del overlay
- Ajusta el umbral de luminancia para detectar mejor fondos claros/oscuros

## Ejemplo de Uso Avanzado

```typescript
import { useDailyBackground, useImageContrast } from './hooks';

function MyComponent() {
  const { imageUrl } = useDailyBackground({
    query: 'city,urban',
    orientation: 'landscape'
  });

  const { contrast } = useImageContrast(imageUrl);

  return (
    <div style={{
      backgroundImage: `url(${imageUrl})`,
      color: contrast.textColor
    }}>
      <h1>Título</h1>
      <p>Texto con contraste optimizado</p>
    </div>
  );
}
```

## Recursos

- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
