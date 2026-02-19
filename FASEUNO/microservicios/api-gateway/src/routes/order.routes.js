const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const ORDER_SERVICE_HOST =
  process.env.ORDER_SERVICE_HOST || 'localhost:3002';

 const GRPC_AUTH_HOST =
  process.env.GRPC_AUTH_HOST || 'localhost:50051';

function handleRestError(error, res) {

  if (error.response) {
    return res.status(error.response.status).json({
      error: error.response.data.error || 'Error en order-service'
    });
  }

  return res.status(500).json({
    error: 'Error comunicando con order-service'
  });
}

router.post('/', async (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorización requerido'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id_cliente = decoded.sub;

    const orderData = {
      id_cliente,
      id_restaurante: req.body.id_restaurante,
      items: req.body.items
    };

    const response = await axios.post(
      `http://${ORDER_SERVICE_HOST}/orden`,
      orderData,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    return handleRestError(error, res);
  }

});


router.get('/mis-ordenes', async (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorización requerido'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id_cliente = decoded.sub;

    // Llamar al order-service
    const response = await axios.get(
      `http://${ORDER_SERVICE_HOST}/orden/mis-ordenes/${id_cliente}`,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    return handleRestError(error, res);
  }
});

// ==========================================
// VER ORDENES DEL RESTAURANTE (SOLO CREADA)
// ==========================================

router.get('/ordenes-restaurante', async (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token requerido'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.rol !== 'RESTAURANTE') {
      return res.status(403).json({
        error: 'Acceso solo para restaurantes'
      });
    }

    const id_restaurante = decoded.sub;

    const response = await axios.get(
      `http://${ORDER_SERVICE_HOST}/restaurante/${id_restaurante}`,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// VER ORDENES POR ID RESTAURANTE 
// ==========================================
// ==========================================
// VER ORDENES DE UN RESTAURANTE (POR PARAM)
// ==========================================

router.get('/restaurante/:id', async (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token requerido'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validar rol
    if (decoded.rol !== 'RESTAURANTE') {
      return res.status(403).json({
        error: 'Acceso solo para restaurantes'
      });
    }

    // ID viene desde la URL
    const id_restaurante = req.params.id;

    const response = await axios.get(
      `http://${ORDER_SERVICE_HOST}/restaurante/${id_restaurante}`,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    return handleRestError(error, res);
  }
});



router.get('/restauranteapi/:id', async (req, res) => {
  try {

   const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token requerido'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validar rol
    if (decoded.rol !== 'RESTAURANTE') {
      return res.status(403).json({
        error: 'Acceso solo para restaurantes'
      });
    }

    // ID viene desde la URL
    const id_restaurante = req.params.id;  

    // Llamar al order-service
    const response = await axios.get(
      `http://${ORDER_SERVICE_HOST}/orden/restaurante2/${id_restaurante}`,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    return handleRestError(error, res);
  }
});


// ==========================================
// ACTUALIZAR ESTADO ORDEN
// ==========================================

router.put('/:id/estado', async (req, res) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token requerido'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const idOrden = req.params.id;
    const { estado } = req.body;


   // 🔒 Solo RESTAURANTE o CLIENTE pueden cambiar estado
    if (decoded.rol !== 'RESTAURANTE' && decoded.rol !== 'CLIENTE') {
      return res.status(403).json({
        error: 'No autorizado'
      });
    }

    // 👤 CLIENTE solo puede cancelar
    if (decoded.rol === 'CLIENTE' && estado !== 'CANCELADA') {
      return res.status(403).json({
        error: 'El cliente solo puede cancelar órdenes'
      });
    }

    /*
    if (decoded.rol !== 'RESTAURANTE') {
      return res.status(403).json({
        error: 'Acceso solo para restaurantes'
      });
    }
      */
    //const idOrden = req.params.id;
    //const { estado } = req.body;

    const response = await axios.put(
      `http://${ORDER_SERVICE_HOST}/orden/${idOrden}/estado`,
      { estado },
      {
        headers: {
          Authorization: authHeader,
          rol: decoded.rol,
          //id_usuario: decoded.id_usuario 
          id_usuario: decoded.sub
        }
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    return handleRestError(error, res);
  }
});

module.exports = router;
