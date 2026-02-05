require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // o axios
const authRoutes = require('./src/routes/auth.routes');

const app = express();

// Habilitar CORS solo para frontend en 3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(5000, () => console.log('API Gateway corriendo en puerto 5000'));

// POST http://localhost:5000/auth/register
// POST http://localhost:5000/auth/login