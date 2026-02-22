-- ============================================
-- TABLAS PARA CHAT VECINAL - VECINO ACTIVO
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) DEFAULT '👤',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de salas de chat
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) DEFAULT '💬',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar VARCHAR(50) DEFAULT '👤',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para users (solo lectura del propio usuario)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para chat_rooms (todos pueden ver)
CREATE POLICY "Anyone can view chat rooms" ON chat_rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can create chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para chat_messages (todos pueden ver)
CREATE POLICY "Anyone can view messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can create messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- DATOS INICIALES (SALAS DE CHAT)
-- ============================================

INSERT INTO chat_rooms (name, avatar, description) VALUES
  ('Junta de Vecinos', '👥', 'Comunicación oficial de la junta de vecinos'),
  ('Seguridad UV4', '🛡️', 'Alertas y noticias de seguridad del sector'),
  ('Grupo Jardinería', '🌱', 'Tips y consejos de jardinería comunitaria'),
  ('Mercado Comunitario', '🛒', 'Compra y venta entre vecinos')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener mensajes de una sala con info de usuario
CREATE OR REPLACE FUNCTION get_room_messages(p_room_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  room_id UUID,
  user_id UUID,
  user_name VARCHAR,
  user_avatar VARCHAR,
  message TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.room_id,
    m.user_id,
    m.user_name,
    m.user_avatar,
    m.message,
    m.created_at
  FROM chat_messages m
  WHERE m.room_id = p_room_id
  ORDER BY m.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener salas con último mensaje
CREATE OR REPLACE FUNCTION get_chat_rooms_with_last_message()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  avatar VARCHAR,
  description TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.avatar,
    r.description,
    m.message AS last_message,
    m.created_at AS last_message_time,
    0::BIGINT AS unread_count
  FROM chat_rooms r
  LEFT JOIN LATERAL (
    SELECT message, created_at
    FROM chat_messages
    WHERE room_id = r.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
  ORDER BY COALESCE(m.created_at, r.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Para que las políticas RLS funcionen correctamente,
-- necesitas configurar la autenticación de Supabase
-- y usar el cliente con el token JWT.
--
-- Por ahora, el servidor Node.js usará la SERVICE KEY
-- que tiene permisos de administrador.
-- ============================================