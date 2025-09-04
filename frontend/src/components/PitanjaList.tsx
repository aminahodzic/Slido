"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";

interface Pitanje {
  id: number;
  sadrzaj: string;
  broj_odobravanja: number;
  odgovor?: string | null;
}

interface PitanjaListProps {
  predavanjeId: number;
  predavacId: number;
}

const PitanjaList: React.FC<PitanjaListProps> = ({ predavanjeId, predavacId }) => {
  const [pitanja, setPitanja] = useState<Pitanje[]>([]);

  const fetchPitanja = async () => {
    try {
      console.log("Fetching pitanja i odgovore...");

      const [pitanjaRes, odgovoriRes] = await Promise.all([
        fetch(`/pitanja/public/${predavanjeId}`),
        fetch(`/pitanja/odgovori/predavac/${predavacId}`),
      ]);

      if (!pitanjaRes.ok || !odgovoriRes.ok) {
        throw new Error("Greška pri dohvatanju pitanja ili odgovora");
      }

      const pitanjaData: Pitanje[] = await pitanjaRes.json();
      const odgovoriData: Pitanje[] = await odgovoriRes.json();

      // Kombinujemo odgovore sa pitanjima po ID-u
      const pitanjaSaOdgovorima = pitanjaData.map((p) => {
        const odg = odgovoriData.find((o) => o.id === p.id);
        return { ...p, odgovor: odg?.odgovor ?? null };
      });

      console.log("Pitanja sa odgovorima:", pitanjaSaOdgovorima);
      setPitanja(pitanjaSaOdgovorima);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (id: number) => {
    try {
      const res = await fetch(`/pitanje/${id}/lajk`, { method: "POST" });
      if (res.ok) fetchPitanja();
      else console.error("Greška pri lajkovanju:", res.status);
    } catch (err) {
      console.error("Greška pri lajkovanju:", err);
    }
  };

  useEffect(() => {
    fetchPitanja();
    const interval = setInterval(fetchPitanja, 5000);
    return () => clearInterval(interval);
  }, [predavanjeId, predavacId]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pitanja za predavanje:
      </Typography>

      {pitanja.length > 0 ? (
        pitanja.map((p) => (
          <Box
            key={p.id}
            sx={{
              p: 2,
              border: "1px solid #ddd",
              borderRadius: 2,
              mb: 2,
              backgroundColor: p.odgovor ? "#f0fff0" : "white",
            }}
          >
            <Typography variant="body1">{p.sadrzaj}</Typography>

            <Typography
              variant="body2"
              color={p.odgovor ? "green" : "textSecondary"}
              sx={{ mt: 1, fontStyle: p.odgovor ? "italic" : "normal" }}
            >
              Odgovor: {p.odgovor ?? "Nema odgovora još"}
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Broj lajkova: {p.broj_odobravanja}
            </Typography>

            <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => handleLike(p.id)}>
              Like
            </Button>
          </Box>
        ))
      ) : (
        <Typography variant="body1">Nema pitanja za ovo predavanje.</Typography>
      )}
    </Box>
  );
};

export default PitanjaList;


