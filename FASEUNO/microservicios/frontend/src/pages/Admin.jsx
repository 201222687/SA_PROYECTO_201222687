import { useState } from 'react';
import { registerAdmin } from '../api/auth.api';
import LogoutButton from '../components/LogoutButton';

function Admin() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('REPARTIDOR');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await registerAdmin({ nombre, correo, password, rol });

      alert(`${rol} registrado correctamente. `);
      setNombre('');
      setCorreo('');
      setPassword('');
      setRol('REPARTIDOR');
    } catch (err) {
      const data = err.response?.data;

      // 🔹 Error 6: ALREADY_EXISTS
      if (data?.code === 6) {
        setError('El correo ya está registrado. ');
        return;
      }

      // 🔹 Error 3: INVALID_ARGUMENT
      if (data?.code === 3) {
        setError('Faltan datos obligatorios. ');
        return;
      }

      alert(data?.error || 'Error al registrar usuario');
      console.error('ERROR REAL:', data || err.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Panel de Administración</h1>
      <h3>Registrar Repartidor o Restaurante</h3>

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

        <select
          value={rol}
          onChange={e => {
            setRol(e.target.value);
            setError('');
          }}
        >
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
