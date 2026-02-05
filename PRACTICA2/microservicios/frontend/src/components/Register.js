import { useState, useContext } from 'react';
import { register } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const { saveToken } = useContext(AuthContext);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await register(form);
      if (res.token) {
        saveToken(res.token);
        alert('Registro exitoso');
      } else {
        setError(res.message || 'Error en registro');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="correo" placeholder="Correo" onChange={handleChange} />
      <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />
      <button type="submit">Registrar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
