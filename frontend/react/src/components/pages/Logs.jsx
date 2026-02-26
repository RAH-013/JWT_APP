import { useEffect, useState } from "react";
import Table from "../layouts/Table";
import Loader from "../layouts/Loader";

import { apiGetLogs } from "../../api/logs";

function Logs() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { field: "userId", headerName: "ID Usuario", width: 120 },
        { field: "userName", headerName: "Usuario", flex: 1 },
        { field: "ip", headerName: "IP", width: 150 },
        { field: "message", headerName: "Mensaje", flex: 3 },
        {
            field: "createdAt",
            headerName: "Fecha",
            width: 200,
            valueFormatter: (value) => {
                if (!value) return "";

                const d = new Date(value);
                if (isNaN(d)) return value;

                const pad = (n) => String(n).padStart(2, "0");

                return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}
        (${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())})`;
            },
        }
    ];

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await apiGetLogs();
                setRows(
                    res.map((log) => ({
                        id: log.id,
                        userId: log.userId,
                        userName: log.username,
                        ip: log.ip,
                        message: log.message,
                        createdAt: log.createdAt,
                    }))
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <Loader />;

    return (
        <Table
            rows={rows}
            columns={columns}
            title="Logs del sistema"
        />
    );
}

export default Logs;