const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const ORDER_SERVICE_HOST =
  process.env.ORDER_SERVICE_HOST || 'localhost:3002';

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

module.exports = router;
