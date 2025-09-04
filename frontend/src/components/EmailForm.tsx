"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Snackbar, Alert } from "@mui/material";

interface EmailFormProps {
  onSuccess?: () => void;
}

export default function EmailForm({ onSuccess }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8000/users/registracija_publike?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Greška pri registraciji emaila");
      }

      setSuccess("Publika uspješno registrovana!");
      setEmail("");
      setError("");

      if (onSuccess) onSuccess(); // poziva callback da Homepage zna da je email unesen
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
      <TextField
        label="Unesite email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        fullWidth
      />
      <Button type="submit" variant="contained">
        Registruj se
      </Button>

      {error && (
        <Snackbar open autoHideDuration={4000} onClose={() => setError("")}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open autoHideDuration={4000} onClose={() => setSuccess("")}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      )}
    </Box>
  );
}
