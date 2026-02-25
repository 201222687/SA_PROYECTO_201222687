import axios from "axios";
import { API } from "./api";

// API Gateway

export const createOrder = async (data) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.post(
    `${API}/orden`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// api/orden.api.js
export const getOrdenesByRestaurante = async (id) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.get(
    `${API}/orden/restauranteapi/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// Actualizar estado de orden
export const updateEstadoOrden = async (id_orden, nuevoEstado) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.put(
    `${API}/orden/${id_orden}/estado`,
    { estado: nuevoEstado },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};




export const getMyOrders = async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.get(
    `${API}/orden/mis-ordenes`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};