"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

interface FormaProps {
  onEventCodeSubmit: (eventCode: string, pitanja: any[]) => void;
}

const Forma: React.FC<FormaProps> = ({ onEventCodeSubmit }) => {
  const [eventCode, setEventCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventCode.trim()) return;

    try {
      // Ispravljena ruta prema backendu
      const res = await fetch(`http://localhost:8000/pitanja/predavanje/${eventCode}/pitanja`);

      if (!res.ok) {
        throw new Error("Pitanja nisu pronađena");
      }

      const pitanja = await res.json();
      onEventCodeSubmit(eventCode, pitanja); // sada radi sa dva parametra
      setError("");
    } catch (err) {
      setError("Došlo je do greške. Pokušajte ponovo.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      <TextField
        label="Event Code"
        value={eventCode}
        onChange={(e) => setEventCode(e.target.value)}
        fullWidth
        required
        autoComplete="off"
      />
      <Button type="submit" variant="contained" onClick={handleSubmit}>
        Dohvati Pitanja
      </Button>

      {error && (
        <Snackbar open={true} autoHideDuration={4000} onClose={() => setError("")}>
          <MuiAlert severity="error">{error}</MuiAlert>
        </Snackbar>
      )}
    </Box>
  );
};

export default Forma;

