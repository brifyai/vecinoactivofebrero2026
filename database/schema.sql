-- =====================================================
-- VECINO ACTIVO - Script de Base de Datos
-- PostgreSQL Schema
-- =====================================================

-- Eliminar tablas si existen (en orden de dependencias)
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_room_members CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS business_categories CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS user_units CASCADE;
DROP TABLE IF EXISTS unidades_vecinales CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- TABLA: users (Usuarios)
-- Almacena información de los vecinos registrados
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'vecino' CHECK (role IN ('vecino', 'moderador', 'admin', 'junta_vecinal')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- TABLA: unidades_vecinales (Unidades Vecinales)
-- Información de las unidades vecinales de Chile
-- =====================================================
CREATE TABLE unidades_vecinales (
    id SERIAL PRIMARY KEY,
    codigo_uv VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    provincia VARCHAR(100),
    comuna VARCHAR(100),
    poblacion INTEGER,
    superficie_km2 DECIMAL(10, 2),
    geometry JSONB, -- GeoJSON geometry
    centroide_lat DECIMAL(10, 8),
    centroide_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para unidades_vecinales
CREATE INDEX idx_uv_codigo ON unidades_vecinales(codigo_uv);
CREATE INDEX idx_uv_comuna ON unidades_vecinales(comuna);
CREATE INDEX idx_uv_region ON unidades_vecinales(region);
CREATE INDEX idx_uv_geometry ON unidades_vecinales USING GIN (geometry);

-- =====================================================
-- TABLA: user_units (Relación Usuario - Unidad Vecinal)
-- Asocia usuarios con sus unidades vecinales
-- =====================================================
CREATE TABLE user_units (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unidad_id INTEGER NOT NULL REFERENCES unidades_vecinales(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT TRUE,
    is_resident BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, unidad_id)
);

-- Índices para user_units
CREATE INDEX idx_user_units_user ON user_units(user_id);
CREATE INDEX idx_user_units_unidad ON user_units(unidad_id);

-- =====================================================
-- TABLA: posts (Publicaciones del Feed)
-- Publicaciones de los vecinos en el muro comunitario
-- =====================================================
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    post_type VARCHAR(50) DEFAULT 'general' CHECK (post_type IN ('general', 'alerta', 'evento', 'mercado', 'ayuda', 'noticia')),
    visibility VARCHAR(50) DEFAULT 'unidad' CHECK (visibility IN ('publico', 'unidad', 'privado')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para posts
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_unidad ON posts(unidad_id);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_active ON posts(is_active);

-- =====================================================
-- TABLA: post_likes (Likes en Publicaciones)
-- Registro de likes de usuarios en posts
-- =====================================================
CREATE TABLE post_likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Índices para post_likes
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- =====================================================
-- TABLA: comments (Comentarios)
-- Comentarios en publicaciones
-- =====================================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para comments
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- =====================================================
-- TABLA: events (Eventos Comunitarios)
-- Eventos y actividades de la comunidad
-- =====================================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_url VARCHAR(500),
    max_attendees INTEGER,
    attendees_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'activo' CHECK (status IN ('borrador', 'activo', 'cancelado', 'finalizado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para events
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_unidad ON events(unidad_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);

-- =====================================================
-- TABLA: event_attendees (Asistentes a Eventos)
-- Registro de asistencia a eventos
-- =====================================================
CREATE TABLE event_attendees (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'confirmado' CHECK (status IN ('pendiente', 'confirmado', 'cancelado', 'asistio')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Índices para event_attendees
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);

-- =====================================================
-- TABLA: alerts (Alertas de Seguridad)
-- Alertas y reportes de seguridad vecinal
-- =====================================================
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN (
        'sos', 'sospecha', 'robo', 'ruido', 'incendio', 
        'accidente', 'perdida', 'mascota_perdida', 'otro'
    )),
    title VARCHAR(255),
    description TEXT NOT NULL,
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    severity VARCHAR(50) DEFAULT 'media' CHECK (severity IN ('baja', 'media', 'alta', 'critica')),
    status VARCHAR(50) DEFAULT 'activo' CHECK (status IN ('activo', 'investigando', 'resuelto', 'falso')),
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    resolution_notes TEXT,
    image_url TEXT,
    is_sos BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para alerts
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_unidad ON alerts(unidad_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_location ON alerts(location_lat, location_lng);

-- =====================================================
-- TABLA: business_categories (Categorías de Negocios)
-- Categorías para el directorio comercial
-- =====================================================
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para business_categories
CREATE INDEX idx_business_categories_slug ON business_categories(slug);
CREATE INDEX idx_business_categories_active ON business_categories(is_active);

-- =====================================================
-- TABLA: businesses (Negocios Locales)
-- Directorio de negocios y servicios locales
-- =====================================================
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES business_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    whatsapp VARCHAR(50),
    opening_hours JSONB, -- {"mon": "09:00-18:00", "tue": "09:00-18:00", ...}
    is_24h BOOLEAN DEFAULT FALSE,
    is_home_delivery BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para businesses
CREATE INDEX idx_businesses_user ON businesses(user_id);
CREATE INDEX idx_businesses_unidad ON businesses(unidad_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_active ON businesses(is_active);
CREATE INDEX idx_businesses_location ON businesses(location_lat, location_lng);

-- =====================================================
-- TABLA: business_reviews (Reseñas de Negocios)
-- Reseñas y calificaciones de negocios
-- =====================================================
CREATE TABLE business_reviews (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, user_id)
);

-- Índices para business_reviews
CREATE INDEX idx_business_reviews_business ON business_reviews(business_id);
CREATE INDEX idx_business_reviews_user ON business_reviews(user_id);

-- =====================================================
-- TABLA: chat_rooms (Salas de Chat)
-- Salas de chat grupales y conversaciones
-- =====================================================
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar VARCHAR(10), -- Emoji o inicial
    room_type VARCHAR(50) DEFAULT 'grupo' CHECK (room_type IN ('privado', 'grupo', 'unidad', 'soporte')),
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para chat_rooms
CREATE INDEX idx_chat_rooms_type ON chat_rooms(room_type);
CREATE INDEX idx_chat_rooms_unidad ON chat_rooms(unidad_id);
CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);

-- =====================================================
-- TABLA: chat_room_members (Miembros de Salas de Chat)
-- Relación entre usuarios y salas de chat
-- =====================================================
CREATE TABLE chat_room_members (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'miembro' CHECK (role IN ('admin', 'moderador', 'miembro')),
    last_read_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_muted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Índices para chat_room_members
CREATE INDEX idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX idx_chat_room_members_user ON chat_room_members(user_id);

-- =====================================================
-- TABLA: chat_messages (Mensajes de Chat)
-- Mensajes en las salas de chat
-- =====================================================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'texto' CHECK (message_type IN ('texto', 'imagen', 'archivo', 'ubicacion', 'sistema')),
    file_url TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    reply_to INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para chat_messages
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- =====================================================
-- TABLA: message_reads (Lectura de Mensajes)
-- Registro de mensajes leídos por usuario
-- =====================================================
CREATE TABLE message_reads (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Índices para message_reads
CREATE INDEX idx_message_reads_message ON message_reads(message_id);
CREATE INDEX idx_message_reads_user ON message_reads(user_id);

-- =====================================================
-- TABLA: notifications (Notificaciones)
-- Sistema de notificaciones para usuarios
-- =====================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL CHECK (type IN (
        'alerta_nueva', 'comentario', 'like', 'evento_recordatorio',
        'mensaje', 'mencion', 'sistema', 'seguridad', 'bienvenida'
    )),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB, -- Datos adicionales (post_id, event_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- TABLA: emergency_contacts (Contactos de Emergencia)
-- Contactos de emergencia y plan cuadrante
-- =====================================================
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE CASCADE,
    contact_type VARCHAR(100) NOT NULL CHECK (contact_type IN (
        'carabineros', 'bomberos', 'ambulancia', 'patrullero', 
        'junta_vecinal', 'seguridad_privada', 'otro'
    )),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    officer_name VARCHAR(255), -- Nombre del oficial a cargo (plan cuadrante)
    officer_phone VARCHAR(50),
    officer_photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para emergency_contacts
CREATE INDEX idx_emergency_contacts_unidad ON emergency_contacts(unidad_id);
CREATE INDEX idx_emergency_contacts_type ON emergency_contacts(contact_type);

-- =====================================================
-- TABLA: polls (Encuestas y Votaciones)
-- Encuestas comunitarias para participación ciudadana
-- =====================================================
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    poll_type VARCHAR(50) DEFAULT 'simple' CHECK (poll_type IN ('simple', 'multiple', 'calificacion')),
    ends_at TIMESTAMP,
    is_anonymous BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    total_votes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'activa' CHECK (status IN ('borrador', 'activa', 'cerrada', 'cancelada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para polls
CREATE INDEX idx_polls_user ON polls(user_id);
CREATE INDEX idx_polls_unidad ON polls(unidad_id);
CREATE INDEX idx_polls_status ON polls(status);

-- =====================================================
-- TABLA: poll_options (Opciones de Encuestas)
-- Opciones disponibles en cada encuesta
-- =====================================================
CREATE TABLE poll_options (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text VARCHAR(500) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para poll_options
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

-- =====================================================
-- TABLA: poll_votes (Votos en Encuestas)
-- Registro de votos de usuarios
-- =====================================================
CREATE TABLE poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255), -- Para votos anónimos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id),
    UNIQUE(poll_id, session_id)
);

-- Índices para poll_votes
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);

-- =====================================================
-- TABLA: help_requests (Solicitudes de Ayuda)
-- Solicitudes de ayuda vecinal
-- =====================================================
CREATE TABLE help_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unidad_id INTEGER REFERENCES unidades_vecinales(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    help_type VARCHAR(100) NOT NULL CHECK (help_type IN (
        'compras', 'transporte', 'mascotas', 'reparaciones', 
        'salud', 'educacion', 'otros'
    )),
    urgency VARCHAR(50) DEFAULT 'normal' CHECK (urgency IN ('baja', 'normal', 'alta', 'urgente')),
    status VARCHAR(50) DEFAULT 'abierta' CHECK (status IN ('abierta', 'en_proceso', 'completada', 'cancelada')),
    location_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    image_url TEXT,
    volunteer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para help_requests
CREATE INDEX idx_help_requests_user ON help_requests(user_id);
CREATE INDEX idx_help_requests_unidad ON help_requests(unidad_id);
CREATE INDEX idx_help_requests_type ON help_requests(help_type);
CREATE INDEX idx_help_requests_status ON help_requests(status);

-- =====================================================
-- TABLA: reports (Reportes de Contenido)
-- Reportes de contenido inapropiado
-- =====================================================
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'comment', 'event', 'business', 'user', 'message')),
    content_id INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL CHECK (reason IN (
        'spam', 'acoso', 'contenido_inapropiado', 'falsa_informacion', 
        'estafa', 'otro'
    )),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'revisando', 'resuelto', 'descartado')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reports
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_content ON reports(content_type, content_id);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de posts con información del usuario
CREATE VIEW posts_with_users AS
SELECT 
    p.*,
    u.name as user_name,
    u.avatar_url as user_avatar,
    uv.nombre as unidad_nombre,
    uv.comuna
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN unidades_vecinales uv ON p.unidad_id = uv.id
WHERE p.is_active = TRUE;

-- Vista de eventos próximos
CREATE VIEW upcoming_events AS
SELECT 
    e.*,
    u.name as organizer_name,
    uv.nombre as unidad_nombre
FROM events e
JOIN users u ON e.user_id = u.id
LEFT JOIN unidades_vecinales uv ON e.unidad_id = uv.id
WHERE e.event_date >= CURRENT_DATE
AND e.status = 'activo'
ORDER BY e.event_date ASC, e.start_time ASC;

-- Vista de alertas activas
CREATE VIEW active_alerts AS
SELECT 
    a.*,
    u.name as user_name,
    uv.nombre as unidad_nombre
FROM alerts a
JOIN users u ON a.user_id = u.id
LEFT JOIN unidades_vecinales uv ON a.unidad_id = uv.id
WHERE a.status = 'activo'
ORDER BY a.created_at DESC;

-- Vista de chat rooms con último mensaje
CREATE VIEW chat_rooms_with_last_message AS
SELECT 
    cr.*,
    cm.content as last_message,
    cm.created_at as last_message_time,
    u.name as last_message_user
FROM chat_rooms cr
LEFT JOIN LATERAL (
    SELECT content, created_at, user_id
    FROM chat_messages
    WHERE room_id = cr.id AND is_deleted = FALSE
    ORDER BY created_at DESC
    LIMIT 1
) cm ON TRUE
LEFT JOIN users u ON cm.user_id = u.id
WHERE cr.is_active = TRUE;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_help_requests_updated_at BEFORE UPDATE ON help_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contador de likes en posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Función para actualizar contador de comentarios en posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_post_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Función para actualizar contador de asistentes en eventos
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET attendees_count = attendees_count + 1 WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET attendees_count = GREATEST(attendees_count - 1, 0) WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_event_attendees_count
AFTER INSERT OR DELETE ON event_attendees
FOR EACH ROW EXECUTE FUNCTION update_event_attendees_count();

-- Función para actualizar rating promedio de negocios
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE businesses 
    SET rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM business_reviews 
        WHERE business_id = NEW.business_id AND is_active = TRUE
    ),
    reviews_count = (
        SELECT COUNT(*) 
        FROM business_reviews 
        WHERE business_id = NEW.business_id AND is_active = TRUE
    )
    WHERE id = NEW.business_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_business_rating
AFTER INSERT OR UPDATE OR DELETE ON business_reviews
FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Función para actualizar contador de votos en encuestas
CREATE OR REPLACE FUNCTION update_poll_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE poll_options SET votes_count = votes_count + 1 WHERE id = NEW.option_id;
        UPDATE polls SET total_votes = total_votes + 1 WHERE id = NEW.poll_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE poll_options SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = OLD.option_id;
        UPDATE polls SET total_votes = GREATEST(total_votes - 1, 0) WHERE id = OLD.poll_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_poll_votes_count
AFTER INSERT OR DELETE ON poll_votes
FOR EACH ROW EXECUTE FUNCTION update_poll_votes_count();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorías de negocios
INSERT INTO business_categories (name, slug, icon, description, sort_order) VALUES
('Almacén', 'almacen', '🏪', 'Almacenes y minimarkets', 1),
('Alimentos', 'alimentos', '🍞', 'Panaderías, carnicerías, verdulerías', 2),
('Servicios', 'servicios', '🔧', 'Gasfitería, electricidad, pintura', 3),
('Salud', 'salud', '💊', 'Farmacias, consultorios, veterinarias', 4),
('Educación', 'educacion', '📚', 'Jardines, academias, talleres', 5),
('Belleza', 'belleza', '💇', 'Peluquerías, salones de belleza', 6),
('Deportes', 'deportes', '⚽', 'Gimnasios, canchas, artículos deportivos', 7),
('Hogar', 'hogar', '🏠', 'Ferretería, decoración, jardinería', 8),
('Tecnología', 'tecnologia', '💻', 'Reparaciones, venta de equipos', 9),
('Transporte', 'transporte', '🚗', 'Taxis, talleres, estacionamientos', 10);

-- Insertar contactos de emergencia generales
INSERT INTO emergency_contacts (contact_type, name, phone, is_active) VALUES
('carabineros', 'Carabineros de Chile', '133', TRUE),
('bomberos', 'Bomberos de Chile', '132', TRUE),
('ambulancia', 'SAMU - Ambulancia', '131', TRUE);

-- =====================================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =====================================================

-- Índice para búsqueda de texto completo en posts
CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('spanish', content));

-- Índice para búsqueda de texto completo en alerts
CREATE INDEX idx_alerts_description_search ON alerts USING gin(to_tsvector('spanish', description));

-- Índice compuesto para feed de posts por unidad
CREATE INDEX idx_posts_unidad_created ON posts(unidad_id, created_at DESC);

-- Índice compuesto para alertas por unidad y fecha
CREATE INDEX idx_alerts_unidad_created ON alerts(unidad_id, created_at DESC);

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE users IS 'Usuarios registrados en la plataforma Vecino Activo';
COMMENT ON TABLE unidades_vecinales IS 'Unidades vecinales de Chile con información geográfica';
COMMENT ON TABLE user_units IS 'Relación entre usuarios y sus unidades vecinales';
COMMENT ON TABLE posts IS 'Publicaciones en el feed comunitario';
COMMENT ON TABLE post_likes IS 'Likes dados por usuarios a publicaciones';
COMMENT ON TABLE comments IS 'Comentarios en publicaciones';
COMMENT ON TABLE events IS 'Eventos y actividades comunitarias';
COMMENT ON TABLE event_attendees IS 'Registro de asistencia a eventos';
COMMENT ON TABLE alerts IS 'Alertas de seguridad y emergencias';
COMMENT ON TABLE business_categories IS 'Categorías del directorio comercial';
COMMENT ON TABLE businesses IS 'Negocios y servicios locales';
COMMENT ON TABLE business_reviews IS 'Reseñas de negocios';
COMMENT ON TABLE chat_rooms IS 'Salas de chat grupales y privadas';
COMMENT ON TABLE chat_room_members IS 'Miembros de salas de chat';
COMMENT ON TABLE chat_messages IS 'Mensajes en salas de chat';
COMMENT ON TABLE notifications IS 'Notificaciones del sistema';
COMMENT ON TABLE emergency_contacts IS 'Contactos de emergencia y plan cuadrante';
COMMENT ON TABLE polls IS 'Encuestas y votaciones comunitarias';
COMMENT ON TABLE poll_options IS 'Opciones de votación en encuestas';
COMMENT ON TABLE poll_votes IS 'Votos emitidos en encuestas';
COMMENT ON TABLE help_requests IS 'Solicitudes de ayuda vecinal';
COMMENT ON TABLE reports IS 'Reportes de contenido inapropiado';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
