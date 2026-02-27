import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { apiCreate } from "../../api/auth";

import "../style/auth.css";

const MySwal = withReactContent(Swal);

export default function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCreate({ name, password, role });

      MySwal.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        title: "Usuario creado exitosamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (err) {
      console.error("Error en registro:", err);
      MySwal.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Error al crear usuario",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authContainer">
      <form onSubmit={handleSubmit}>
        <h1>Registrar nuevo usuario</h1>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Registrar"}
        </button>
        <p style={{ marginTop: "10px", textAlign: "center", cursor: "pointer", color: "#007bff" }}>
          <span onClick={() => navigate("/authenticate")} style={{ textDecoration: "underline" }}>
            Volver al login
          </span>
        </p>
      </form>
    </div>
  );
}

