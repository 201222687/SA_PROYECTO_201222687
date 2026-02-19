// =========================
// IMPORTACIONES
// =========================
import { useState, useEffect } from 'react';
import { createOrder, getMyOrders,updateEstadoOrden  } from '../api/order.api';
import LogoutButton from '../components/LogoutButton';

function Cliente() {

  // =========================
  // ESTADOS
  // =========================
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [items, setItems] = useState([]);
  const [mensajeOrden, setMensajeOrden] = useState('');
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('crear'); // <-- TAB AGREGADO

  // =========================
  // CARGAR RESTAURANTES
  // =========================
  useEffect(() => {
    fetch('http://localhost:5000/catalog/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data.restaurants || []))
      .catch(err => console.error(err));
  }, []);

  // =========================
  // CARGAR PRODUCTOS SEGÚN RESTAURANTE
  // =========================
  useEffect(() => {

    if (!selectedRestaurant) {
      setMenuItems([]);
      return;
    }

    fetch(`http://localhost:5000/catalog/menu-items/${selectedRestaurant}`)
      .then(res => res.json())
      .then(data => {
        setMenuItems(data.menuItems || []);
        setItems([]);
      })
      .catch(err => console.error(err));

  }, [selectedRestaurant]);

  // =========================
  // CARGAR MIS ORDENES
  // =========================
  const cargarOrdenes = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);


  // =========================
  // CANCELAR ORDEN
  // =========================
  const cancelarOrden = async (id_orden) => {
    try {

      await updateEstadoOrden(id_orden, "CANCELADA");

      // Actualizar estado local sin recargar
      setOrders(orders.map(order =>
        order.id_orden === id_orden
          ? { ...order, estado: "CANCELADA" }
          : order
      ));

    } catch (error) {
      console.error(error);
      alert("Error al cancelar la orden");
    }
  };

  // =========================
  // AGREGAR PRODUCTO
  // =========================
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

  // =========================
  // ELIMINAR ITEM
  // =========================
  const eliminarItem = (id_item) => {
    setItems(items.filter(item => item.id_item !== id_item));
  };

  // =========================
  // ACTUALIZAR ITEM
  // =========================
  const actualizarItem = (id_item, campo, valor) => {

    if (campo === 'cantidad' && valor < 1) return;

    setItems(items.map(item =>
      item.id_item === id_item
        ? { ...item, [campo]: valor }
        : item
    ));
  };

  // =========================
  // TOTAL GENERAL
  // =========================
  const totalGeneral = items.reduce(
    (acc, item) => acc + (item.cantidad * item.precio_cliente),
    0
  );

  // =========================
  // CREAR ORDEN
  // =========================
  const handleCreateOrder = async (e) => {

    e.preventDefault();
    setMensajeOrden('');

    try {

      const data = {
        id_restaurante: parseInt(selectedRestaurant),
        items: items.map(item => ({
          id_item: item.id_item,
          cantidad: item.cantidad,
          precio_cliente: item.precio_cliente
        }))
      };

      const response = await createOrder(data);

      setMensajeOrden(response.data.mensaje || 'Orden creada correctamente');

      setSelectedRestaurant('');
      setItems([]);

      cargarOrdenes();

    } catch (error) {
      setMensajeOrden(
        error.response?.data?.error || 'Error al crear orden'
      );
    }
  };

  // =========================
  // INTERFAZ
  // =========================
  return (
    <div style={{ padding: 40 }}>

      <h1>Módulo Cliente</h1>

      {/* =========================
          TABS
      ========================= */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('crear')}
          style={{
            marginRight: 10,
            background: activeTab === 'crear' ? '#007bff' : '#ccc',
            color: activeTab === 'crear' ? '#fff' : '#000',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4
          }}
        >
          Crear Orden
        </button>

        <button
          onClick={() => setActiveTab('ordenes')}
          style={{
            background: activeTab === 'ordenes' ? '#007bff' : '#ccc',
            color: activeTab === 'ordenes' ? '#fff' : '#000',
            padding: '8px 16px',
            border: 'none',
            borderRadius: 4
          }}
        >
          Mis Órdenes
        </button>
      </div>

      {/* =========================
          TAB CREAR ORDEN
      ========================= */}
      {activeTab === 'crear' && (
        <>
          <h3>Crear Orden</h3>

          <form onSubmit={handleCreateOrder}>

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

            {selectedRestaurant && (
              <>
                <h4>Productos Disponibles</h4>

                {menuItems.length === 0 && <p>No hay productos disponibles</p>}

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
              </>
            )}

            <h4>Orden Actual</h4>

            {items.length === 0 && <p>No hay productos agregados</p>}

            {items.map(item => {

              const subtotal = item.cantidad * item.precio_cliente;

              return (
                <div key={item.id_item}>
                  <strong>{item.nombre}</strong>

                  <div>
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
                    />
                  </div>

                  <div>
                    Subtotal: Q{subtotal.toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminarItem(item.id_item)}
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
                <button type="submit">Crear Orden</button>
              </>
            )}

          </form>

          {mensajeOrden && <p>{mensajeOrden}</p>}
        </>
      )}

      {/* =========================
          TAB MIS ORDENES
      ========================= */}
      {activeTab === 'ordenes' && (
        <>
          <h2>Mis Órdenes</h2>

          {orders.length === 0 && <p>No tienes órdenes aún</p>}

          {orders.map(order => (
            <div
              key={order.id_orden}
              style={{
                border: '1px solid #ccc',
                padding: 15,
                marginBottom: 15,
                borderRadius: 6,
                background: '#f9f9f9'
              }}
            >
              <h3>Orden #{order.id_orden}</h3>

              <div>
                <strong>Restaurante:</strong> {order.restaurante?.nombre}
              </div>

              <div>
                <strong>Estado:</strong> {order.estado}
              </div>

              <div>
                <strong>Total:</strong> Q{parseFloat(order.total).toFixed(2)}
              </div>

              <div>
                <strong>Fecha:</strong>{" "}
                {new Date(order.fecha_creacion).toLocaleString()}
              </div>

{/* BOTÓN CANCELAR SOLO SI ESTÁ CREADA */}
              {order.estado === "CREADA" && (
                <button
                  onClick={() => cancelarOrden(order.id_orden)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  Cancelar Orden
                </button>
              )}

              <h4>Detalle</h4>

              {order.detalle?.map(item => (
                <div key={item.id_detalle} style={{ marginLeft: 10 }}>
                  • {item.nombre_producto} |
                  Cant: {item.cantidad} |
                  Precio: Q{parseFloat(item.precio_unitario).toFixed(2)} |
                  Subtotal: Q{(item.cantidad * item.precio_unitario).toFixed(2)}
                </div>
              ))}

            </div>
          ))}
        </>
      )}

      <br />

      <LogoutButton />

    </div>
  );
}

export default Cliente;