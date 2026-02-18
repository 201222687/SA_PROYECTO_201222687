import { useState } from 'react';
import { login } from '../api/auth.api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login({ correo, password });
      const token = res.data.token;

      // Guardar token
      localStorage.setItem('token', token);

      // Decodificar JWT
      const decoded = jwtDecode(token);

      // Redirección por rol
      if (decoded.rol === 'ADMIN') {
        navigate('/admin');
      } else if (decoded.rol === 'CLIENTE') {
        navigate('/cliente');
      } else {
        alert('Rol desconocido');
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.code === 5) {
        setError('El usuario no existe. ');
        return;
      }

      if (data?.code === 16) {
        setError('Credenciales inválidas.');
        return;
      }

      alert('Error al iniciar sesión');
      console.error(data || err.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      {error && (
        <p style={{ color: 'red', marginBottom: 10 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={e => {
            setCorreo(e.target.value);
            setError('');
          }}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            setError('');
          }}
          required
        /><br /><br />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;


/*
Notas importantes:

Roles

Cliente → CLIENTE

Administrador → ADMIN

Repartidor → REPARTIDOR

Restaurante → RESTAURANTE

Token JWT

Siempre se guarda en localStorage.

Admin lo envía en headers para registrar usuarios (repartidor/restaurante).

Rutas protegidas

Se controla en App.jsx revisando rol desde el token.

Redirecciona automáticamente al login si no coincide el rol.

Registro

Cliente → no requiere token

Admin → requiere token
*/