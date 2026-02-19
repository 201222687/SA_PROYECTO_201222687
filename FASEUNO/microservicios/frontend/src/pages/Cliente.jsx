// =========================
// IMPORTACIONES
// =========================

// useState → para manejar estados (variables dinámicas del componente)
// useEffect → para ejecutar lógica cuando el componente se carga o cambia algo
import { useState, useEffect } from 'react';

// Función que llama al backend para crear la orden
import { createOrder } from '../api/order.api';

// Componente que cierra sesión (borra token y redirige)
import LogoutButton from '../components/LogoutButton';


function Cliente() {

  // =========================
  // ESTADOS (MEMORIA DEL COMPONENTE)
  // =========================

  // Lista de restaurantes obtenidos del backend
  const [restaurants, setRestaurants] = useState([]);

  // Lista de productos del restaurante seleccionado
  const [menuItems, setMenuItems] = useState([]);

  // Restaurante seleccionado en el <select>
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  // Productos agregados al carrito
  const [items, setItems] = useState([]);

  // Mensaje de respuesta cuando se crea la orden
  const [mensajeOrden, setMensajeOrden] = useState('');


  // =========================
  // CARGAR RESTAURANTES AL INICIAR
  // =========================
  // Este useEffect se ejecuta UNA sola vez
  // porque el arreglo de dependencias está vacío []
  useEffect(() => {

    // Hace petición al API Gateway
    fetch('http://localhost:5000/catalog/restaurants')

      // Convierte respuesta a JSON
      .then(res => res.json())

      // Guarda restaurantes en el estado
      .then(data => setRestaurants(data.restaurants || []))

      // Si ocurre error lo muestra en consola
      .catch(err => console.error(err));

  }, []);


  // =========================
  // CARGAR PRODUCTOS SEGÚN RESTAURANTE
  // =========================
  // Este useEffect se ejecuta
  // cada vez que cambia selectedRestaurant
  useEffect(() => {

    // Si no hay restaurante seleccionado
    if (!selectedRestaurant) {
      setMenuItems([]); // limpiar productos
      return;
    }

    // Llama al endpoint filtrado por restaurante
    fetch(`http://localhost:5000/catalog/menu-items/${selectedRestaurant}`)
      .then(res => res.json())
      .then(data => {

        // Guarda productos del restaurante
        setMenuItems(data.menuItems || []);

        // Limpia carrito si cambia restaurante
        setItems([]);
      })
      .catch(err => console.error(err));

  }, [selectedRestaurant]); // depende de selectedRestaurant


  // =========================
  // AGREGAR PRODUCTO AL CARRITO
  // =========================
  const agregarProducto = (producto) => {

    // Verifica si el producto ya está en el carrito
    const existe = items.find(i => i.id_item === producto.id_item);

    if (existe) {

      // Si ya existe → solo aumenta cantidad
      setItems(items.map(i =>
        i.id_item === producto.id_item
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ));

    } else {

      // Si no existe → lo agrega al carrito
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
  // ELIMINAR PRODUCTO DEL CARRITO
  // =========================
  const eliminarItem = (id_item) => {

    // Filtra y elimina el producto seleccionado
    setItems(items.filter(item => item.id_item !== id_item));
  };


  // =========================
  // EDITAR CANTIDAD O PRECIO
  // =========================
  const actualizarItem = (id_item, campo, valor) => {

    // No permitir cantidad menor a 1
    if (campo === 'cantidad' && valor < 1) return;

    // Actualiza dinámicamente el campo modificado
    setItems(items.map(item =>
      item.id_item === id_item
        ? { ...item, [campo]: valor }
        : item
    ));
  };


  // =========================
  // CALCULAR TOTAL GENERAL
  // =========================
  // reduce → recorre el carrito y suma subtotales
  const totalGeneral = items.reduce(
    (acc, item) => acc + (item.cantidad * item.precio_cliente),
    0
  );


  // =========================
  // CREAR ORDEN
  // =========================
  const handleCreateOrder = async (e) => {

    e.preventDefault(); // evita recargar página
    setMensajeOrden('');

    try {

      // Estructura que se enviará al backend
      const data = {
        id_restaurante: parseInt(selectedRestaurant),
        items: items.map(item => ({
          id_item: item.id_item,
          cantidad: item.cantidad,
          precio_cliente: item.precio_cliente
        }))
      };

      // Llamada al API
      const response = await createOrder(data);

      // Mostrar mensaje de éxito
      setMensajeOrden(response.data.mensaje || 'Orden creada correctamente');

      // Limpiar datos después de crear orden
      setSelectedRestaurant('');
      setItems([]);

    } catch (error) {

      // Mostrar error si ocurre
      setMensajeOrden(
        error.response?.data?.error || 'Error al crear orden'
      );
    }
  };


  // =========================
  // INTERFAZ (HTML + JSX)
  // =========================
  return (
    <div style={{ padding: 40 }}>

      <h1>Módulo Cliente</h1>

      <h3>Crear Orden</h3>

      <form onSubmit={handleCreateOrder}>

        {/* SELECT DE RESTAURANTES */}
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          required
        >
          <option value="">Seleccione Restaurante</option>

          {/* Render dinámico de restaurantes */}
          {restaurants.map(r => (
            <option key={r.id_restaurante} value={r.id_restaurante}>
              {r.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        {/* PRODUCTOS SOLO SI HAY RESTAURANTE */}
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

        {/* CARRITO */}
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

        {/* TOTAL Y BOTÓN SOLO SI HAY PRODUCTOS */}
        {items.length > 0 && (
          <>
            <h3>Total General: Q{totalGeneral.toFixed(2)}</h3>
            <button type="submit">
              Crear Orden
            </button>
          </>
        )}

      </form>

      {/* MENSAJE DEL BACKEND */}
      {mensajeOrden && (
        <p>
          {mensajeOrden}
        </p>
      )}

      <br />
      <LogoutButton />

    </div>
  );
}

export default Cliente;