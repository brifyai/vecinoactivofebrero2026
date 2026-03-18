# Chat Vecinal - Instrucciones de Configuración

El chat vecinal ha sido implementado con un backend profesional usando Node.js, Express, Socket.io y Supabase.

## 📋 Requisitos Previos

- Node.js instalado
- Acceso a Supabase en https://supabase.vecinoactivo.cl
- Credenciales de administrador de Supabase

## 🚀 Pasos para Configurar

### 1. Configurar Supabase

1. Ve a https://supabase.vecinoactivo.cl
2. Inicia sesión con tus credenciales de administrador
3. Ve a **SQL Editor** en el menú lateral
4. Abre el archivo `server/supabase-tables.sql`
5. Copia todo el contenido del archivo SQL
6. Pégalo en el editor de Supabase
7. Haz clic en **Run** para ejecutar el script

Esto creará las tablas necesarias:
- `users` - Usuarios del sistema
- `chat_rooms` - Salas de chat vecinales
- `chat_messages` - Mensajes del chat

### 2. Configurar el Backend

1. Ve al directorio del servidor:
   ```bash
   cd server
   ```

2. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   copy .env.example .env
   ```

3. Edita el archivo `.env` y agrega tus credenciales de Supabase:
   ```env
   SUPABASE_URL=https://supabase.vecinoactivo.cl
   SUPABASE_ANON_KEY=tu_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   JWT_SECRET=tu_secreto_jwt_aqui
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

   **Nota:** Puedes obtener las claves de Supabase en:
   - Settings → API → anon public
   - Settings → API → service_role secret

4. Instala las dependencias:
   ```bash
   npm install
   ```

### 3. Iniciar el Servidor Backend

En el directorio `server`:
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3001`

### 4. Iniciar el Frontend

En el directorio raíz del proyecto:
```bash
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

## 🧪 Probar el Chat

1. Abre el navegador en `http://localhost:5173`
2. Regístrate con una cuenta nueva
3. Inicia sesión
4. Ve a la sección "Chat Vecinal"
5. Crea una nueva sala de chat o únete a una existente
6. Envía mensajes en tiempo real

## 📁 Estructura del Proyecto

```
vecino activo v1/
├── server/                    # Backend del chat
│   ├── src/
│   │   ├── index.ts          # Servidor principal
│   │   ├── routes/           # Rutas de la API
│   │   └── middleware/       # Middleware de autenticación
│   ├── supabase-tables.sql   # Script SQL para crear tablas
│   ├── package.json
│   └── .env                  # Variables de entorno (no en Git)
│
├── src/
│   ├── lib/
│   │   └── api.ts            # Cliente API del frontend
│   ├── hooks/
│   │   └── useChat.ts        # Hook de React para el chat
│   └── screens/
│       └── Feed.tsx          # Pantalla del chat vecinal
│
├── .env                      # Variables de entorno del frontend
└── .env.example              # Ejemplo de variables de entorno
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Chat
- `GET /api/chat/rooms` - Obtener todas las salas de chat
- `POST /api/chat/rooms` - Crear una nueva sala de chat
- `GET /api/chat/rooms/:roomId/messages` - Obtener mensajes de una sala
- `POST /api/chat/rooms/:roomId/messages` - Enviar un mensaje

### WebSocket Events
- `join_room` - Unirse a una sala de chat
- `send_message` - Enviar mensaje en tiempo real
- `new_message` - Recibir mensajes en tiempo real

## 🔒 Seguridad

- Las contraseñas se hashean con bcryptjs
- Se usa JWT para autenticación
- El backend valida todos los tokens
- CORS configurado para permitir solo el frontend

## 🐛 Solución de Problemas

### El chat no funciona
- Asegúrate de que el servidor backend esté corriendo
- Verifica que las credenciales de Supabase sean correctas
- Revisa la consola del navegador para errores

### No puedo crear salas de chat
- Verifica que las tablas de Supabase se hayan creado correctamente
- Asegúrate de estar autenticado

### Los mensajes no se envían en tiempo real
- Verifica que Socket.io esté funcionando
- Revisa la consola del backend para errores de WebSocket

## 📝 Notas

- El frontend ya está configurado para usar la API real
- Las variables de entorno del frontend están en `.env`
- El backend usa Supabase self-hosted en https://supabase.vecinoactivo.cl
- Socket.io proporciona comunicación en tiempo real
