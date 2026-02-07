import { useState } from 'react';
import { registerAdmin } from '../api/auth.api';
import LogoutButton from '../components/LogoutButton';

function Admin() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('REPARTIDOR');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await registerAdmin({ nombre, correo, password, rol });

      alert(`${rol} registrado correctamente ✅`);
      setNombre('');
      setCorreo('');
      setPassword('');
      setRol('REPARTIDOR');
    } catch (err) {
      console.error('ERROR REAL:', err.response?.data || err.message);
      alert(err.response?.data?.message || err.message || 'Error al registrar usuario');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Panel de Administración</h1>
      <h3>Registrar Repartidor o Restaurante</h3>
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

        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="REPARTIDOR">Repartidor</option>
          <option value="RESTAURANTE">Restaurante</option>
        </select><br /><br />

        <button type="submit">Registrar</button>
      </form>

      <LogoutButton />
    </div>
  );
}

export default Admin;
