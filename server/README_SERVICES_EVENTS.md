# Instrucciones para habilitar Servicios y Eventos

## Pasos para configurar la base de datos

Los scripts SQL para crear las tablas de servicios y eventos deben ejecutarse manualmente en el panel de Supabase.

### 1. Ejecutar script de Servicios

1. Ve a https://supabase.vecinoactivo.cl
2. Inicia sesión con tus credenciales
3. Navega al **SQL Editor** en el menú lateral
4. Copia el contenido del archivo `server/services-table.sql`
5. Pega el contenido en el editor SQL
6. Haz clic en **Run** para ejecutar el script

### 2. Ejecutar script de Eventos

1. En el mismo SQL Editor
2. Copia el contenido del archivo `server/events-table.sql`
3. Pega el contenido en el editor SQL
4. Haz clic en **Run** para ejecutar el script

## Qué crean estos scripts

### services-table.sql
- Tabla `services`: Almacena información de servicios locales (negocios)
- Campos: nombre, categoría, descripción, teléfono, email, dirección, rating, etc.
- Políticas RLS para permitir lectura pública y creación autenticada
- Datos de ejemplo: 6 servicios pre-cargados

### events-table.sql
- Tabla `events`: Almacena información de eventos comunitarios
- Tabla `event_attendees`: Registra quiénes asisten a cada evento
- Campos: título, descripción, fecha, ubicación, categoría, organizador, etc.
- Políticas RLS para permitir lectura pública y gestión autenticada
- Datos de ejemplo: 6 eventos pre-cargados

## Verificar la instalación

Después de ejecutar los scripts, puedes verificar que las tablas se crearon correctamente:

1. Ve al **Table Editor** en el panel de Supabase
2. Deberías ver las tablas `services` y `events` (y `event_attendees`)
3. Haz clic en cada tabla para ver los datos de ejemplo

## API Endpoints disponibles

### Servicios
- `GET /api/services` - Obtener todos los servicios
- `GET /api/services/:id` - Obtener un servicio específico
- `POST /api/services` - Crear un nuevo servicio (requiere autenticación)

### Eventos
- `GET /api/events` - Obtener todos los eventos activos
- `GET /api/events/:id` - Obtener un evento específico
- `GET /api/events/:id/attendees` - Obtener asistentes de un evento
- `POST /api/events` - Crear un nuevo evento (requiere autenticación)
- `POST /api/events/:id/attend` - Asistir a un evento (requiere autenticación)
- `DELETE /api/events/:id/attend` - Cancelar asistencia a un evento (requiere autenticación)

## Probar la funcionalidad

1. Asegúrate de que el servidor backend esté corriendo:
   ```bash
   cd server
   npm run dev
   ```

2. Asegúrate de que el frontend esté corriendo:
   ```bash
   npm run dev
   ```

3. Abre el navegador en `http://localhost:5173`

4. Navega a:
   - **Servicios** para ver los servicios locales
   - **Eventos** para ver los eventos comunitarios

5. Para probar la funcionalidad de asistir a eventos:
   - Inicia sesión o regístrate en la aplicación
   - Ve a la sección Eventos
   - Haz clic en "Asistiré" en cualquier evento
   - Verás que el contador de asistentes aumenta
