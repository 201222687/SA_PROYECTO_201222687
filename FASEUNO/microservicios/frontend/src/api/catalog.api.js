import axios from "axios";
import { API } from "./api";

// ===============================
// RESTAURANTES
// ===============================

// Obtener todos los restaurantes (público)
export const getRestaurants = async () => {
  return axios.get(`${API}/catalog/restaurants`);
};

// Crear restaurante (ADMIN)
export const createRestaurant = async (data) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.post(
    `${API}/catalog/restaurants`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

// Actualizar restaurante (ADMIN)
export const updateRestaurant = async (id, data) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.put(
    `${API}/catalog/restaurants/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

// Eliminar restaurante (ADMIN)
export const deleteRestaurant = async (id) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.delete(
    `${API}/catalog/restaurants/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

// ===============================
// MENU ITEMS
// ===============================

// Obtener todos los items
export const getMenuItems = async () => {
  return axios.get(`${API}/catalog/menu-items`);
};

// Obtener items por restaurante
export const getMenuItemsByRestaurant = async (restaurantId) => {
  return axios.get(`${API}/catalog/menu-items/${restaurantId}`);
};