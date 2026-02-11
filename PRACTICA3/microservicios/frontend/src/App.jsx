import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cliente from './pages/Cliente';
import Admin from './pages/Admin';
import { jwtDecode } from 'jwt-decode';

function App() {
  const token = localStorage.getItem('token');
  let rol = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      rol = decoded.rol;
    } catch (err) {
      console.error('Error al decodificar token', err);
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/cliente"
        element={rol === 'CLIENTE' ? <Cliente /> : <Navigate to="/login" />}
      />
      <Route
        path="/admin"
        element={rol === 'ADMIN' ? <Admin /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<h2>Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;
