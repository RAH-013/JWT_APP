import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useUser } from "../context/UserContext";
import { apiAuth } from "../../api/auth";

import "../style/auth.css";

const MySwal = withReactContent(Swal);

export default function Auth() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { token } = await apiAuth({ name, password });
      sessionStorage.setItem("jwt_project", token);

      MySwal.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        title: "Autenticación exitosa",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      await refreshUser();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error en autenticación:", err);
      MySwal.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Credenciales incorrectas",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  return (
    <div className="authContainer">
      <form onSubmit={handleSubmit}>
        <h1>Ingresa tus credenciales</h1>
        <input
          type="text"
          placeholder="Usuario"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}