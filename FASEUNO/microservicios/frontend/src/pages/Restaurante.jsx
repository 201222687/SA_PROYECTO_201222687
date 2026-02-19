import LogoutButton from '../components/LogoutButton';

function Restaurante() {

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <header style={styles.header}>
        <h2>Dashboard Restaurante</h2>
        <LogoutButton />
      </header>

      {/* CONTENIDO */}
      <div style={styles.content}>
        <h3>Bienvenido Restaurante</h3>
        <p>Aquí podrás administrar tu menú y ver órdenes recibidas.</p>

        {/* Aquí luego pondremos gestión de productos */}
      </div>

    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8'
  },
  header: {
    backgroundColor: '#0f172a',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  content: {
    padding: '30px'
  }
};

export default Restaurante;