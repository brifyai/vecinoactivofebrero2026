-- Tabla de servicios (negocios locales)
DROP TABLE IF EXISTS services CASCADE;

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create services" ON services;
CREATE POLICY "Authenticated users can create services"
  ON services FOR INSERT
  WITH CHECK (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_rating ON services(rating DESC);

-- Datos de ejemplo
INSERT INTO services (name, category, description, phone, email, address, rating, review_count, image_url, is_verified) VALUES
  ('Ferretería Vecinal', 'Hogar', 'Todo para el hogar y construcción. Atención personalizada.', '+56 9 1234 5678', 'contacto@ferreteriavecinal.cl', 'Av. Principal 123, UV4', 4.5, 120, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', true),
  ('Veterinario Los Pinos', 'Salud', 'Atención veterinaria 24/7 para mascotas.', '+56 9 2345 6789', 'info@veterinariolospinos.cl', 'Calle Los Pinos 456', 4.8, 85, 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400', true),
  ('Pizzería Don Mario', 'Comida', 'La mejor pizza del vecindario, delivery disponible.', '+56 9 3456 7890', 'pedidos@pizzeriadonmario.cl', 'Calle Principal 789', 4.3, 200, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', true),
  ('Jardín Infantil Sol', 'Educación', 'Educación preescolar de calidad para niños de 2-6 años.', '+56 9 4567 8901', 'info@jardinsol.cl', 'Pasaje Sol 321', 4.9, 45, 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400', true),
  ('Lavandería Express', 'Servicios', 'Lavado y planchado rápido. Servicio a domicilio.', '+56 9 5678 9012', 'lavanderia@express.cl', 'Av. Central 654', 4.2, 95, 'https://images.unsplash.com/photo-1555662335-7f8d8b9b2b8f?w=400', true),
  ('Panadería Artesanal', 'Comida', 'Pan fresco todos los días. Pasteles y postres.', '+56 9 6789 0123', 'panaderia@artesanal.cl', 'Calle Artesanos 987', 4.6, 150, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', true);
