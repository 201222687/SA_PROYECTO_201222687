import LogoutButton from '../components/LogoutButton';

function Repartidor() {

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <header style={styles.header}>
        <h2>Dashboard Repartidor</h2>
        <LogoutButton />
      </header>

      {/* CONTENIDO */}
      <div style={styles.content}>
        <h3>Bienvenido Repartidor</h3>
        <p>Aquí podrás ver tus órdenes asignadas.</p>

        {/* Aquí luego pondremos tabla de órdenes */}
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
    backgroundColor: '#1e293b',
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

export default Repartidor;