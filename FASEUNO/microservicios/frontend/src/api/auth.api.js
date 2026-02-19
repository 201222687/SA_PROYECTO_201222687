import axios from 'axios';
import { API } from "./api";


const AUTH_API  = `${API}/auth`;

export const login = (data) =>
  axios.post(`${AUTH_API}/login`, data);

export const registerCliente = (data) =>
  axios.post(`${AUTH_API}/register`, data);

export const registerAdmin = (data) => {
  // Tomar token del localStorage
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token de autenticación');

  return axios.post(`${AUTH_API}/admin/register`, data, {
    headers: {

        Authorization: token
        //Authorization: `Bearer ${token}`
      //Authorization: `Bearer ${token}`,
     // 'Content-Type': 'application/json'
    }
  });
};
