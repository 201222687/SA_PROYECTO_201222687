import axios from 'axios';

const API = 'http://localhost:5000/auth';

export const login = (data) =>
  axios.post(`${API}/login`, data);

export const registerCliente = (data) =>
  axios.post(`${API}/register`, data);

export const registerAdmin = (data) => {
  // Tomar token del localStorage
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  return axios.post(`${API}/admin/register`, data, {
    headers: {

        Authorization: token
        //Authorization: `Bearer ${token}`
      //Authorization: `Bearer ${token}`,
     // 'Content-Type': 'application/json'
    }
  });
};
