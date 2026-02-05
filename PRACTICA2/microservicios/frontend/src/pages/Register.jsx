import React, { useState } from 'react';
import { registerUser } from '../api/auth';
import { Link } from 'react-router-dom';

function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(nombre, correo, password);
      setMensaje('Usuario registrado correctamente');
      localStorage.setItem('token', res.token);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Registro</h2>

      <form onSubmit={handleRegister}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <br />

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

        <button type="submit">Registrarse</button>
      </form>

      <p>{mensaje}</p>

      <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
    </div>
  );
}

export default Register;
