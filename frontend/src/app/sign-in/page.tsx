"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; 
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Snackbar,
  Alert as MuiAlert,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

interface LoginForm {
  email: string;
  password: string;
}

interface JwtPayload {
  role: string;
  // po potrebi dodaj ostale atribute iz JWT payloada
}

export default function SignIn() {
  const router = useRouter();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("mui-mode") as "light" | "dark" | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    document.body.dataset.theme = mode;
    localStorage.setItem("mui-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarMessage("Greška: " + (errorData.detail || "Pokušajte ponovo."));
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);

      const decoded = jwtDecode<JwtPayload>(data.access_token);
      const userRole = decoded.role;
      localStorage.setItem("user_role", userRole);

      setSnackbarMessage("Uspješna prijava!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        if (userRole === "predavac") {
          router.push("/predavac");
        } else if (userRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 1500);
    } catch (error) {
      setSnackbarMessage("Došlo je do greške.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error(error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: mode === "light" ? "#f5f5f5" : "#121212",
        color: mode === "light" ? "text.primary" : "grey.300",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "50vw" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          bgcolor: mode === "light" ? "white" : "#1e1e1e",
          boxShadow: 3,
          zIndex: 1,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              SLIDO
            </Typography>
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle light/dark mode">
              {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
            </IconButton>
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Prijava
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoComplete="email"
              variant="outlined"
            />
            <TextField
              label="Lozinka"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoComplete="current-password"
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, py: 1.5, borderRadius: 1 }}
            >
              Prijavi se
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Nemate nalog?{" "}
            <Link href="/register" underline="hover" color="primary">
              Registrujte se ovdje
            </Link>
          </Typography>
        </Box>
      </Box>

      {isMdUp && (
        <Box
          sx={{
            flex: 1,
            backgroundImage:
              mode === "light"
                ? 'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)'
                : 'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)',
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.4s ease",
          }}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
