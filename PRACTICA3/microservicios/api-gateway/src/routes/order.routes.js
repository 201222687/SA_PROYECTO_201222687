const express = require('express');
const router = express.Router();
const axios = require('axios');

// ================================
// Host del Order-Service (Docker o local)
// ================================
const ORDER_SERVICE_HOST =
  process.env.ORDER_SERVICE_HOST || 'localhost:3002';

// ================================
// Helper errores REST
// ================================
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

// ================================
// RUTAS
// ================================

//  Crear Orden (requiere token)
router.post('/', async (req, res) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de autorización requerido'
      });
    }

    // Enviar petición al order-service
    const response = await axios.post(
      `http://${ORDER_SERVICE_HOST}/orden`,
      req.body,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    return res.status(response.status).json(response.data);

  } catch (error) {
    return handleRestError(error, res);
  }

});

module.exports = router;
