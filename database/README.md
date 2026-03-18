# Base de Datos - Vecino Activo

Este directorio contiene los scripts SQL para la base de datos PostgreSQL de la aplicación Vecino Activo.

## 📁 Estructura de Archivos

```
database/
├── schema.sql    # Esquema completo de la base de datos
├── seed.sql      # Datos de ejemplo para desarrollo
└── README.md     # Este archivo
```

## 🚀 Instalación Rápida

### 1. Crear la base de datos

```sql
CREATE DATABASE vecino_activo;
```

### 2. Ejecutar el esquema

```bash
psql -d vecino_activo -f schema.sql
```

### 3. Cargar datos de ejemplo (opcional)

```bash
psql -d vecino_activo -f seed.sql
```

## 📊 Diagrama de Tablas

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│  id, email, password_hash, name, phone, address, role           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  USER_UNITS   │   │    POSTS      │   │    EVENTS     │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│  UNIDADES_    │   │  POST_LIKES   │   │  EVENT_ATTENDEES  │
│  VECINALES    │   │  COMMENTS     │   └───────────────────┘
└───────────────┘   └───────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   ALERTS      │   │  BUSINESSES   │   │  CHAT_ROOMS   │
└───────────────┘   └───────────────┘   └───────┬───────┘
                                                │
                                                ▼
                                        ┌───────────────┐
                                        │ CHAT_MESSAGES │
                                        └───────────────┘
```

## 📋 Tablas Principales

### Usuarios y Autenticación
| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios registrados |
| `user_units` | Relación usuarios-unidades vecinales |

### Geografía
| Tabla | Descripción |
|-------|-------------|
| `unidades_vecinales` | Unidades vecinales de Chile con geometría |

### Contenido Social
| Tabla | Descripción |
|-------|-------------|
| `posts` | Publicaciones del feed |
| `post_likes` | Likes en publicaciones |
| `comments` | Comentarios |
| `events` | Eventos comunitarios |
| `event_attendees` | Asistentes a eventos |

### Seguridad
| Tabla | Descripción |
|-------|-------------|
| `alerts` | Alertas de seguridad |
| `emergency_contacts` | Contactos de emergencia y plan cuadrante |

### Comercio Local
| Tabla | Descripción |
|-------|-------------|
| `business_categories` | Categorías de negocios |
| `businesses` | Negocios locales |
| `business_reviews` | Reseñas de negocios |

### Comunicación
| Tabla | Descripción |
|-------|-------------|
| `chat_rooms` | Salas de chat |
| `chat_room_members` | Miembros de salas |
| `chat_messages` | Mensajes |
| `notifications` | Notificaciones del sistema |

### Participación Ciudadana
| Tabla | Descripción |
|-------|-------------|
| `polls` | Encuestas y votaciones |
| `poll_options` | Opciones de encuestas |
| `poll_votes` | Votos |
| `help_requests` | Solicitudes de ayuda vecinal |

### Moderación
| Tabla | Descripción |
|-------|-------------|
| `reports` | Reportes de contenido |

## 🔐 Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `vecino` | Usuario estándar |
| `moderador` | Puede moderar contenido |
| `admin` | Administrador del sistema |
| `junta_vecinal` | Representante de junta vecinal |

## 📌 Tipos de Contenido

### Tipos de Posts
- `general` - Publicación general
- `alerta` - Alerta de seguridad
- `evento` - Evento comunitario
- `mercado` - Venta/intercambio
- `ayuda` - Solicitud de ayuda
- `noticia` - Noticia importante

### Tipos de Alertas
- `sos` - Emergencia crítica
- `sospecha` - Actividad sospechosa
- `robo` - Robo o intento
- `ruido` - Ruido molesto
- `incendio` - Incendio
- `accidente` - Accidente
- `perdida` - Objeto perdido
- `mascota_perdida` - Mascota perdida
- `otro` - Otro tipo

### Severidad de Alertas
- `baja` - Baja prioridad
- `media` - Prioridad media
- `alta` - Alta prioridad
- `critica` - Emergencia crítica

## ⚡ Funciones y Triggers

El esquema incluye varios triggers automáticos:

1. **Actualización de `updated_at`**: Actualiza automáticamente el campo en cada modificación
2. **Contador de likes**: Mantiene actualizado `likes_count` en posts
3. **Contador de comentarios**: Mantiene actualizado `comments_count` en posts
4. **Contador de asistentes**: Mantiene actualizado `attendees_count` en eventos
5. **Rating de negocios**: Calcula el promedio de calificaciones automáticamente
6. **Contador de votos**: Actualiza contadores en encuestas

## 🔍 Vistas Útiles

| Vista | Descripción |
|-------|-------------|
| `posts_with_users` | Posts con información del autor |
| `upcoming_events` | Eventos próximos activos |
| `active_alerts` | Alertas activas recientes |
| `chat_rooms_with_last_message` | Salas con último mensaje |

## 📝 Notas de Uso

### Contraseñas
Las contraseñas deben almacenarse hasheadas con bcrypt. Ejemplo:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Geometría
El campo `geometry` en `unidades_vecinales` almacena GeoJSON en formato JSONB para compatibilidad con herramientas de mapeo.

### Búsqueda de Texto
Se incluyen índices GIN para búsqueda de texto completo en español en posts y alertas.

## 🔧 Comandos Útiles

```sql
-- Ver todas las tablas
\dt

-- Describir una tabla
\d users

-- Ver índices
\di

-- Ver vistas
\dv

-- Tamaño de la base de datos
SELECT pg_size_pretty(pg_database_size('vecino_activo'));

-- Estadísticas de tablas
SELECT relname, n_live_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
```

## 📞 Soporte

Para consultas sobre la base de datos, contactar al equipo de desarrollo.
