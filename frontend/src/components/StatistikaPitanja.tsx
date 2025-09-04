"use client";

import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts";
import {
  Box,
  Typography,
  CircularProgress,
  Select,
  Option,
} from "@mui/joy";

interface Statistika {
  postavljena: number;
  odgovorena: number;
}

interface PredavanjeType {
  id: number;
  naziv: string;
}

export default function StatistikaPitanja() {
  const [predavanja, setPredavanja] = useState<PredavanjeType[]>([]);
  const [odabrano, setOdabrano] = useState<number | null>(null);
  const [statistika, setStatistika] = useState<Statistika | null>(null);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Dohvati sva predavanja predavača
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/predavanja/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Neuspješno dohvaćanje predavanja");
        return res.json();
      })
      .then((data) => setPredavanja(data))
      .catch((err) => console.error("Greška pri učitavanju predavanja:", err));
  }, [token]);

  // Dohvati statistiku kada se promijeni odabrano predavanje
  useEffect(() => {
    if (!odabrano || !token) return;
    setLoading(true);

    fetch(`http://localhost:8000/pitanja/${odabrano}/statistika`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Neuspješno dohvaćanje statistike");
        return res.json();
      })
      .then((data) => setStatistika(data))
      .catch((err) => console.error("Greška pri učitavanju statistike:", err))
      .finally(() => setLoading(false));
  }, [odabrano, token]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography level="h5" sx={{ mb: 2 }}>
        Statistika pitanja
      </Typography>

      {/* Izbor predavanja */}
      <Select
        placeholder="Odaberi predavanje"
        value={odabrano ?? ""}
        onChange={(_, value) => setOdabrano(value as number)}
        sx={{ mb: 3, width: 250 }}
      >
        {predavanja.map((p) => (
          <Option key={p.id} value={p.id}>
            {p.naziv}
          </Option>
        ))}
      </Select>

      {/* Prikaz grafa */}
      {loading && <CircularProgress />}

      {!loading && odabrano && statistika && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PieChart
            series={[
              {
                data: [
                  {
                    id: 0,
                    value: statistika.postavljena,
                    label: "Postavljena",
                    color: "rgba(128, 0, 128, 0.3)", // ljubičasta
                  },
                  {
                    id: 1,
                    value: statistika.odgovorena,
                    label: "Odgovorena",
                    color: "#f8bbd0", // roza
                  },
                ],
                innerRadius: 80,
              },
            ]}
            width={300}
            height={300}
          >
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: "18px", fontWeight: "bold" }}
            >
              {statistika.postavljena + statistika.odgovorena} pitanja
            </text>
          </PieChart>
        </Box>
      )}
    </Box>
  );
}
