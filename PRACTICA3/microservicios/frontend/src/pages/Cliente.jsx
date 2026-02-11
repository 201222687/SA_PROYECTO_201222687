import { useState } from 'react';
import { registerCliente } from '../api/auth.api';
import { createOrder } from '../api/order.api';
import LogoutButton from '../components/LogoutButton';

function Cliente() {

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

  // =========================
  // CREAR ORDEN
  // =========================
  const [idRestaurante, setIdRestaurante] = useState('');
  const [items, setItems] = useState([]);
  const [mensajeOrden, setMensajeOrden] = useState('');

  const agregarItem = () => {
    setItems([
      ...items,
      { id_item: '', cantidad: '', precio_cliente: '' }
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const nuevosItems = [...items];
    nuevosItems[index][field] = value;
    setItems(nuevosItems);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setMensajeOrden('');

    try {

      const data = {
        id_restaurante: parseInt(idRestaurante),
        items: items.map(item => ({
          id_item: parseInt(item.id_item),
          cantidad: parseInt(item.cantidad),
          precio_cliente: parseFloat(item.precio_cliente)
        }))
      };

      const response = await createOrder(data);

      setMensajeOrden(response.data.mensaje || 'Orden creada correctamente');

      // limpiar formulario
      setIdRestaurante('');
      setItems([]);

    } catch (error) {
      setMensajeOrden(
        error.response?.data?.error || 'Error al crear orden'
      );
    }
  };

  return (
    <div style={{ padding: 40 }}>

      <h1>Módulo Cliente</h1>

      {/* ========================= REGISTRO ========================= */}

      <h3>Registrar nuevo cliente</h3>

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

      <hr style={{ margin: "40px 0" }} />

      {/* ========================= CREAR ORDEN ========================= */}

      <h3>Crear Orden</h3>

      <form onSubmit={handleCreateOrder}>

        <input
          type="number"
          placeholder="ID Restaurante"
          value={idRestaurante}
          onChange={e => setIdRestaurante(e.target.value)}
          required
        /><br /><br />

        {items.map((item, index) => (
          <div key={index}>
            <input
              type="number"
              placeholder="ID Producto"
              value={item.id_item}
              onChange={(e) =>
                handleItemChange(index, 'id_item', e.target.value)
              }
              required
            />

            <input
              type="number"
              placeholder="Cantidad"
              value={item.cantidad}
              onChange={(e) =>
                handleItemChange(index, 'cantidad', e.target.value)
              }
              required
            />

            <input
              type="number"
              step="0.01"
              placeholder="Precio Cliente"
              value={item.precio_cliente}
              onChange={(e) =>
                handleItemChange(index, 'precio_cliente', e.target.value)
              }
              required
            />

            <br /><br />
          </div>
        ))}

        <button type="button" onClick={agregarItem}>
          Agregar Producto
        </button>

        <br /><br />

        <button type="submit">
          Crear Orden
        </button>

      </form>

      {mensajeOrden && (
        <p style={{ marginTop: 20, fontWeight: 'bold' }}>
          {mensajeOrden}
        </p>
      )}

      <br />
      <LogoutButton />

    </div>
  );
}

export default Cliente;
