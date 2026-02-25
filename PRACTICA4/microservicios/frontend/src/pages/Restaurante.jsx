import { useState, useEffect } from "react";
import LogoutButton from "../components/LogoutButton";
import { useNavigate } from "react-router-dom";

import {
  getRestaurants,
  getMenuItemsByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from "../api/menu.api";

function Restaurante() {

  const [restaurants, setRestaurants] = useState([]);
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState("");

  const [menuItems, setMenuItems] = useState([]);
  const [formItem, setFormItem] = useState({
    nombre: "",
    precio: "",
    disponible: true
  });

  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const navigate = useNavigate();

  // =============================
  // CARGAR RESTAURANTES
  // =============================
  const fetchRestaurants = async () => {
    try {
      const res = await getRestaurants();
      setRestaurants(res.data?.restaurants || []);
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al cargar restaurantes", tipo: "error" });
    }
  };

// =============================
// CARGAR MENU
// =============================
const fetchMenu = async (id) => {
  try {
    const res = await getMenuItemsByRestaurant(id);

    console.log("Respuesta del menú:", res.data); // para verificar

    // 👇 CORRECCIÓN SEGÚN TU PROTO
    setMenuItems(res.data?.menuItems || []);

  } catch (err) {
    console.error(err);
    setMensaje({ texto: "Error al cargar menú", tipo: "error" });
  }
};

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // =============================
  // CAMBIO DE RESTAURANTE
  // =============================
  const handleRestaurantChange = (e) => {
    const id = e.target.value;
    setRestauranteSeleccionado(id);

    if (id) {
      fetchMenu(id);
    } else {
      setMenuItems([]);
    }
  };

  // =============================
  // CREAR ITEM
  // =============================
  const crearItem = async () => {

    if (!restauranteSeleccionado) {
      setMensaje({ texto: "Selecciona un restaurante", tipo: "error" });
      return;
    }

    if (!formItem.nombre || !formItem.precio) {
      setMensaje({ texto: "Nombre y precio obligatorios", tipo: "error" });
      return;
    }

    try {
      await createMenuItem({
        id_restaurante: restauranteSeleccionado,
        nombre: formItem.nombre,
        precio: parseFloat(formItem.precio),
        disponible: formItem.disponible
      });

      setMensaje({ texto: "Ítem creado correctamente", tipo: "exito" });

      setFormItem({ nombre: "", precio: "", disponible: true });
      fetchMenu(restauranteSeleccionado);

    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al crear ítem", tipo: "error" });
    }
  };

  // =============================
  // SELECCIONAR ITEM
  // =============================
  const seleccionarItem = (item) => {
    setItemSeleccionado(item.id_item);
    setFormItem({
      nombre: item.nombre,
      precio: item.precio,
      disponible: item.disponible
    });
  };

  // =============================
  // ACTUALIZAR ITEM
  // =============================
  const actualizarItem = async () => {
    try {
      await updateMenuItem(itemSeleccionado, {
        nombre: formItem.nombre,
        precio: parseFloat(formItem.precio),
        disponible: formItem.disponible
      });

      setMensaje({ texto: "Ítem actualizado", tipo: "exito" });

      setItemSeleccionado(null);
      setFormItem({ nombre: "", precio: "", disponible: true });

      fetchMenu(restauranteSeleccionado);

    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al actualizar", tipo: "error" });
    }
  };

  // =============================
  // ELIMINAR ITEM
  // =============================
  const eliminarItem = async (id) => {

    if (!window.confirm("¿Eliminar ítem?")) return;

    try {
      await deleteMenuItem(id);

      setMensaje({ texto: "Ítem eliminado", tipo: "exito" });
      fetchMenu(restauranteSeleccionado);

    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al eliminar", tipo: "error" });
    }
  };

// =============================
// IR A ORDENES CREADAS
// =============================
const irAOrdenes = () => {

  navigate(`/restaurantes-ordenes`);
};


  return (
    <div style={styles.container}>

      <header style={styles.header}>
  <h2>🍽 Dashboard Restaurante</h2>

  <div style={{ display: "flex", gap: "10px" }}>
    <button
      onClick={irAOrdenes}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "8px 12px",
        cursor: "pointer"
      }}
    >
      Ver Órdenes Creadas
    </button>

    <LogoutButton />
  </div>
</header>

      <div style={styles.content}>

        <h3>Seleccionar Restaurante</h3>

        <select
          value={restauranteSeleccionado}
          onChange={handleRestaurantChange}
        >
          <option value="">-- Selecciona --</option>
          {restaurants.map(r => (
            <option key={r.id_restaurante} value={r.id_restaurante}>
              {r.nombre}
            </option>
          ))}
        </select>

        {restauranteSeleccionado && (
          <>
            <h3 style={{ marginTop: 20 }}>Gestión de Menú</h3>

            {mensaje && (
              <p style={{ color: mensaje.tipo === "error" ? "red" : "green" }}>
                {mensaje.texto}
              </p>
            )}

            <div style={styles.formBox}>
              <input
                placeholder="Nombre del platillo"
                value={formItem.nombre}
                onChange={e =>
                  setFormItem({ ...formItem, nombre: e.target.value })
                }
              /><br /><br />

              <input
                type="number"
                placeholder="Precio"
                value={formItem.precio}
                onChange={e =>
                  setFormItem({ ...formItem, precio: e.target.value })
                }
              /><br /><br />

              <label>
                Disponible:
                <input
                  type="checkbox"
                  checked={formItem.disponible}
                  onChange={e =>
                    setFormItem({ ...formItem, disponible: e.target.checked })
                  }
                />
              </label><br /><br />

              {itemSeleccionado ? (
                <>
                  <button onClick={actualizarItem}>Actualizar</button>
                  <button onClick={() => {
                    setItemSeleccionado(null);
                    setFormItem({ nombre: "", precio: "", disponible: true });
                  }}>
                    Cancelar
                  </button>
                </>
              ) : (
                <button onClick={crearItem}>Crear</button>
              )}
            </div>

            {menuItems.map(item => (
              <div key={item.id_item} style={styles.card}>
                <div>
                  <strong>{item.nombre}</strong><br />
                  Q{item.precio}<br />
                  {item.disponible ? "Disponible" : "No disponible"}
                </div>
                <div>
                  <button onClick={() => seleccionarItem(item)}>Editar</button>
                  <button onClick={() => eliminarItem(item.id_item)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Arial", minHeight: "100vh", background: "#f4f6f8" },
  header: { background: "#111827", color: "white", padding: "15px 30px", display: "flex", justifyContent: "space-between" },
  content: { padding: 30 },
  formBox: { background: "white", padding: 20, marginTop: 20, marginBottom: 20 },
  card: { background: "white", padding: 15, marginBottom: 10, display: "flex", justifyContent: "space-between" }
};

export default Restaurante;