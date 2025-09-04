"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PredavanjeList = () => {
  const [mounted, setMounted] = useState(false);
  const [lectures, setLectures] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => setMounted(true), []);

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Nema tokena za autorizaciju");

      const res = await axios.get("http://localhost:8000/predavanja", {
        params: { offset: page * pageSize, limit: pageSize },
        headers: {
          Authorization: `Bearer ${token}`, // Slanje JWT tokena u headeru
        },
      });

      const data = res.data.map((lecture: any, idx: number) => ({
        id: lecture.id || idx,
        naziv: lecture.naziv || "Nepoznato",
        status: lecture.status || "Nepoznato",
      }));

      setLectures(data);
      setRowCount(parseInt(res.headers["x-total-count"], 10) || data.length);
    } catch (err: any) {
      console.error("Greška pri dohvaćanju predavanja:", err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    if (mounted) fetchLectures();
  }, [page, pageSize, mounted]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "naziv", headerName: "Naziv", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
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
        Lista predavanja
      </Typography>
      <DataGrid
        rows={lectures}
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

export default PredavanjeList;
