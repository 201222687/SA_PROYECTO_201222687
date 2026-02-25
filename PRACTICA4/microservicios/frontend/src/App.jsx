import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cliente from './pages/Cliente';
import Admin from './pages/Admin';
import RegistrarCliente from './pages/RegistrarCliente';
import Repartidorjsx from './pages/Repartidor';
import Restaurantejsx from './pages/Restaurante';
import { jwtDecode } from 'jwt-decode';
import RestauranteOrdenes from "./pages/RestauranteOrdenes";

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
      
      <Route
        path="/repartidor"
        element={rol === 'REPARTIDOR' ? <Repartidorjsx /> : <Navigate to="/login" />}
      />
      <Route
        path="/restaurante"
        element={rol === 'RESTAURANTE' ? <Restaurantejsx /> : <Navigate to="/login" />}
      />
      
      
      <Route path="/registrar" element={<RegistrarCliente />} />


      <Route
        path="/restaurantes-ordenes"
        element={rol === 'RESTAURANTE' ? <RestauranteOrdenes /> : <Navigate to="/login" />}
      />
      

     

      <Route path="*" element={<h2>Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;
