-- Tabla de eventos
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  organizer_id UUID,
  organizer_name VARCHAR(255),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Habilitar RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  USING (true);

-- Políticas de RLS para event_attendees
DROP POLICY IF EXISTS "Attendees are viewable by everyone" ON event_attendees;
CREATE POLICY "Attendees are viewable by everyone"
  ON event_attendees FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can join events" ON event_attendees;
CREATE POLICY "Authenticated users can join events"
  ON event_attendees FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can leave events" ON event_attendees;
CREATE POLICY "Authenticated users can leave events"
  ON event_attendees FOR DELETE
  USING (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);

-- Datos de ejemplo
INSERT INTO events (title, description, date, location, category, organizer_name, max_attendees, current_attendees, image_url, is_active) VALUES
  ('Junta de Vecinos Mensual', 'Reunión mensual para discutir temas de interés comunitario. Todos son bienvenidos.', NOW() + INTERVAL '7 days', 'Sala Comunitaria UV4', 'Comunidad', 'Junta de Vecinos', 50, 23, 'https://images.unsplash.com/photo-1555662335-7f8d8b9b2b8f?w=400', true),
  ('Festival de Verano', 'Festival anual con música, comida y actividades para toda la familia.', NOW() + INTERVAL '14 days', 'Plaza Central', 'Recreación', 'Comité de Eventos', 200, 87, 'https://images.unsplash.com/photo-1459749411177-287ce3278c0e?w=400', true),
  ('Taller de Jardinería', 'Aprende técnicas de jardinería y cuidado de plantas con expertos.', NOW() + INTERVAL '3 days', 'Jardín Comunitario', 'Educación', 'Grupo Jardinería', 30, 12, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', true),
  ('Mercado de Productores', 'Venta de productos frescos directamente de los productores locales.', NOW() + INTERVAL '2 days', 'Plaza Central', 'Comercio', 'Mercado Comunitario', 100, 45, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400', true),
  ('Clase de Yoga al Aire Libre', 'Sesión de yoga gratuita en el parque. Trae tu propia colchoneta.', NOW() + INTERVAL '5 days', 'Parque Vecinal', 'Salud', 'Grupo de Salud', 20, 15, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', true),
  ('Cine al Aire Libre', 'Proyección de película familiar bajo las estrellas. Entrada gratuita.', NOW() + INTERVAL '10 days', 'Plaza Central', 'Entretenimiento', 'Comité de Cultura', 150, 67, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400', true);
