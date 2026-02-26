import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faChessBishop, faChessKing, faChessPawn, faUserPen } from "@fortawesome/free-solid-svg-icons";

import { apiMe, apiUpdate } from "../../api/auth";

const MySwal = withReactContent(Swal);

function Header() {
  const [user, setUser] = useState(null);
  const [userIcon, setUserIcon] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await apiMe();

      if (data?.role === "admin") setUserIcon(faChessKing);
      else if (data?.role === "manager") setUserIcon(faChessBishop);
      else if (data?.role === "user") setUserIcon(faChessPawn);

      setUser(data);
    };
    fetchUser();
  }, []);

  const handleEditProfile = async () => {
    if (!user) return;

    const { value: formValues } = await MySwal.fire({
      title: "Editar perfil",
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${user.name || ""}">
        <input id="swal-password" class="swal2-input" type="password" placeholder="Contraseña nueva">
      `,
      focusConfirm: false,
      reverseButtons: true,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swal-name").value;
        const password = document.getElementById("swal-password").value;
        return { name, password };
      },
    });

    if (formValues) {
      try {
        await apiUpdate(user.id, formValues);
        MySwal.fire({
          icon: "success",
          title: "Perfil actualizado",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        setUser((prev) => ({ ...prev, name: formValues.name || prev.name }));
      } catch (err) {
        MySwal.fire({
          icon: "error",
          title: err.message || "Error al actualizar perfil",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: "¿Estás seguro?",
      text: "Se cerrará tu sesión actual",
      icon: "warning",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: "#5d0677",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      sessionStorage.removeItem("jwt_project");
      window.location.reload(); // recarga la página para redirigir al login
    }
  };

  return (
    <header>
      <h1 title={user?.role}>
        {userIcon && <FontAwesomeIcon icon={userIcon} style={{ marginRight: "10px" }} />}
        {user?.name}
      </h1>
      <div className="headerButtonsContainer">
        <button title="Editar perfil" onClick={handleEditProfile}>
          <FontAwesomeIcon icon={faUserPen} />
        </button>
        <button title="Cerrar sesión" onClick={handleLogout}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </button>
      </div>
    </header>
  );
}

export default Header;
