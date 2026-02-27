import { DataGrid } from "@mui/x-data-grid";

import "../style/table.css"

function Table({ rows, columns, title, actionButton, actionColumn }) {
    const finalColumns = actionColumn
        ? [...columns, actionColumn]
        : columns;

    return (
        <div className="containerTable">
            <div className="headerTable">
                <h2>{title}</h2>
                {actionButton}
            </div>

            <div className="table">
                <DataGrid
                    rows={rows}
                    columns={finalColumns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 6,
                                page: 0,
                            },
                        },
                    }}
                    pageSizeOptions={[10]}
                    disableRowSelectionOnClick
                    disableMultipleRowSelection
                    hideFooterSelectedRowCount
                />
            </div>
        </div>
    );
}

export default Table;