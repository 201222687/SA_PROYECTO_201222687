import { useState, useEffect } from 'react';
import { registerAdmin } from '../api/auth.api';
import LogoutButton from '../components/LogoutButton';

import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '../api/catalog.api';

function Admin() {

  // =============================
  // CONTROL DE PESTAÑAS
  // =============================
  const [activeTab, setActiveTab] = useState("registro");

  // =============================
  // REGISTRO USUARIOS
  // =============================
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('REPARTIDOR');
  const [error, setError] = useState('');

  // =============================
  // CRUD RESTAURANTES
  // =============================
  const [restaurants, setRestaurants] = useState([]);
  const [formRestaurante, setFormRestaurante] = useState({ nombre: '', direccion: '', activo: true });
  const [restauranteSeleccionado, setRestauranteSeleccionado] = useState(null);

  // =============================
  // MENSAJES
  // =============================
  const [mensaje, setMensaje] = useState('');

  // =============================
  // CARGAR RESTAURANTES
  // =============================
  
const fetchRestaurants = async () => {
  try {
    const res = await getRestaurants();
    setRestaurants(res.data?.restaurants || []);
  } catch (err) {
    console.error(err);
    setMensaje({
      texto: err.response?.data?.error || 'Error al cargar restaurantes.',
      tipo: 'error'
    });
  }
};  

  useEffect(() => {
    if (activeTab === "restaurantes") fetchRestaurants();
  }, [activeTab]);

  // =============================
  // REGISTRAR REPARTIDOR / RESTAURANTE
  // =============================
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerAdmin({ nombre, correo, password, rol });
      alert(`${rol} registrado correctamente`);
      setNombre(''); setCorreo(''); setPassword(''); setRol('REPARTIDOR');
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === 6) { setError('El correo ya está registrado.'); return; }
      if (data?.code === 3) { setError('Faltan datos obligatorios.'); return; }
      alert(data?.error || 'Error al registrar usuario');
      console.error(err);
    }
  };

  // =============================
  // CREAR RESTAURANTE
  // =============================
const crearRestaurante = async () => {
  if (!formRestaurante.nombre) {
    setMensaje({ texto: 'El nombre del restaurante es obligatorio.', tipo: 'error' });
    return;
  }

  try {
    await createRestaurant(formRestaurante);

    setMensaje({ texto: 'Restaurante creado correctamente.', tipo: 'exito' });

    setFormRestaurante({ nombre: '', direccion: '', activo: true });
    fetchRestaurants();
  } catch (err) {
    console.error(err);
    setMensaje({
      texto: err.response?.data?.error || 'Error al crear restaurante.',
      tipo: 'error'
    });
  }
};

  // =============================
  // SELECCIONAR RESTAURANTE
  // =============================
  const seleccionarRestaurante = (restaurante) => {
    setRestauranteSeleccionado(restaurante.id_restaurante);
    setFormRestaurante({ nombre: restaurante.nombre, direccion: restaurante.direccion || '', activo: restaurante.activo });
  };

  // =============================
  // ACTUALIZAR RESTAURANTE
  // =============================
const actualizarRestaurante = async () => {
  try {
    await updateRestaurant(restauranteSeleccionado, formRestaurante);

    setMensaje({ texto: 'Restaurante actualizado correctamente.', tipo: 'exito' });

    setRestauranteSeleccionado(null);
    setFormRestaurante({ nombre: '', direccion: '', activo: true });

    fetchRestaurants();
  } catch (err) {
    console.error(err);
    setMensaje({
      texto: err.response?.data?.error || 'Error al actualizar restaurante.',
      tipo: 'error'
    });
  }
};

  // =============================
  // ELIMINAR RESTAURANTE
  // =============================
const eliminarRestaurante = async (id) => {
  if (!window.confirm("¿Seguro que deseas eliminar este restaurante?")) return;

  try {
    await deleteRestaurant(id);

    setMensaje({ texto: 'Restaurante eliminado correctamente.', tipo: 'exito' });

    if (restauranteSeleccionado === id) {
      setRestauranteSeleccionado(null);
      setFormRestaurante({ nombre: '', direccion: '', activo: true });
    }

    fetchRestaurants();
  } catch (err) {
    console.error(err);
    setMensaje({
      texto: err.response?.data?.error || 'Error al eliminar restaurante.',
      tipo: 'error'
    });
  }
};

  // =============================
  // RENDER
  // =============================
  return (
    <div style={styles.container}>

      <header style={styles.header}>
        <h2> Dashboard Admin</h2>
        <LogoutButton />
      </header>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab("registro")} style={activeTab === "registro" ? styles.activeTab : styles.tab}>Registrar Usuarios</button>
        <button onClick={() => setActiveTab("restaurantes")} style={activeTab === "restaurantes" ? styles.activeTab : styles.tab}>Gestionar Restaurantes</button>
      </div>

      <div style={styles.content}>

        {/* TAB REGISTRO */}
        {activeTab === "registro" && (
          <>
            <h3>Registrar Repartidor o Restaurante</h3>

            {error && <p style={{ color: 'red', marginBottom: 10 }}>{error}</p>}

            <form onSubmit={handleRegister}>
              <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required /><br /><br />
              <input type="email" placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} required /><br /><br />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required /><br /><br />
              <select value={rol} onChange={e => setRol(e.target.value)}>
                <option value="REPARTIDOR">Repartidor</option>
                <option value="RESTAURANTE">Restaurante</option>
              </select><br /><br />
              <button type="submit">Registrar</button>
            </form>
          </>
        )}

        {/* TAB RESTAURANTES */}
        {activeTab === "restaurantes" && (
          <>
            <h3>Gestión Completa de Restaurantes</h3>

            {/* MENSAJE */}
            {mensaje && <p style={{ color: mensaje.tipo === 'error' ? 'red' : 'green', marginBottom: 10 }}>{mensaje.texto}</p>}

            {/* FORMULARIO */}
            <div style={styles.formBox}>
              <input placeholder="Nombre" value={formRestaurante.nombre} onChange={e => setFormRestaurante({ ...formRestaurante, nombre: e.target.value })} /><br /><br />
              <input placeholder="Dirección" value={formRestaurante.direccion} onChange={e => setFormRestaurante({ ...formRestaurante, direccion: e.target.value })} /><br /><br />
              <label>
                Activo:
                <input type="checkbox" checked={formRestaurante.activo} onChange={e => setFormRestaurante({ ...formRestaurante, activo: e.target.checked })} />
              </label><br /><br />

              {restauranteSeleccionado ? (
                <>
                  <button onClick={actualizarRestaurante}>Actualizar Restaurante</button>
                  <button style={{ marginLeft: 10 }} onClick={() => { setRestauranteSeleccionado(null); setFormRestaurante({ nombre: '', direccion: '', activo: true }); }}>Cancelar</button>
                </>
              ) : (
                <button onClick={crearRestaurante}>Crear Restaurante</button>
              )}
            </div>

            {/* LISTADO */}
            <div>
              {restaurants.map(r => (
                <div key={r.id_restaurante} style={styles.card}>
                  <div>
                    <strong>{r.nombre}</strong><br />
                    Dirección: {r.direccion || 'No registrada'}<br />
                    Estado: {r.activo === true || r.activo === "1" || r.activo === "true"
                    ? 'Activo'
                    : 'Inactivo'}
                  </div>
                  <div>
                    <button onClick={() => seleccionarRestaurante(r)}>Editar</button>
                    <button style={styles.deleteBtn} onClick={() => eliminarRestaurante(r.id_restaurante)}>Eliminar</button>
                  </div>
                </div>
              ))}
              
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================
// ESTILOS
// =============================
const styles = {
  container: { fontFamily: 'Arial', minHeight: '100vh', background: '#f4f6f8' },
  header: { background: '#111827', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between' },
  tabs: { display: 'flex', gap: 10, padding: 20 },
  tab: { padding: '8px 15px', cursor: 'pointer' },
  activeTab: { padding: '8px 15px', background: '#2563eb', color: 'white', cursor: 'pointer' },
  content: { padding: 30 },
  formBox: { background: 'white', padding: 20, marginBottom: 20, borderRadius: 6 },
  card: { background: 'white', padding: 15, marginBottom: 10, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  deleteBtn: { marginLeft: 10, background: 'red', color: 'white' }
};

export default Admin;