import { useState, useEffect } from 'react';
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
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [items, setItems] = useState([]);
  const [mensajeOrden, setMensajeOrden] = useState('');


    // Cargar restaurantes y todos los productos al iniciar
  useEffect(() => {

    fetch('http://localhost:5000/catalog/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data.restaurants || []))
      .catch(err => console.error(err));

    fetch('http://localhost:5000/catalog/menu-items')
      .then(res => res.json())
      .then(data => setMenuItems(data.menuItems || []))
      .catch(err => console.error(err));

  }, []);

//  Agregar producto
  const agregarProducto = (producto) => {
    const existe = items.find(i => i.id_item === producto.id_item);

    if (existe) {
      setItems(items.map(i =>
        i.id_item === producto.id_item
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ));
    } else {
      setItems([
        ...items,
        {
          id_item: producto.id_item,
          nombre: producto.nombre,
          cantidad: 1,
          precio_cliente: producto.precio
        }
      ]);
    }
  };

    //  Eliminar producto
  const eliminarItem = (id_item) => {
    setItems(items.filter(item => item.id_item !== id_item));
  };

   
  // Editar producto
  const actualizarItem = (id_item, campo, valor) => {

    if (campo === 'cantidad' && valor < 1) return;

    setItems(items.map(item =>
      item.id_item === id_item
        ? { ...item, [campo]: valor }
        : item
    ));
  };

  // Total general
  const totalGeneral = items.reduce(
    (acc, item) => acc + (item.cantidad * item.precio_cliente),
    0
  );


  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setMensajeOrden('');

    try {

      const data = {
        id_restaurante: parseInt(selectedRestaurant),
        items: items.map(item => ({
          //id_item: parseInt(item.id_item),
          //cantidad: parseInt(item.cantidad),
          //precio_cliente: parseFloat(item.precio_cliente)
          id_item: item.id_item,
          cantidad: item.cantidad,
          precio_cliente: item.precio_cliente

        }))
      };

      const response = await createOrder(data);

      setMensajeOrden(response.data.mensaje || 'Orden creada correctamente');

      // limpiar formulario
      //setIdRestaurante('');
      setSelectedRestaurant('');
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

        {/* Restaurantes */}
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          required
        >
          <option value="">Seleccione Restaurante</option>
          {restaurants.map(r => (
            <option key={r.id_restaurante} value={r.id_restaurante}>
              {r.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        {/* TODOS los productos del sistema */}
        <h4>Productos Disponibles</h4>

        {menuItems.map(producto => (
          <div key={producto.id_item} style={{ marginBottom: 8 }}>
            {producto.nombre} - Q{producto.precio}

            <button
              type="button"
              onClick={() => agregarProducto(producto)}
              style={{ marginLeft: 10 }}
            >
              Agregar
            </button>
          </div>
        ))}

        <hr />


{/* Carrito Editable */}
        <h4>Orden Actual</h4>

        {items.length === 0 && <p>No hay productos agregados</p>}

        {items.map(item => {

          const subtotal = item.cantidad * item.precio_cliente;

          return (
            <div
              key={item.id_item}
              style={{
                marginBottom: 12,
                padding: 10,
                border: '1px solid #ccc',
                borderRadius: 6
              }}
            >
              <strong>{item.nombre}</strong>

              <div style={{ marginTop: 6 }}>
                Cantidad:
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) =>
                    actualizarItem(
                      item.id_item,
                      'cantidad',
                      parseInt(e.target.value)
                    )
                  }
                  style={{ width: 70, marginLeft: 5 }}
                />

                Precio:
                <input
                  type="number"
                  step="0.01"
                  value={item.precio_cliente}
                  onChange={(e) =>
                    actualizarItem(
                      item.id_item,
                      'precio_cliente',
                      parseFloat(e.target.value)
                    )
                  }
                  style={{ width: 90, marginLeft: 5 }}
                />
              </div>

              <div style={{ marginTop: 6 }}>
                Subtotal: <strong>Q{subtotal.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                onClick={() => eliminarItem(item.id_item)}
                style={{
                  marginTop: 6,
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
            </div>
          );
        })}

        <hr />

        {items.length > 0 && (
          <>
            <h3>Total General: Q{totalGeneral.toFixed(2)}</h3>
            <button type="submit">
              Crear Orden
            </button>
          </>
        )}
        

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
