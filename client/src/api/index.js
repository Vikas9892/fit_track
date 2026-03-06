import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api/` : "http://localhost:5000/api/",
});

export const UserSignUp = async (data) => API.post("user/signup", data);
export const UserSignIn = async (data) => API.post("user/signin", data);

export const getDashboardDetails = async (token) =>
  API.get("user/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getWorkouts = async (token, date) =>
  await API.get(`user/workout${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addWorkout = async (token, data) =>
  await API.post(`user/workout`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getTutorials = async (token) =>
  API.get("user/tutorials", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getBlogs = async (token) =>
  API.get("user/blogs", {
    headers: { Authorization: `Bearer ${token}` },
  });
