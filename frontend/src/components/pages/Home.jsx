import { useEffect, useState } from "react";
import Table from "../layouts/Table";
import Loader from "../layouts/Loader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

import { apiGetUsers } from "../../api/auth";
import { useUser } from "../context/UserContext";
import { openAddUserModal, openEditUserModal, openDeleteUserModal } from "../utils/crudUsers";

function Home() {
  const { user, loading: userLoading } = useUser();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiGetUsers();
      setRows(
        res.users.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Usuario", flex: 1 },
    { field: "role", headerName: "Rol", width: 150 },
  ];

  const actionColumn = {
    field: "actions",
    headerName: "Acciones",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <div className="table-actions">
        <button
          title="Eliminar Usuario"
          onClick={() => openDeleteUserModal(params.row, fetchUsers)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button
          title="Editar Usuario"
          onClick={() => openEditUserModal(params.row, fetchUsers)}
        >
          <FontAwesomeIcon icon={faPencil} />
        </button>
      </div>
    ),
  };

  const handleAddUser = () => {
    openAddUserModal(fetchUsers);
  };

  const addUserButton =
    user?.role === "admin" ? (
      <button onClick={handleAddUser}>
        Agregar Usuario <FontAwesomeIcon icon={faPlus} />
      </button>
    ) : null;

  if (loading || userLoading) return <Loader />;

  return (
    <Table
      rows={rows}
      columns={columns}
      actionButton={addUserButton}
      actionColumn={user?.role === "admin" ? actionColumn : null}
      title="Usuarios"
    />
  );
}

export default Home;