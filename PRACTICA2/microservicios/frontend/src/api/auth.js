const API_URL = 'http://localhost:5000/auth';

export async function registerUser(nombre, correo, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en registro');
  }

  return response.json();
}

export async function loginUser(correo, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en login');
  }

  return response.json(); // { token: '...' }
}
