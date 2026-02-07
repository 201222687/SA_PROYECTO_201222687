import { useState } from 'react';
import { registerCliente } from '../api/auth.api';
import LogoutButton from '../components/LogoutButton';

function Cliente() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await registerCliente({ nombre, correo, password });

      alert('Cliente registrado correctamente ✅');
      setNombre('');
      setCorreo('');
      setPassword('');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || 'Error al registrar cliente');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Módulo Cliente</h1>
      <h3>Registrar nuevo cliente</h3>
      <form onSubmit={handleRegister}>
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        /><br /><br />

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Registrar Cliente</button>
      </form>

      <LogoutButton />
    </div>
  );
}

export default Cliente;
