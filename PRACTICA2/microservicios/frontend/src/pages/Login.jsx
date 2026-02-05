// Importamos React y el hook useState para manejar estado del formulario
import React, { useState } from 'react';

// Importamos la función que hace la petición al API Gateway para login
import { loginUser } from '../api/auth';

// Link permite navegar entre páginas sin recargar
// useNavigate sirve para redireccionar por código
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  // Estados para capturar los valores del formulario
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  // Estado para mostrar mensajes al usuario (errores o éxito)
  const [mensaje, setMensaje] = useState('');

  // Hook para redireccionar a otra ruta
  const navigate = useNavigate();

  /**
   * Función que se ejecuta al enviar el formulario de login
   * - Envía correo y password al API Gateway
   * - Si es correcto, guarda el JWT en localStorage
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    try {
      // Llamada al backend (API Gateway → Auth-Service)
      const res = await loginUser(correo, password);

      // Guardamos el token JWT en el navegador
      localStorage.setItem('token', res.token);

      setMensaje('Login exitoso');
    } catch (error) {
      // Si hay error (credenciales incorrectas, etc.)
      setMensaje(error.message);
    }
  };

  /**
   * Función para cerrar sesión
   * - Elimina el JWT del navegador
   * - Redirige nuevamente al login
   */
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminamos el token
    setMensaje('Sesión cerrada');
    navigate('/login'); // Redirigimos al login
  };

  // Verificamos si hay un token guardado
  const token = localStorage.getItem('token');

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      {/* 
        Si NO existe token → mostramos formulario de login
        Si EXISTE token → mostramos botón de cerrar sesión
      */}
      {!token ? (
        <>
          <form onSubmit={handleLogin}>
            <input
              placeholder="Correo"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
            />
            <br />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <br />

            <button type="submit">Ingresar</button>
          </form>

          {/* Enlace para ir a registro */}
          <Link to="/register">Crear cuenta</Link>
        </>
      ) : (
        <>
          {/* Si ya hay sesión activa */}
          <p>Ya hay una sesión activa</p>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      )}

      {/* Mensajes de estado */}
      <p>{mensaje}</p>
    </div>
  );
}

export default Login;
