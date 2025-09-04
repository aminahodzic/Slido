"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Select,
  Option,
  Textarea,
  Button,
  Card,
  CardContent,
} from "@mui/joy";

interface Predavanje {
  id: number;
  naziv: string;
}

interface Pitanje {
  id: number;
  sadrzaj: string;
  status: "postavljeno" | "skriveno" | "odgovoreno";
  odobravanja_count: number;
}

export default function SkrivenaPitanjaList() {
  const [predavanja, setPredavanja] = useState<Predavanje[]>([]);
  const [selectedPredavanje, setSelectedPredavanje] = useState<number | "">("");
  const [pitanja, setPitanja] = useState<Pitanje[]>([]);
  const [loading, setLoading] = useState(false);
  const [odgovor, setOdgovor] = useState<{ [key: number]: string }>({});

  const token = localStorage.getItem("access_token");

  // --- Fetch predavanja ---
  useEffect(() => {
    if (!token) return;
    const fetchPredavanja = async () => {
      try {
        const res = await fetch("http://localhost:8000/predavanja", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPredavanja(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Greška kod učitavanja predavanja:", err);
      }
    };
    fetchPredavanja();
  }, [token]);

  // --- Fetch pitanja ---
  useEffect(() => {
    if (!token || selectedPredavanje === "" || selectedPredavanje === null)
      return;

    const fetchPitanja = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/pitanja/skrivena/${selectedPredavanje}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Greška kod učitavanja pitanja");
        const data = await res.json();
        setPitanja(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Greška fetchPitanja:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPitanja();
  }, [selectedPredavanje, token]);

  const handleOtvori = async (id: number) => {
    const res = await fetch(`http://localhost:8000/pitanja/otvori/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPitanja((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleOdgovori = async (id: number) => {
    const res = await fetch(
      `http://localhost:8000/pitanja/odgovori/${id}/${encodeURIComponent(
        odgovor[id]
      )}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      setPitanja((prev) => prev.filter((p) => p.id !== id));
      setOdgovor((prev) => ({ ...prev, [id]: "" }));
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        level="h4"
        sx={{ textAlign: "center", mb: 2, color: "primary.600" }}
      >
        Skrivena pitanja
      </Typography>

      {/* --- Select za predavanje --- */}
      <Select
        placeholder="Odaberi predavanje"
        value={selectedPredavanje}
        onChange={(_, value) => setSelectedPredavanje(Number(value))}
        sx={{ mb: 3, maxWidth: 300, mx: "auto", display: "block" }}
      >
        {predavanja.map((p) => (
          <Option key={p.id} value={p.id}>
            {p.naziv}
          </Option>
        ))}
      </Select>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {pitanja.map((p) => (
            <Card
              key={p.id}
              variant="outlined"
              sx={{ borderRadius: "lg", boxShadow: "sm" }}
            >
              <CardContent>
                <Typography
                  level="body-lg"
                  sx={{ color: "primary.700", fontWeight: "500", mb: 1 }}
                >
                  {p.sadrzaj}
                </Typography>
                <Typography level="body-sm" sx={{ color: "neutral.500", mb: 1 }}>
                  👍 {p.odobravanja_count}
                </Typography>

                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Button
                    size="sm"
                    color="warning"
                    onClick={() => handleOtvori(p.id)}
                  >
                    Otvori pitanje
                  </Button>

                  <Textarea
                    placeholder="Unesi odgovor..."
                    minRows={2}
                    value={odgovor[p.id] || ""}
                    onChange={(e) =>
                      setOdgovor((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    sx={{ width: "100%", maxWidth: 400 }}
                  />

                  <Button
                    size="sm"
                    color="success"
                    onClick={() => handleOdgovori(p.id)}
                    disabled={!odgovor[p.id]}
                  >
                    Odgovori
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
