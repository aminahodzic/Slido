"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const UserList = () => {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => setMounted(true), []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Nema tokena za autorizaciju");

      const res = await axios.get("http://localhost:8000/users", {
        params: { offset: page * pageSize, limit: pageSize },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data.map((u: any, idx: number) => ({
        id: u.id || idx,
        ime: u.username || "Nepoznato",
        spol: u.spol || "Nepoznato",
        role: u.role,
        suspendovan_do: u.suspendovan_do,
      }));

      setUsers(data);
      setRowCount(parseInt(res.headers["x-total-count"], 10) || data.length);
    } catch (err) {
      console.error("Greška pri dohvaćanju korisnika:", err);
    }
  };

  useEffect(() => {
    if (mounted) fetchUsers();
  }, [page, pageSize, mounted]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "ime", headerName: "Ime", width: 150 },
    { field: "spol", headerName: "Spol", width: 100 },
    { field: "role", headerName: "Uloga", width: 150 },
    {
      field: "suspendovan_do",
      headerName: "Suspendovan do",
      width: 150,
      valueFormatter: (param) => param?.value || "Nema",
    },
  ];

  if (!mounted) return null;

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", mt: 4, px: 1 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "#f06292", // Roza boja
          "&:hover": {
            color: "#ec407a", // Tamnija roza pri hover-u
          },
        }}
      >
        Lista korisnika
      </Typography>
      <DataGrid
        rows={users}
        columns={columns}
        pagination
        paginationMode="server"
        pageSize={pageSize}
        rowCount={rowCount}
        page={page}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        disableSelectionOnClick
        autoHeight
        sx={{
          "& .MuiDataGrid-root": {
            backgroundColor: "#f8bbd0", // Svjetlija roza pozadina tabele
            color: "#000", // Crna boja teksta u celokupnoj tabeli
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8bbd0", // Svjetlija roza pozadina zaglavlja
            color: "#000", // Crna boja teksta u zaglavlju
          },
          "& .MuiDataGrid-row": {
            backgroundColor: "#f8bbd0", // Svjetlija roza pozadina redova
            color: "#000", // Crna boja teksta u redovima
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#ec407a", // Tamnija roza boja na hover
          },
          "& .MuiDataGrid-cell": {
            borderColor: "#e0e0e0", // Svetlo siva boja granica ćelija
          },
          "& .Mui-selected": {
            backgroundColor: "#ec407a !important", // Tamnija roza za selektovane redove
            color: "#fff", // Bela boja selektovanog teksta
          },
          "& .MuiPaginationItem-root": {
            color: "#f06292", // Roza boja za brojeve stranica
          },
        }}
      />
    </Box>
  );
};

export default UserList;
