import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import { getOrdenesByRestaurante,updateEstadoOrden } from "../api/order.api";
import { getRestaurants } from "../api/menu.api";


function RestauranteOrdenes() {

  //const { id } = useParams();

  const navigate = useNavigate();

  const [ordenes, setOrdenes] = useState([]);
  //const [loading, setLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [restaurants, setRestaurants] = useState([]);
  //const [restauranteSeleccionado, setRestauranteSeleccionado] = useState(id || "");
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState("");

   const [estadoVista, setEstadoVista] = useState("CREADA");


   useEffect(() => {
  const fetchRestaurants = async () => {
    try {
      const res = await getRestaurants();
      setRestaurants(res.data?.restaurants || []);
    } catch (err) {
      console.error(err);
      setMensaje({ texto: "Error al cargar restaurantes", tipo: "error" });
    }
  };

  fetchRestaurants();
}, []);




useEffect(() => {

  if (!restauranteSeleccionado) return;

  const cargarOrdenes = async () => {
    try {
      setLoading(true);

      const response = await getOrdenesByRestaurante(restauranteSeleccionado);

      const data = response.data;

      const ordenesCreadas = data.filter(
       // (orden) => orden.estado === "CREADA"
         (orden) => orden.estado === estadoVista
      );

      setOrdenes(ordenesCreadas);

    } catch (error) {
      setMensaje({
        texto:
          error.response?.data?.error ||
          error.message ||
          "Error al cargar órdenes",
        tipo: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  cargarOrdenes();

}, [restauranteSeleccionado,estadoVista]);


/*

 useEffect(() => {
  const cargarOrdenes = async () => {
    try {
      const response = await getOrdenesByRestaurante(id);

      const data = response.data; // ✅ Axios usa .data

      const ordenesCreadas = data.filter(
        (orden) => orden.estado === "CREADA"
      );

      setOrdenes(ordenesCreadas);

    } catch (error) {
      setMensaje({
        texto:
          error.response?.data?.error ||
          error.message ||
          "Error al cargar órdenes",
        tipo: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  cargarOrdenes();
}, [id]);
*/

  const cambiarEstado  = async (idOrden, nuevoEstado) => {
  try {
    await updateEstadoOrden(idOrden, nuevoEstado);

    const response = await getOrdenesByRestaurante(restauranteSeleccionado);

    setOrdenes(
      response.data.filter(o => o.estado === estadoVista)
    );

  } catch (error) {
    console.error(error);
    setMensaje({
      texto: "Error actualizando estado",
      tipo: "error"
    });
  }
};




  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>📦 Órdenes {estadoVista} - Restaurante </h2>
        
<div style={{ marginTop: "10px" }}>
  <select
    value={restauranteSeleccionado}
    onChange={(e) => setRestauranteSeleccionado(e.target.value)}
  >


    <option value="">-- Selecciona Restaurante --</option>
    {restaurants.map((r) => (
      <option key={r.id_restaurante} value={r.id_restaurante}>
        {r.nombre}
      </option>
    ))}
  </select>
</div>

{/* BOTONES DE ESTADO */}
<div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <button onClick={() => setEstadoVista("CREADA")}>
    📦 Creadas
  </button>

  <button onClick={() => setEstadoVista("EN_PROCESO")}>
    🔄 En Proceso
  </button>

  <button onClick={() => setEstadoVista("FINALIZADA")}>
    ✅ Finalizadas
  </button>

  <button onClick={() => setEstadoVista("RECHAZADA")}>
    ❌ Rechazadas
  </button>

  <button onClick={() => setEstadoVista("CANCELADA")}>
  🛑 Canceladas
</button>

</div>


        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            ⬅ Volver
          </button>

          <LogoutButton />
        </div>
      </header>

      {loading && <p>Cargando órdenes...</p>}

      {mensaje && (
        <p style={{ color: "red" }}>
          {mensaje.texto}
        </p>
      )}

      {!loading && ordenes.length === 0 && (
      //  <p>No hay órdenes en estado CREADA.</p>
      <p>No hay órdenes en estado {estadoVista}.</p>
      )}

      <div style={styles.grid}>
    
{ordenes.map((orden) => (
  <div key={orden.id_orden} style={styles.card}>
    <h4>Orden #{orden.id_orden}</h4>

    <p><strong>Cliente:</strong> {orden.id_cliente}</p>
    <p><strong>Total:</strong> ${orden.total}</p>
    <p><strong>Estado:</strong> {orden.estado}</p>
    
      {/* BOTONES SEGÚN ESTADO */}

{orden.estado === "CREADA" && (
  <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
    <button
      onClick={() => cambiarEstado(orden.id_orden, "EN_PROCESO")}
      style={{
        background: "#16a34a",
        color: "white",
        border: "none",
        padding: "6px 10px",
        cursor: "pointer",
        borderRadius: "5px"
      }}
    >
      ▶ En Proceso
    </button>

    <button
      onClick={() => cambiarEstado(orden.id_orden, "RECHAZADA")}
      style={{
        background: "#dc2626",
        color: "white",
        border: "none",
        padding: "6px 10px",
        cursor: "pointer",
        borderRadius: "5px"
      }}
    >
      ❌ Rechazar
    </button>
  </div>
)}

{orden.estado === "EN_PROCESO" && (
  <div style={{ marginTop: "10px" }}>
    <button
      onClick={() => cambiarEstado(orden.id_orden, "FINALIZADA")}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "6px 10px",
        cursor: "pointer",
        borderRadius: "5px"
      }}
    >
      ✅ Finalizar
    </button>
  </div>
)}


    <p><strong>Fecha:</strong> {new Date(orden.fecha_creacion).toLocaleString()}</p>

    {/* Información del Restaurante */}
    {orden.restaurante && (
      <>
        <p><strong>Restaurante:</strong> {orden.restaurante.nombre}</p>
        <p><strong>Dirección:</strong> {orden.restaurante.direccion}</p>
      </>
    )}

    <h5>Productos:</h5>

    {orden.detalle.map((item, index) => (
      <div key={index} style={{ marginBottom: "8px" }}>
        <p><strong>{item.nombre_producto}</strong></p>
        <p>Cantidad: {item.cantidad}</p>
        <p>Precio unitario: ${item.precio_unitario}</p>
        <p>
          Subtotal: $
          {(item.cantidad * parseFloat(item.precio_unitario)).toFixed(2)}
        </p>
        <hr />
      </div>
    ))}
  </div>
))}

    
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  backButton: {
    background: "#6b7280",
    color: "white",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "15px"
  },
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    background: "#f9fafb"
  },

  section: {
  marginTop: "10px",
  padding: "10px",
  background: "#ffffff",
  borderRadius: "6px"
},
productItem: {
  marginBottom: "8px"
}
};

export default RestauranteOrdenes;