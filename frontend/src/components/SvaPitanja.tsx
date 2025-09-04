"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Textarea,
  Select,
  Option,
  Card,
  Snackbar,
  Alert,
} from "@mui/joy";
import axios from "axios";

interface Pitanje {
  id: number;
  sadrzaj: string;
  odgovor?: string | null;
  status: string;
  odobravanja_count: number;
  created_at?: string;
}

export default function SvaPitanja() {
  const [pitanja, setPitanja] = useState<Pitanje[]>([]);
  const [sortBy, setSortBy] = useState<"vreme" | "odobravanja">("vreme");
  const [odgovor, setOdgovor] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [predavacId, setPredavacId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dohvati predavača
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.id) setPredavacId(data.id);
      })
      .catch((err) => console.error("Greška u fetch korisnika:", err))
      .finally(() => setLoading(false));
  }, []);

  // Dohvati pitanja predavača
  const fetchPitanja = async () => {
    if (!predavacId) return;
    try {
      const res = await axios.get<Pitanje[]>(
        `http://localhost:8000/pitanja/sva-pitanja/predavac/${predavacId}`
      );

      const dataWithTime = res.data.map((p) => ({
        ...p,
        created_at: p.created_at || new Date().toISOString(),
        odobravanja_count: p.odobravanja_count ?? 0,
      }));

      setPitanja(dataWithTime);
    } catch (err) {
      console.error("Greška pri učitavanju pitanja:", err);
      setError("Greška pri učitavanju pitanja.");
    }
  };

  useEffect(() => {
    fetchPitanja();
  }, [predavacId]);

  // Sortiranje pitanja
  const sortiranaPitanja = [...pitanja].sort((a, b) => {
    if (sortBy === "odobravanja") {
      return (b.odobravanja_count || 0) - (a.odobravanja_count || 0);
    } else {
      return Date.parse(b.created_at || "") - Date.parse(a.created_at || "");
    }
  });

  // Odgovori na pitanje
  const odgovoriNaPitanje = async (id: number) => {
    if (!odgovor) return;
    try {
      await axios.post(
        `http://localhost:8000/pitanja/odgovori/${id}/${encodeURIComponent(odgovor)}`
      );
      setOdgovor("");
      setSelectedId(null);
      setSuccess("Odgovor poslan.");
      fetchPitanja();
    } catch (err) {
      console.error("Greška pri odgovaranju:", err);
      setError("Greška pri odgovaranju na pitanje.");
    }
  };

  // Sakrij pitanje
  const sakrijPitanje = async (id: number) => {
    try {
      await axios.patch(`http://localhost:8000/pitanja/sakrij/${id}`);
      setSuccess("Pitanje sakriveno.");
      fetchPitanja();
    } catch (err) {
      console.error("Greška pri skrivanju:", err);
      setError("Greška pri skrivanju pitanja.");
    }
  };

  if (loading) return <p>Učitavanje pitanja...</p>;
  if (!predavacId) return <p>Nemate pristup pitanjima</p>;

  return (
    <Box sx={{ flex: 1, width: "100%", mt: 4 }}>
      <Stack spacing={4} sx={{ maxWidth: "800px", mx: "auto", px: 3, py: 2 }}>
        <Card
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            p: 3,
          }}
        >
          <Typography level="h4" sx={{ fontWeight: 600, color: "#4a148c", mb: 1 }}>
            Sva pitanja
          </Typography>
          <Typography level="body-md" sx={{ color: "text.secondary", mb: 2 }}>
            Pregledajte pitanja publike i odgovarajte ili ih sakrijte.
          </Typography>

          {/* Sortiranje pitanja */}
          <Stack direction="row" spacing={2} mb={2}>
            <Typography sx={{ color: "#1a237e" }}>Sortiraj po:</Typography>
            <Select
              value={sortBy}
              onChange={(_, value) =>
                value && setSortBy(value as "vreme" | "odobravanja")
              }
            >
              <Option value="vreme">Vremenu</Option>
              <Option value="odobravanja">Broju odobravanja</Option>
            </Select>
          </Stack>

          {/* Lista pitanja */}
          {sortiranaPitanja.map((p) => (
            <Box
              key={p.id}
              p={2}
              mb={2}
              sx={{ border: "1px solid #eee", borderRadius: 2, boxShadow: "sm" }}
            >
              <Typography variant="body1" sx={{ color: "#1a237e" }}>
                <strong>Pitanje:</strong> {p.sadrzaj}
              </Typography>
              <Typography variant="body2" sx={{ color: "#1a237e" }}>
                <strong>Status:</strong> {p.status} | <strong>Odobravanja:</strong>{" "}
                {p.odobravanja_count}
              </Typography>
              {p.odgovor && (
                <Typography variant="body2" sx={{ color: "#1a237e" }}>
                  <strong>Odgovor:</strong> {p.odgovor}
                </Typography>
              )}

              {selectedId === p.id ? (
                <Stack direction="row" spacing={1} mt={1}>
                  <Textarea
                    value={odgovor}
                    onChange={(e) => setOdgovor(e.target.value)}
                    placeholder="Upiši odgovor"
                    size="sm"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    onClick={() => odgovoriNaPitanje(p.id)}
                    sx={{
                      backgroundColor: "#9c27b0",
                      "&:hover": { backgroundColor: "#7b1fa2" },
                      color: "#fff",
                    }}
                  >
                    Pošalji
                  </Button>
                  <Button
                    variant="outlined"
                    color="neutral"
                    onClick={() => setSelectedId(null)}
                  >
                    Otkaži
                  </Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="sm" onClick={() => setSelectedId(p.id)}>
                    Odgovori
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="soft"
                    onClick={() => sakrijPitanje(p.id)}
                  >
                    Sakrij
                  </Button>
                </Stack>
              )}
            </Box>
          ))}
        </Card>
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert color="danger" variant="soft">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert color="success" variant="soft">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

