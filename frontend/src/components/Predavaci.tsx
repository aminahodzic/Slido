"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Typography,
  Snackbar,
} from "@mui/joy";
import MuiAlert from "@mui/material/Alert";

const AddLecturer = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nazivIme, setNazivIme] = useState("");
  const [adresa, setAdresa] = useState("");
  const [broj, setBroj] = useState("");
  const [spol, setSpol] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLecturerAdd = async () => {
    const newLecturer = {
      username,
      email,
      password,
      naziv_ime: nazivIme,
      adresa,
      broj,
      spol,
      role: "predavac",
    };

    const token = localStorage.getItem("access_token");
    if (!token || token.trim() === "") {
      setError("Nema tokena za autorizaciju!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/users/dodaj-predavaca", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLecturer),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Dodavanje predavača nije uspjelo: ${errorText}`);
      }

      await res.json();
      setSuccess(true);

      // reset forme
      setUsername("");
      setEmail("");
      setPassword("");
      setNazivIme("");
      setAdresa("");
      setBroj("");
      setSpol("");
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card
          sx={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            p: 3,
          }}
        >
          <Box sx={{ mb: 1 }}>
            <Typography level="h4" sx={{ fontWeight: 600, color: "#4a148c" }}>
              Dodaj Predavača
            </Typography>
            <Typography level="body-md" sx={{ color: "text.secondary" }}>
              Dodajte novog predavača u sistem.
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <FormInput
              label="Korisničko ime"
              value={username}
              setValue={setUsername}
              placeholder="Unesite korisničko ime"
            />
            <FormInput
              label="Email"
              value={email}
              setValue={setEmail}
              placeholder="Unesite email"
              type="email"
            />
            <FormInput
              label="Lozinka"
              value={password}
              setValue={setPassword}
              placeholder="Unesite lozinku"
              type="password"
            />
            <FormInput
              label="Naziv i Ime"
              value={nazivIme}
              setValue={setNazivIme}
              placeholder="Unesite naziv i ime"
            />
            <FormInput
              label="Adresa"
              value={adresa}
              setValue={setAdresa}
              placeholder="Unesite adresu"
            />
            <FormInput
              label="Broj"
              value={broj}
              setValue={setBroj}
              placeholder="Unesite broj"
            />
            <FormInput
              label="Spol"
              value={spol}
              setValue={setSpol}
              placeholder="Unesite spol"
            />

            {error && (
              <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => alert("Operacija prekinuta")}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="solid"
                onClick={handleLecturerAdd}
                disabled={loading}
                sx={{
                  backgroundColor: "#9c27b0",
                  "&:hover": { backgroundColor: "#7b1fa2" },
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                {loading ? "Dodavanje..." : "Dodaj predavača"}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      {/* Snackbar za uspjeh */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{
            minWidth: "300px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Predavač je uspješno dodan!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

const FormInput = ({ label, value, setValue, type = "text", placeholder }: any) => (
  <Stack spacing={1}>
    <FormLabel sx={{ fontWeight: 500, color: "#333" }}>{label}</FormLabel>
    <FormControl>
      <Input
        size="sm"
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        sx={{
          borderRadius: "8px",
          borderColor: "#ccc",
          "&:focus-within": { borderColor: "#9c27b0" },
        }}
      />
    </FormControl>
  </Stack>
);

export default AddLecturer;
