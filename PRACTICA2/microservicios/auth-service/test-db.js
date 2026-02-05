require('dotenv').config();
const pool = require('./src/repositories/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Conexión a MySQL exitosa');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
}

test();
