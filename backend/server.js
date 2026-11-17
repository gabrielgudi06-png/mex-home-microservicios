const express = require('express');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'mexhome_user',
  password: process.env.DB_PASSWORD || 'mexhome_pass_segura',
  database: process.env.DB_NAME || 'mexhome_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Login seguro contra MySQL (ninguna contraseña vive en el frontend)
app.post('/api/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    const hash = crypto.createHash('sha256').update(password || '').digest('hex');

    const [rows] = await pool.query(
      'SELECT id, nombre, usuario, rol FROM usuarios WHERE usuario = ? AND password_hash = ? AND rol = "admin"',
      [usuario, hash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }
    res.json({ ok: true, admin: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Listar productos
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear producto (Admin)
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, categoria, precio, precio_mayoreo, stock, imagen_url, descripcion } = req.body;
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, categoria, precio, precio_mayoreo, stock, imagen_url, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, categoria, precio, precio_mayoreo || null, stock, imagen_url, descripcion]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Actualizar stock o precio (Admin)
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { precio, stock } = req.body;
    await pool.query('UPDATE productos SET precio = ?, stock = ? WHERE id = ?', [precio, stock, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Eliminar producto (Admin)
app.delete('/api/productos/:id', async (req, res) => {
  try {
    await pool.query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Listar pedidos (Admin)
app.get('/api/pedidos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar compra y descontar stock
app.post('/api/pedidos', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { folio, cliente_nombre, cliente_telefono, direccion_envio, metodo_pago, total, items } = req.body;

    const [pedido] = await conn.query(
      'INSERT INTO pedidos (folio, cliente_nombre, cliente_telefono, direccion_envio, metodo_pago, total) VALUES (?, ?, ?, ?, ?, ?)',
      [folio, cliente_nombre, cliente_telefono, direccion_envio, metodo_pago, total]
    );

    for (const item of items) {
      await conn.query(
        'INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedido.insertId, item.id, item.cantidad, item.precio]
      );
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?', [
        item.cantidad, item.id, item.cantidad
      ]);
    }

    await conn.commit();
    res.json({ ok: true, folio });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ ok: false, error: 'No se pudo procesar el pedido' });
  } finally {
    conn.release();
  }
});

app.listen(3000, () => console.log('API MEX HOME lista en puerto 3000'));