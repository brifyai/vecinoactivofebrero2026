-- =====================================================
-- VECINO ACTIVO - Datos de Ejemplo (Seed Data)
-- PostgreSQL Seed Script
-- =====================================================

-- =====================================================
-- USUARIOS DE PRUEBA
-- =====================================================

-- Contraseña para todos los usuarios demo: demo123
-- Hash bcrypt generado con: bcrypt.hashSync('demo123', 10)
INSERT INTO users (email, password_hash, name, phone, address, role, is_verified, is_active) VALUES
('demo@vecino.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Camilo Alegria', '+56 9 1234 5678', 'Calle Los Pinos 123, Casa 5', 'vecino', TRUE, TRUE),
('maria.gonzalez@email.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'María González', '+56 9 2345 6789', 'Av. Principal 456, Depto 302', 'vecino', TRUE, TRUE),
('carlos.munoz@email.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Carlos Muñoz', '+56 9 3456 7890', 'Calle Los Robles 789', 'moderador', TRUE, TRUE),
('ana.perez@email.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Ana Pérez', '+56 9 4567 8901', 'Paseo del Bosque 321', 'vecino', TRUE, TRUE),
('roberto.diaz@email.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Roberto Díaz', '+56 9 5678 9012', 'Calle Los Alerces 654', 'vecino', TRUE, TRUE),
('camila.soto@email.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Camila Soto', '+56 9 6789 0123', 'Av. Los Libertadores 987', 'vecino', TRUE, TRUE),
('admin@vecinoactivo.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Administrador Sistema', '+56 9 0000 0000', 'Oficina Central', 'admin', TRUE, TRUE),
('junta.uv4@email.cl', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqhmM6JGKpS4G3R1G2JH8YpfB0Bqy', 'Junta Vecinal UV4', '+56 9 1111 2222', 'Sede Social UV4', 'junta_vecinal', TRUE, TRUE);

-- =====================================================
-- UNIDADES VECINALES DE EJEMPLO
-- =====================================================

INSERT INTO unidades_vecinales (codigo_uv, nombre, region, provincia, comuna, poblacion, superficie_km2, centroide_lat, centroide_lng) VALUES
('UV-001', 'Unidad Vecinal 1 - Centro', 'Metropolitana', 'Santiago', 'Santiago', 5500, 0.85, -33.4489, -70.6693),
('UV-002', 'Unidad Vecinal 2 - Norte', 'Metropolitana', 'Santiago', 'Santiago', 4200, 1.12, -33.4389, -70.6593),
('UV-003', 'Unidad Vecinal 3 - Sur', 'Metropolitana', 'Santiago', 'Santiago', 3800, 0.95, -33.4589, -70.6793),
('UV-004', 'Unidad Vecinal 4 - Oriente', 'Metropolitana', 'Santiago', 'Santiago', 6100, 1.45, -33.4489, -70.6493),
('UV-005', 'Unidad Vecinal 5 - Poniente', 'Metropolitana', 'Santiago', 'Santiago', 4700, 1.08, -33.4489, -70.6893),
('UV-101', 'Unidad Vecinal 1 - Providencia', 'Metropolitana', 'Santiago', 'Providencia', 5200, 0.78, -33.4269, -70.6117),
('UV-102', 'Unidad Vecinal 2 - Las Condes', 'Metropolitana', 'Santiago', 'Las Condes', 6800, 2.15, -33.4017, -70.5647),
('UV-201', 'Unidad Vecinal 1 - Viña del Mar', 'Valparaíso', 'Valparaíso', 'Viña del Mar', 7300, 1.89, -33.0242, -71.5518);

-- =====================================================
-- RELACIÓN USUARIOS - UNIDADES VECINALES
-- =====================================================

INSERT INTO user_units (user_id, unidad_id, is_primary, is_resident) VALUES
(1, 1, TRUE, TRUE),
(2, 1, TRUE, TRUE),
(3, 4, TRUE, TRUE),
(4, 2, TRUE, TRUE),
(5, 3, TRUE, TRUE),
(6, 4, TRUE, TRUE),
(7, 1, FALSE, FALSE),
(8, 4, TRUE, TRUE);

-- =====================================================
-- PUBLICACIONES (POSTS)
-- =====================================================

INSERT INTO posts (user_id, unidad_id, content, image_url, location_name, post_type, visibility, likes_count, comments_count) VALUES
(6, 4, '¡Gracias a todos los vecinos que participaron en la limpieza del parque hoy! 🌳✨ Quedó hermoso. Próxima actividad: jardinería comunitaria el próximo sábado.', 
 'https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?q=80&w=1000&auto=format&fit=crop', 
 'Parque Central UV4', 'general', 'unidad', 24, 5),
 
(5, 3, 'Encontré este perrito cerca de la calle Los Alerces. ¿Alguien lo reconoce? 🐶 Parece perdido y tiene collar pero sin placa.', 
 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop', 
 'Calle Los Alerces', 'ayuda', 'unidad', 45, 12),
 
(2, 1, '📢 AVISO: Mañana miércoles habrá corte de agua desde las 9:00 hasta las 14:00 en todo el sector centro. ¡Preparen sus estanques!', 
 NULL, 'Sector Centro UV1', 'noticia', 'unidad', 18, 3),
 
(3, 4, 'Invitamos a todos los vecinos de la UV4 a la asamblea general de este sábado. Trataremos temas de seguridad y mejoras en áreas verdes. ¡Los esperamos!', 
 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop', 
 'Sede Social UV4', 'evento', 'unidad', 32, 8),
 
(4, 2, 'Se recomienda tener precaución en la esquina de Av. Principal con Calle Los Pinos. Se reportaron vehículos sospechosos.', 
 NULL, 'Esquina Av. Principal', 'alerta', 'unidad', 28, 6),
 
(8, 4, '📋 ACTA: En la reunión de junta vecinal del pasado 10 de mayo se acordó: 1) Nuevo sistema de iluminación 2) Rondas de seguridad nocturnas 3) Mejoras en sedes sociales. Más info en la página web.',
 NULL, 'Sede Social UV4', 'noticia', 'unidad', 15, 4);

-- =====================================================
-- LIKES EN PUBLICACIONES
-- =====================================================

INSERT INTO post_likes (post_id, user_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 3), (3, 4), (3, 5), (3, 6),
(4, 1), (4, 2), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8);

-- =====================================================
-- COMENTARIOS
-- =====================================================

INSERT INTO comments (post_id, user_id, content, likes_count) VALUES
(1, 1, '¡Excelente iniciativa! Me sumo para la próxima jornada de jardinería 🌻'),
(1, 2, 'Muy bien organizado todo. Felicidades al equipo.'),
(1, 4, '¿A qué hora empiezan el sábado?'),
(2, 3, 'Creo que es el perro de la señora que vive en la casa azul de la esquina. Voy a avisarle.'),
(2, 5, 'Gracias por reportar! Si no aparece el dueño, puedo adoptarlo temporalmente.'),
(3, 4, 'Gracias por el aviso! Ya llené mis bidones.'),
(4, 1, '¿A qué hora es la asamblea?'),
(4, 3, 'Es a las 18:00 hrs en la sede social. ¡Los esperamos!'),
(5, 2, 'Gracias por el reporte. Voy a avisar a mis vecinos.');

-- =====================================================
-- EVENTOS
-- =====================================================

INSERT INTO events (user_id, unidad_id, title, description, image_url, event_date, start_time, end_time, location_name, location_lat, location_lng, max_attendees, category, is_free, status) VALUES
(3, 4, 'Feria de las Pulgas Vecinal', 'Gran feria de intercambio y venta de artículos usados. Trae lo que ya no uses y encuentra tesoros entre los objetos de tus vecinos. Habrá comida y música en vivo.',
 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop',
 CURRENT_DATE + INTERVAL '5 days', '10:00', '18:00', 'Plaza Central UV4', -33.4489, -70.6493, 100, 'Feria', TRUE, 'activo'),
 
(8, 4, 'Clase de Yoga al Aire Libre', 'Clase gratuita de yoga para todos los niveles. Trae tu mat y ropa cómoda. Instructora certificada: Carolina López.',
 'https://images.unsplash.com/photo-1544367563-121910aace75?q=80&w=1000&auto=format&fit=crop',
 CURRENT_DATE + INTERVAL '2 days', '09:00', '10:30', 'Parque Central UV4', -33.4490, -70.6495, 25, 'Deportes', TRUE, 'activo'),
 
(3, 4, 'Reunión de Seguridad Vecinal', 'Reunión mensual del comité de seguridad. Trataremos temas de vigilancia, alarmas comunitarias y coordinación con carabineros.',
 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop',
 CURRENT_DATE + INTERVAL '7 days', '19:00', '20:30', 'Zoom (Virtual)', NULL, NULL, 50, 'Seguridad', TRUE, 'activo'),
 
(2, 1, 'Asamblea General de Vecinos', 'Asamblea ordinaria para tratar temas de mejoras en infraestructura, presupuesto anual y elección de nuevos directivos.',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
 CURRENT_DATE + INTERVAL '10 days', '18:00', '20:00', 'Sede Social UV1', -33.4489, -70.6693, 80, 'Junta', TRUE, 'activo'),
 
(6, 4, 'Taller de Jardinería Urbana', 'Aprende a cultivar tus propias hortalizas en espacios pequeños. Incluye materiales y semillas. Cupo limitado.',
 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1000&auto=format&fit=crop',
 CURRENT_DATE + INTERVAL '14 days', '15:00', '17:00', 'Sede Social UV4', -33.4492, -70.6490, 20, 'Taller', TRUE, 'activo');

-- =====================================================
-- ASISTENTES A EVENTOS
-- =====================================================

INSERT INTO event_attendees (event_id, user_id, status) VALUES
(1, 1, 'confirmado'), (1, 2, 'confirmado'), (1, 4, 'confirmado'), (1, 5, 'confirmado'),
(2, 1, 'confirmado'), (2, 2, 'confirmado'), (2, 6, 'confirmado'),
(3, 1, 'confirmado'), (3, 3, 'confirmado'), (3, 4, 'confirmado'), (3, 5, 'confirmado'), (3, 6, 'confirmado'),
(4, 2, 'confirmado'), (4, 3, 'confirmado'), (4, 4, 'confirmado');

-- =====================================================
-- ALERTAS DE SEGURIDAD
-- =====================================================

INSERT INTO alerts (user_id, unidad_id, alert_type, title, description, location_name, location_lat, location_lng, severity, status) VALUES
(4, 2, 'sospecha', 'Vehículo sospechoso', 'Auto gris, modelo sedán, sin patente visible. Estacionado frente a casa #45 desde hace 2 horas. Ocupantes no identificados.',
 'Calle Los Robles', -33.4389, -70.6593, 'media', 'activo'),
 
(5, 3, 'ruido', 'Ruido Molesto', 'Música a alto volumen en departamento 302 del Edificio A. Continúa desde las 22:00 hrs.',
 'Edificio A, Depto 302', -33.4589, -70.6793, 'baja', 'resuelto'),
 
(3, 4, 'robo', 'Intento de robo', 'Se reportó intento de robo en vivienda de Calle Los Pinos. Sospechoso huyó en motocicleta. Se recomienda precaución.',
 'Calle Los Pinos', -33.4490, -70.6495, 'alta', 'investigando'),
 
(1, 1, 'mascota_perdida', 'Perro perdido', 'Se busca perro labrador color crema, responde al nombre "Max". Se perdió en el sector centro cerca del parque.',
 'Sector Centro UV1', -33.4489, -70.6693, 'media', 'activo');

-- =====================================================
-- NEGOCIOS LOCALES
-- =====================================================

INSERT INTO businesses (user_id, unidad_id, category_id, name, description, image_url, address, location_lat, location_lng, phone, email, opening_hours, rating, reviews_count, is_verified) VALUES
(1, 1, 2, 'Verdulería La Fresca', 'La mejor selección de frutas y verduras frescas del sector. Productos de estación a precios justos. Delivery gratuito en la unidad vecinal.',
 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
 'Calle Los Pinos 123', -33.4485, -70.6690, '+56 9 1234 5678', 'lafresca@email.cl',
 '{"mon": "08:00-20:00", "tue": "08:00-20:00", "wed": "08:00-20:00", "thu": "08:00-20:00", "fri": "08:00-20:00", "sat": "08:00-14:00", "sun": "closed"}',
 4.8, 24, TRUE),
 
(2, 1, 3, 'Gasfitería Don José', 'Servicio profesional de gasfitería y plomería. Atención a domicilio las 24 horas. Presupuestos sin compromiso. Más de 20 años de experiencia.',
 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=1000&auto=format&fit=crop',
 'A domicilio', NULL, NULL, '+56 9 2345 6789', 'donjose.gasfiteria@email.cl',
 '{"mon": "00:00-23:59", "tue": "00:00-23:59", "wed": "00:00-23:59", "thu": "00:00-23:59", "fri": "00:00-23:59", "sat": "00:00-23:59", "sun": "00:00-23:59"}',
 4.9, 45, TRUE),
 
(3, 4, 2, 'Panadería El Horno', 'Pan artesanal recién horneado todos los días. Empanadas, pasteles y productos de pastelería. Tradición familiar desde 1985.',
 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
 'Av. Principal 456', -33.4495, -70.6498, '+56 9 3456 7890', 'elhorno@email.cl',
 '{"mon": "06:00-21:00", "tue": "06:00-21:00", "wed": "06:00-21:00", "thu": "06:00-21:00", "fri": "06:00-21:00", "sat": "06:00-14:00", "sun": "07:00-13:00"}',
 4.7, 38, TRUE),
 
(4, 2, 4, 'Farmacia San Juan', 'Farmacia de barrio con atención personalizada. Medicamentos, productos de higiene y cuidado personal. Convenios con principales isapres.',
 'https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1000&auto=format&fit=crop',
 'Av. Principal 789', -33.4390, -70.6595, '+56 9 4567 8901', 'farmacia.sanjuan@email.cl',
 '{"mon": "08:30-21:00", "tue": "08:30-21:00", "wed": "08:30-21:00", "thu": "08:30-21:00", "fri": "08:30-21:00", "sat": "09:00-14:00", "sun": "closed"}',
 4.6, 52, TRUE),
 
(6, 4, 6, 'Peluquería Estilo', 'Corte de cabello, barbería y servicios de belleza para toda la familia. Atención sin cita previa. Precios accesibles.',
 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000&auto=format&fit=crop',
 'Paseo del Bosque 321', -33.4498, -70.6502, '+56 9 6789 0123', 'estilo.peluqueria@email.cl',
 '{"mon": "09:00-19:00", "tue": "09:00-19:00", "wed": "09:00-19:00", "thu": "09:00-19:00", "fri": "09:00-19:00", "sat": "09:00-16:00", "sun": "closed"}',
 4.5, 31, FALSE);

-- =====================================================
-- RESEÑAS DE NEGOCIOS
-- =====================================================

INSERT INTO business_reviews (business_id, user_id, rating, comment) VALUES
(1, 2, 5, 'Excelente atención y productos muy frescos. Los recomiendo.'),
(1, 3, 5, 'Siempre encuentro lo que busco. Precios justos y buena calidad.'),
(1, 4, 4, 'Muy buena verdulería, aunque a veces falta variedad.'),
(2, 1, 5, 'Don José solucionó mi problema en menos de una hora. Muy profesional.'),
(2, 3, 5, 'Excelente servicio, llegó rápido y el trabajo quedó perfecto.'),
(2, 4, 5, 'Muy responsable y honesto. Lo recomiendo totalmente.'),
(3, 1, 5, 'El mejor pan del sector. Las empanadas son increíbles.'),
(3, 2, 4, 'Muy rico pan, pero siempre hay fila los fines de semana.'),
(3, 5, 5, 'Tradición y calidad. Los pasteles son espectaculares.'),
(4, 1, 4, 'Buena atención y precios competitivos.'),
(4, 2, 5, 'Siempre tienen lo que necesito. El personal es muy amable.'),
(5, 3, 4, 'Buen corte y precio razonable.'),
(5, 4, 5, 'Me encanta cómo me dejan el cabello. Muy profesionales.');

-- =====================================================
-- SALAS DE CHAT
-- =====================================================

INSERT INTO chat_rooms (name, description, avatar, room_type, unidad_id, created_by) VALUES
('Junta de Vecinos', 'Canal oficial de comunicaciones de la Junta de Vecinos UV4', '👥', 'unidad', 4, 8),
('Seguridad UV4', 'Grupo de coordinación para temas de seguridad vecinal', '🛡️', 'unidad', 4, 3),
('Grupo Jardinería', 'Entusiastas de la jardinería y plantas', '🌱', 'grupo', 4, 6),
('Deportes y Actividades', 'Organización de actividades deportivas', '⚽', 'grupo', 4, 1),
('Compras Comunitarias', 'Coordinación de compras grupales y descuentos', '🛒', 'grupo', 4, 2);

-- =====================================================
-- MIEMBROS DE CHAT
-- =====================================================

INSERT INTO chat_room_members (room_id, user_id, role, unread_count) VALUES
(1, 1, 'miembro', 0), (1, 2, 'miembro', 2), (1, 3, 'moderador', 0), (1, 4, 'miembro', 1), 
(1, 5, 'miembro', 0), (1, 6, 'miembro', 0), (1, 8, 'admin', 0),
(2, 1, 'miembro', 0), (2, 3, 'admin', 0), (2, 4, 'miembro', 0), (2, 5, 'miembro', 0), (2, 6, 'miembro', 0),
(3, 1, 'miembro', 0), (3, 2, 'miembro', 0), (3, 6, 'admin', 0),
(4, 1, 'admin', 0), (4, 2, 'miembro', 0), (4, 4, 'miembro', 0), (4, 5, 'miembro', 0),
(5, 1, 'miembro', 0), (5, 2, 'admin', 0), (5, 3, 'miembro', 0), (5, 4, 'miembro', 0);

-- =====================================================
-- MENSAJES DE CHAT
-- =====================================================

INSERT INTO chat_messages (room_id, user_id, content, message_type) VALUES
(1, 8, '📢 Recuerden que mañana tenemos asamblea general a las 18:00 hrs en la sede social. Es importante la asistencia de todos.', 'texto'),
(1, 3, '¿Se tratará el tema de las luminarias nuevas?', 'texto'),
(1, 8, 'Sí Carlos, está en la agenda. También hablaremos del presupuesto para el segundo semestre.', 'texto'),
(1, 2, 'Perfecto, ahí estaré. ¿Necesitan ayuda con algo?', 'texto'),
(1, 4, 'Yo también puedo colaborar si necesitan.', 'texto'),
(2, 3, '🛡️ Ronda de seguridad completada. Todo tranquilo en el sector norte.', 'texto'),
(2, 1, 'Excelente trabajo equipo!', 'texto'),
(2, 4, 'Yo me sumo a la próxima ronda. ¿A qué hora empiezan?', 'texto'),
(2, 3, 'Empezamos a las 22:00 hrs. Te agregamos al grupo de WhatsApp para coordinar.', 'texto'),
(3, 6, '🌱 ¿Alguien tiene semillas de tomate? Las mías ya no germinaron 😅', 'texto'),
(3, 1, 'Yo tengo! Te puedo dejar un sobre en la entrada del edificio.', 'texto'),
(3, 2, 'Yo también tengo de lechuga si alguien necesita', 'texto'),
(3, 6, 'Muchas gracias! Paso a buscarlas en la tarde 🍅', 'texto'),
(4, 1, '⚽ ¿Quiénes se animan a un partido de fútbol el sábado?', 'texto'),
(4, 4, 'Yo me anoto! ¿A qué hora?', 'texto'),
(4, 5, 'Cuento conmigo también', 'texto'),
(4, 1, 'Sería a las 16:00 en la cancha del parque. ¡Vamos armando equipos!', 'texto');

-- =====================================================
-- CONTACTOS DE EMERGENCIA POR UNIDAD
-- =====================================================

INSERT INTO emergency_contacts (unidad_id, contact_type, name, phone, officer_name, officer_phone, officer_photo_url) VALUES
(4, 'patrullero', 'Plan Cuadrante UV4', '+56 9 1234 5678', 'Sgto. Juan Muñoz', '+56 9 1234 5678', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop'),
(4, 'junta_vecinal', 'Junta de Vecinos UV4', '+56 9 1111 2222', 'Presidente: Roberto Gómez', '+56 9 9999 8888', NULL),
(1, 'patrullero', 'Plan Cuadrante UV1', '+56 9 2222 3333', 'Cabo María López', '+56 9 2222 3333', NULL),
(2, 'patrullero', 'Plan Cuadrante UV2', '+56 9 3333 4444', 'Sgto. Pedro Sánchez', '+56 9 3333 4444', NULL);

-- =====================================================
-- ENCUESTAS
-- =====================================================

INSERT INTO polls (user_id, unidad_id, title, description, poll_type, ends_at, is_anonymous, total_votes, status) VALUES
(8, 4, '¿Qué mejoras priorizar para nuestra unidad vecinal?', 'Vota por las mejoras que consideras más importantes para nuestra comunidad. Los resultados serán considerados en el presupuesto anual.',
 'simple', CURRENT_DATE + INTERVAL '7 days', FALSE, 0, 'activa'),
(3, 4, '¿Qué día es mejor para las rondas de seguridad?', 'Encuesta para definir el día principal de las rondas de seguridad vecinal.',
 'simple', CURRENT_DATE + INTERVAL '3 days', FALSE, 0, 'activa');

-- =====================================================
-- OPCIONES DE ENCUESTAS
-- =====================================================

INSERT INTO poll_options (poll_id, text, sort_order) VALUES
(1, 'Mejoras en iluminación pública', 1),
(1, 'Áreas verdes y parques', 2),
(1, 'Seguridad y vigilancia', 3),
(1, 'Sede social comunitaria', 4),
(1, 'Señalética y nomenclatura', 5),
(2, 'Lunes', 1),
(2, 'Miércoles', 2),
(2, 'Viernes', 3),
(2, 'Sábado', 4);

-- =====================================================
-- VOTOS DE ENCUESTAS
-- =====================================================

INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES
(1, 1, 1), (1, 1, 2), (1, 3, 3), (1, 2, 4), (1, 3, 5), (1, 1, 6),
(2, 3, 1), (2, 4, 2), (2, 3, 4), (2, 3, 5);

-- =====================================================
-- SOLICITUDES DE AYUDA
-- =====================================================

INSERT INTO help_requests (user_id, unidad_id, title, description, help_type, urgency, status, location_name) VALUES
(2, 1, 'Ayuda con compras de supermercado', 'Necesito alguien que me ayude a traer las compras del supermercado. Vivo en el tercer piso sin ascensor y tengo problemas de movilidad.',
 'compras', 'normal', 'abierta', 'Edificio Los Pinos, Depto 302'),
(4, 2, 'Necesito transporte al centro de salud', 'Tengo una cita médica el viernes a las 10:00 y no tengo movilización. Vivo cerca del parque.',
 'transporte', 'alta', 'en_proceso', 'Calle Los Robles 123'),
(5, 3, 'Se busca paseador de perros', 'Busco alguien que pueda pasear a mi perro por las mañanas. Pago por hora.',
 'mascotas', 'baja', 'abierta', 'Av. Principal 456');

-- =====================================================
-- NOTIFICACIONES
-- =====================================================

INSERT INTO notifications (user_id, type, title, content, data, is_read) VALUES
(1, 'bienvenida', '¡Bienvenido a Vecino Activo!', 'Gracias por unirte a nuestra comunidad. Explora las funciones y conecta con tus vecinos.', '{}', FALSE),
(1, 'evento_recordatorio', 'Recordatorio: Asamblea General', 'La asamblea general es mañana a las 18:00 hrs en la sede social.', '{"event_id": 4}', FALSE),
(2, 'mensaje', 'Nuevo mensaje en Junta de Vecinos', 'Tienes 2 mensajes sin leer en el chat de Junta de Vecinos.', '{"room_id": 1}', FALSE),
(3, 'alerta_nueva', 'Nueva alerta en tu unidad', 'Se ha reportado una nueva alerta de seguridad en UV4.', '{"alert_id": 3}', FALSE),
(4, 'comentario', 'Nuevo comentario en tu publicación', 'Carlos Muñoz comentó en tu publicación sobre el aviso de agua.', '{"post_id": 3}', TRUE);

-- =====================================================
-- ESTADÍSTICAS ACTUALIZADAS
-- =====================================================

-- Actualizar contadores después de insertar datos
UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id);
UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = posts.id);
UPDATE events SET attendees_count = (SELECT COUNT(*) FROM event_attendees WHERE event_id = events.id);
UPDATE businesses b SET rating = (SELECT COALESCE(AVG(rating), 0) FROM business_reviews WHERE business_id = b.id), reviews_count = (SELECT COUNT(*) FROM business_reviews WHERE business_id = b.id);
UPDATE polls p SET total_votes = (SELECT COUNT(*) FROM poll_votes WHERE poll_id = p.id);
UPDATE poll_options po SET votes_count = (SELECT COUNT(*) FROM poll_votes WHERE option_id = po.id);

-- =====================================================
-- FIN DEL SCRIPT DE DATOS DE EJEMPLO
-- =====================================================
