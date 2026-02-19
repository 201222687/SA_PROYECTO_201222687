import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCliente } from '../api/auth.api';

function RegistrarCliente() {


const navigate = useNavigate();

  // =========================
  // REGISTRO
  // =========================
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await registerCliente({ nombre, correo, password });

      alert('Cliente registrado correctamente.');

      setNombre('');
      setCorreo('');
      setPassword('');

    } catch (err) {

      const data = err.response?.data;

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

      <h1>Registrar nuevo cliente</h1>

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}

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

        <button type="submit">
          Registrar Cliente
        </button>
      </form>

       <br />

      <button 
        onClick={() => navigate('/login')}
        style={{ backgroundColor: '#ccc', padding: '8px 16px' }}
      >
        Volver al Login
      </button>

    </div>
  );
}

export default RegistrarCliente;