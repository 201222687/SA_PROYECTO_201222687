require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`API Gateway corriendo en puerto ${PORT}`)
);


// POST http://localhost:5000/auth/register             CLIENTE
// POST http://localhost:5000/auth/login                Todos
// POST http://localhost:5000/auth/admin/register       SOLO ADMIN