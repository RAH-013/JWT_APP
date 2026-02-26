import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { apiCreate, apiUpdate, apiDelete } from "../../api/auth";

const MySwal = withReactContent(Swal);

export const openAddUserModal = async (onSuccess) => {
    const { value: formValues } = await MySwal.fire({
        title: "Agregar Usuario",
        html:
            `<input id="swal-name" class="swal2-custom-input" placeholder="Nombre" autocomplete="off"/>` +
            `<input id="swal-password" type="password" class="swal2-custom-input" placeholder="Contraseña" autocomplete="off"/>` +
            `<select id="swal-role" class="swal2-custom-select">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
        </select>`,
        focusConfirm: false,
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: "Crear",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5d0677",
        cancelButtonColor: "#dc2626",
        preConfirm: () => {
            const name = document.getElementById("swal-name").value;
            const password = document.getElementById("swal-password").value;
            const role = document.getElementById("swal-role").value;

            if (!name) MySwal.showValidationMessage("El nombre es obligatorio");
            if (!password) MySwal.showValidationMessage("La contraseña es obligatoria");

            return { name, password, role };
        },
    });

    if (formValues) {
        try {
            await apiCreate(formValues);
            MySwal.fire("Éxito", "Usuario creado correctamente", "success");
            if (onSuccess) onSuccess();
        } catch (err) {
            MySwal.fire("Error", err.message || "No se pudo crear el usuario", "error");
        }
    }
};

export const openEditUserModal = async (userData, onSuccess) => {
    const { value: formValues } = await MySwal.fire({
        title: `Editar usuario`,
        html:
            `<input id="swal-name" class="swal2-custom-input" placeholder="Nombre" value="${userData.name}" autocomplete="off"/>` +
            `<input id="swal-password" type="password" class="swal2-custom-input" placeholder="Contraseña (opcional)" autocomplete="off"/>` +
            `<select id="swal-role" class="swal2-custom-select">
        <option value="admin" ${userData.role === "admin" ? "selected" : ""}>Admin</option>
        <option value="manager" ${userData.role === "manager" ? "selected" : ""}>Manager</option>
        <option value="user" ${userData.role === "user" ? "selected" : ""}>User</option>
        </select>`,
        focusConfirm: false,
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: "Actualizar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5d0677",
        cancelButtonColor: "#dc2626",
        preConfirm: () => {
            const name = document.getElementById("swal-name").value;
            const password = document.getElementById("swal-password").value;
            const role = document.getElementById("swal-role").value;

            if (!name) MySwal.showValidationMessage("El nombre es obligatorio");

            return { name, password: password || undefined, role };
        },
    });

    if (formValues) {
        try {
            await apiUpdate(userData.id, formValues);
            MySwal.fire("Éxito", "Usuario actualizado correctamente", "success");
            if (onSuccess) onSuccess();
        } catch (err) {
            MySwal.fire("Error", err.message || "No se pudo actualizar el usuario", "error");
        }
    }
};

export const openDeleteUserModal = async (userData, onSuccess) => {
    const result = await MySwal.fire({
        title: `¿Eliminar usuario ${userData.name}?`,
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5d0677",
        cancelButtonColor: "#dc2626",
    });

    if (result.isConfirmed) {
        try {
            await apiDelete(userData.id);
            MySwal.fire("Eliminado", "Usuario eliminado correctamente", "success");
            if (onSuccess) onSuccess();
        } catch (err) {
            MySwal.fire("Error", err.message || "No se pudo eliminar el usuario", "error");
        }
    }
};