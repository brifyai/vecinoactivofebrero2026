-- =====================================================
-- VECINO ACTIVO - Tablas de Chat (Versión Backend)
-- Este script crea las tablas de chat con la estructura
-- exacta que espera el backend
-- =====================================================

-- Eliminar tablas si existen (en orden de dependencias)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- =====================================================
-- TABLA: chat_rooms (Salas de Chat)
-- Estructura simplificada usada por el backend
-- =====================================================
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '💬', -- Emoji o inicial
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para chat_rooms
CREATE INDEX idx_chat_rooms_created ON chat_rooms(created_at);

-- =====================================================
-- TABLA: chat_messages (Mensajes de Chat)
-- Estructura simplificada usada por el backend
-- =====================================================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(10) DEFAULT '👤',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para chat_messages
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar salas de chat por defecto
INSERT INTO chat_rooms (name, avatar) VALUES
('Junta de Vecinos', '👥'),
('Seguridad UV4', '🛡️'),
('Grupo Jardinería', '🌱'),
('Mercado Comunitario', '🛒');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
