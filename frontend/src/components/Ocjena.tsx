"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, Box, Rating } from "@mui/material";

type OcjenaProps = {
  predavanjeId: string;
  nazivPredavanja?: string;
};

export default function Ocjena({ predavanjeId, nazivPredavanja = "Predavanje" }: OcjenaProps) {
  const [value, setValue] = useState<number | null>(0);
  const [suma, setSuma] = useState<number>(0);
  const [broj, setBroj] = useState<number>(0);
  const [glasano, setGlasano] = useState(false);
  const [preostalo, setPreostalo] = useState<string | null>(null);

  useEffect(() => {
    const data = localStorage.getItem(`predavanje_${predavanjeId}`);
    if (data) {
      const parsed = JSON.parse(data);

      const now = Date.now();
      if (parsed.timestamp) {
        const diff = now - parsed.timestamp;
        const ms24h = 24 * 60 * 60 * 1000;

        if (diff > ms24h) {
          // prošlo više od 24h → resetujemo
          setGlasano(false);
          setPreostalo(null);
          localStorage.setItem(
            `predavanje_${predavanjeId}`,
            JSON.stringify({ suma: parsed.suma, broj: parsed.broj, glasano: false })
          );
        } else {
          setSuma(parsed.suma);
          setBroj(parsed.broj);
          setGlasano(parsed.glasano);

          // računamo preostalo vrijeme
          const msRemaining = ms24h - diff;
          updatePreostalo(msRemaining);

          // update svakih 60 sekundi
          const interval = setInterval(() => {
            const newRemaining = ms24h - (Date.now() - parsed.timestamp);
            if (newRemaining <= 0) {
              setGlasano(false);
              setPreostalo(null);
              clearInterval(interval);
            } else {
              updatePreostalo(newRemaining);
            }
          }, 60000);

          return () => clearInterval(interval);
        }
      }
    }
  }, [predavanjeId]);

  const updatePreostalo = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    setPreostalo(`${h}h ${m}m`);
  };

<<<<<<< HEAD
  const submitOcjena = async () => {
=======
  const submitOcjena = () => {
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
    if (!value || glasano) return;

    const novaSuma = suma + value;
    const noviBroj = broj + 1;

    setSuma(novaSuma);
    setBroj(noviBroj);
    setGlasano(true);

    const timestamp = Date.now();
    localStorage.setItem(
      `predavanje_${predavanjeId}`,
      JSON.stringify({
        suma: novaSuma,
        broj: noviBroj,
        glasano: true,
        timestamp,
      })
    );

    updatePreostalo(24 * 60 * 60 * 1000); // odmah postavi preostalo na 24h
<<<<<<< HEAD

    // Slanje ocjene backendu
    try {
      const response = await fetch(`http://127.0.0.1:8000/submit/submit-rating/${predavanjeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ocjena: value,
          predavanje_id: predavanjeId,
        }),
      });

      if (!response.ok) {
        throw new Error("Neuspešno slanje ocjene");
      }

      const result = await response.json();
      console.log(result.poruka);  // Ovo će prikazati poruku sa backend-a

    } catch (error) {
      console.error(error);
      alert("Došlo je do greške prilikom slanja ocjene.");
    }
=======
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1
  };

  const prosjek = broj === 0 ? 0 : suma / broj;

  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 3 }}>
      <CardContent>
        <Typography variant="h6">{nazivPredavanja}</Typography>

        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Rating
            name="ocjena"
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          />
          <Button
            onClick={submitOcjena}
            disabled={glasano || !value}
            sx={{ ml: 2 }}
            variant="contained"
          >
            {glasano ? "Već ste glasali" : "Ocijeni"}
          </Button>
        </Box>

        {glasano && preostalo && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Možete ponovo glasati za {preostalo}.
          </Typography>
        )}

        <Typography sx={{ mt: 1 }}>
          Prosjek: {prosjek.toFixed(2)} ({broj} glasova)
        </Typography>
      </CardContent>
    </Card>
  );
}
