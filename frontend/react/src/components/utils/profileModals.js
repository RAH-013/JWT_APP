import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { apiUpdate, apiDelete } from "../../api/auth";

const MySwal = withReactContent(Swal);

export const openEditProfileModal = async (user, onLogout) => {
    const { value, isConfirmed } = await MySwal.fire({
        title: "Editar perfil",
        html: `
      <input
        id="swal-name"
        class="swal2-input"
        placeholder="${user.name}"
      />
      <input
        id="swal-password"
        class="swal2-input"
        type="password"
        placeholder="Contraseña (opcional)"
      />
    `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        confirmButtonColor: "#5d0677",
        showDenyButton: true,
        denyButtonText: "Borrar perfil",
        denyButtonColor: "#dc2626",
        preConfirm: () => {
            const name = document.getElementById("swal-name").value;
            const password = document.getElementById("swal-password").value;

            return {
                name: name || user.name,
                ...(password && { password }),
            };
        },
    });

    if (isConfirmed && value) {
        await apiUpdate(user.id, value);
        MySwal.fire({
            position: "bottom",
            icon: "success",
            title: "Perfil actualizado",
            toast: true,
            timer: 2000,
            showConfirmButton: false,
        });
    }

    if (Swal.getDenyButton()?.matches(":focus")) {
        const { isConfirmed: confirmDelete } = await MySwal.fire({
            title: "¿Eliminar perfil?",
            text: "Esta acción es irreversible",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            confirmButtonColor: "#dc2626",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
        });

        if (confirmDelete) {
            await apiDelete(user.id);
            onLogout();
        }
    }
};

export const openLogoutModal = async (onConfirm) => {
    const { isConfirmed } = await MySwal.fire({
        title: "¿Cerrar sesión?",
        icon: "warning",
        showCancelButton: false,
        confirmButtonColor: "#5d0677",
        showDenyButton: true,
        confirmButtonText: "Cerrar Sesión",
        denyButtonText: "Cancelar",
        denyButtonColor: "#dc2626",
        reverseButtons: true,
    });

    if (isConfirmed) {
        onConfirm();
    }
};