CREATE DATABASE IF NOT EXISTS mexhome_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mexhome_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') DEFAULT 'cliente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria ENUM('Herramienta', 'Hogar', 'Papelería', 'Bisutería', 'Juguetes', 'Temporada') NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    precio_mayoreo DECIMAL(10, 2) NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_url LONGTEXT,
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(30) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20),
    direccion_envio TEXT NOT NULL,
    metodo_pago ENUM('tarjeta', 'spei', 'oxxo', 'mercadopago') NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estatus ENUM('pendiente', 'pagado', 'enviado') DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Usuario Admin inicial (Usuario: admin | Contraseña: mexhome2026)
INSERT INTO usuarios (nombre, usuario, password_hash, rol) 
VALUES ('Administrador MEX HOME', 'admin', SHA2('mexhome2026', 256), 'admin');

-- Productos de muestra
INSERT INTO productos (nombre, categoria, precio, precio_mayoreo, stock, imagen_url, descripcion) VALUES
('Juego de Desarmadores Magnéticos 24 en 1', 'Herramienta', 149.00, 115.00, 30, 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=500&q=80', 'Estuche compacto de precisión para electrónica y hogar.'),
('Organizador Acrílico Giratorio 360°', 'Hogar', 189.00, 150.00, 20, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80', 'Ideal para cosméticos, especias o artículos de baño.'),
('Set de Plumones Doble Punta 48 Colores', 'Papelería', 165.00, 130.00, 45, 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=500&q=80', 'Estuche portátil con punta pincel y punta fina.'),
('Set de Aretes y Collares Acero Inoxidable', 'Bisutería', 85.00, 60.00, 50, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80', 'Acabado dorado resistente al agua, varios modelos.');