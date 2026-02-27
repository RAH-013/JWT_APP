import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faChessBishop,
  faChessKing,
  faChessPawn,
  faTerminal,
  faUserPen,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

import { openEditProfileModal, openLogoutModal } from "../utils/profileModals";
import { useUser } from "../context/UserContext";

const MySwal = withReactContent(Swal);

function Header() {
  const { user, loading } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null;

  const userIcon =
    user?.role === "admin"
      ? faChessKing
      : user?.role === "manager"
        ? faChessBishop
        : faChessPawn;

  const handleLogoutDirect = () => {
    sessionStorage.removeItem("jwt_project");
    window.location.reload();
  };

  const handleEditProfile = () => {
    openEditProfileModal(user, handleLogoutDirect);
  };

  const handleLogout = () => {
    openLogoutModal(handleLogoutDirect);
  };

  const isLogsPage = location.pathname === "/logs";

  return (
    <header>
      <h1 title={user.role}>
        <FontAwesomeIcon icon={userIcon} style={{ marginRight: 10 }} />
        {user.name}
      </h1>

      <div className="headerButtonsContainer">
        {user?.role === "admin" && !isLogsPage && (
          <button title="Ver Logs" onClick={() => navigate("/logs")}>
            <FontAwesomeIcon icon={faTerminal} />
          </button>
        )}

        {isLogsPage && (
          <button title="Inicio" onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faHouse} />
          </button>
        )}

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