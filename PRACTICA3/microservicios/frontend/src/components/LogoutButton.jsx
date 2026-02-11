import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} style={{ marginTop: 20 }}>
      Cerrar Sesión
    </button>
  );
}

export default LogoutButton;

