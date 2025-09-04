// src/app/predavanje/[id]/sharecode/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, Typography } from "@mui/joy";

const ShareCodePage = () => {
  const { id } = useParams(); // Uzimamo id iz URL-a
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    // Poziv API-ja za preuzimanje podataka o predavanju
    const fetchPredavanje = async () => {
      try {
        const response = await fetch(`http://localhost:8000/predavanja/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCode(data.kod); // Postavljanje koda predavanja
        } else {
          alert("Greška pri učitavanju predavanja");
        }
      } catch (error) {
        console.error("Greška pri povezivanju sa serverom:", error);
        alert("Greška pri povezivanju sa serverom");
      }
    };
    fetchPredavanje();
  }, [id]);

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Kod za pristup predavanju
      </Typography>

      {/* Ako je kod dostupan, prikazujemo ga */}
      {code ? (
        <Typography variant="h5" sx={{ textAlign: "center" }}>
          Kod za pristup predavanju: <strong>{code}</strong>
        </Typography>
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Učitavanje koda...
        </Typography>
      )}
    </Box>
  );
};

export default ShareCodePage;
