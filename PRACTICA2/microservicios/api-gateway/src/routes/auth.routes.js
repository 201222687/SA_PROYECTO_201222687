const express = require('express');
const router = express.Router();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('../proto/auth.proto');
const proto = grpc.loadPackageDefinition(packageDef).auth;

const client = new proto.AuthService(
  'localhost:50051', 
  grpc.credentials.createInsecure()
);

router.post('/register', (req, res) => {
  client.Register(req.body, (err, response) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json(response);
  });
});

router.post('/login', (req, res) => {
  client.Login(req.body, (err, response) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json(response);
  });
});

module.exports = router;
