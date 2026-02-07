import { useState } from 'react';
import { registerCliente } from '../api/auth.api';
import LogoutButton from '../components/LogoutButton';

function Cliente() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await registerCliente({ nombre, correo, password });

      alert('Cliente registrado correctamente. ');
      setNombre('');
      setCorreo('');
      setPassword('');
    } catch (err) {
      const data = err.response?.data;

      // 👇 ERROR gRPC: ALREADY_EXISTS
      if (data?.code === 6) {
        setError('El correo ya está registrado.');
        return;
      }

       if (data?.code === 3) {
        setError('Faltan datos obligatorios.');
        return;
      }

      setError(data?.error || 'Error al registrar cliente');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Módulo Cliente</h1>
      <h3>Registrar nuevo cliente</h3>

      {error && (
        <p style={{ color: 'red', marginBottom: 10 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleRegister}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e => {
            setNombre(e.target.value);
            setError('');
          }}
          required
        /><br /><br />

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

        <button type="submit">Registrar Cliente</button>
      </form>

      <LogoutButton />
    </div>
  );
}

export default Cliente;
