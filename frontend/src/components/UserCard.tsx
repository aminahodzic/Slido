"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type UserStats = {
  total_users: number;
  total_admins: number;
  total_predavaci: number;
};

type StatCardData = {
  title: string;
  value: number;
  data: number[];
  color: string;
};

export default function UserCards() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Dummy trend data
  const dummyTrendData = {
    total_users: [200, 240, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380, 360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920],
    total_admins: [20, 18, 22, 19, 20, 21, 15, 22, 24, 18, 20, 19, 21, 20, 22, 23, 24, 23, 25, 26, 22, 27, 25, 23, 26, 24, 25, 27, 30, 31],
    total_predavaci: [50, 52, 49, 51, 55, 53, 48, 56, 54, 50, 52, 53, 51, 54, 52, 55, 57, 56, 58, 59, 55, 60, 58, 57, 59, 58, 60, 62, 65, 66],
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:8000/users/stats");
        if (!res.ok) throw new Error("Neuspješno dohvaćanje statistike");
        const data: UserStats = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Nepoznata greška");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4, color: "#9c27b0" }}>
        Učitavanje podataka...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
        Greška: {error}
      </Typography>
    );
  }

  const cards: StatCardData[] = [
    {
      title: "Ukupno korisnika",
      value: stats ? stats.total_users : 0,
      data: dummyTrendData.total_users,
      color: "#1976d2",
    },
    {
      title: "Ukupno admina",
      value: stats ? stats.total_admins : 0,
      data: dummyTrendData.total_admins,
      color: "#d32f2f",
    },
    {
      title: "Ukupno predavača",
      value: stats ? stats.total_predavaci : 0,
      data: dummyTrendData.total_predavaci,
      color: "#9c27b0",
    },
  ];

  const chartHeight = isXs ? 40 : 50;

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", mt: 4, px: 1 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "#9c27b0",
          fontWeight: "bold",
          "&:hover": { color: "#7b1fa2" },
        }}
      >
        Statistika korisnika
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          width: "100%",
        }}
      >
        {cards.map(({ title, value, data, color }, index) => {
          const chartData = {
            labels: data.map(() => ""),
            datasets: [
              {
                data,
                borderColor: color,
                backgroundColor: color + "33",
                tension: 0.3,
                fill: true,
                pointRadius: 0,
              },
            ],
          };

          const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            elements: { line: { borderWidth: 2 } },
          };

          return (
            <Box key={index} sx={{ flex: "1 1 calc(33.333% - 16px)" }}>
              <Card
                elevation={3}
                sx={{
                  height: 230,
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#ffffff", // Bijela pozadina kartice
                  "&:hover": {
                    backgroundColor: "#f9f9f9", // Lagano siva na hover
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 1, py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#6a1b9a", fontWeight: "500" }}
                    gutterBottom
                    fontSize="0.85rem"
                    noWrap
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ color: "#4a148c", fontWeight: "bold" }}
                    gutterBottom
                    noWrap
                  >
                    {value}
                  </Typography>
                  <Box sx={{ flexGrow: 1, minHeight: chartHeight }}>
                    <Line data={chartData} options={chartOptions} height={chartHeight} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
