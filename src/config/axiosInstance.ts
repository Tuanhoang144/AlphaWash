"use client";

import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  function (config) {
    let token;

    if (typeof window !== "undefined") {
      token = Cookies.get("jwtToken"); 
      console.log("Client side cookies: ", token);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
      console.log("Setting Content-Type to multipart/form-data");
    } else {
      config.headers["Content-Type"] = "application/json";
    }


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;
