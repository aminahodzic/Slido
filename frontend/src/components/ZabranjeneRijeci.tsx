"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  List,
  ListItem,
  IconButton,
  Snackbar,
  Alert,
  Card,
  Divider,
  Stack,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

type ZabranjenaRijec = { id: number; rijec: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
<<<<<<< HEAD
const RESOURCE = "/zabranjena-rijec"; 
=======
const RESOURCE = "/zabranjena-rijec"; // ✅ backend je na jednini
>>>>>>> 2a45368ea6046c4a66b77bcd2e8bd76ae5f45fb1

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access token") : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch (_) {
    // no body
  }

  if (!res.ok) {
    const msg = data?.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export default function ZabranjeneRijeci() {
  const [rijeci, setRijeci] = useState<ZabranjenaRijec[]>([]);
  const [novaRijec, setNovaRijec] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // učitaj sve riječi
  const load = async () => {
    setLoading(true);
    try {
      const data = await api<ZabranjenaRijec[]>(`${RESOURCE}/`);
      setRijeci(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message ?? "Greška pri učitavanju.");
      setRijeci([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // dodaj novu riječ
  const dodajRijec = async () => {
    const value = novaRijec.trim();
    if (!value) return;
    setSubmitting(true);
    try {
      const created = await api<ZabranjenaRijec>(`${RESOURCE}/`, {
        method: "POST",
        body: JSON.stringify({ rijec: value }),
      });
      setRijeci((prev) => [...prev, created]);
      setNovaRijec("");
      setSuccess("Riječ dodana.");
    } catch (e: any) {
      setError(e.message ?? "Greška pri dodavanju.");
    } finally {
      setSubmitting(false);
    }
  };

  // obriši riječ
  const obrisiRijec = async (id: number) => {
    const backup = [...rijeci];
    setRijeci((prev) => prev.filter((r) => r.id !== id));
    try {
      await api<ZabranjenaRijec>(`${RESOURCE}/${id}`, { method: "DELETE" });
      setSuccess("Riječ obrisana.");
    } catch (e: any) {
      setRijeci(backup); // rollback
      setError(e.message ?? "Greška pri brisanju.");
    }
  };

  return (
    <Box sx={{ flex: 1, width: "100%", mt: 4 }}>
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
              Zabranjene riječi
            </Typography>
            <Typography level="body-md" sx={{ color: "text.secondary" }}>
              Upravljajte listom zabranjenih riječi u sistemu.
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />

          {/* forma za unos nove riječi */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Input
              placeholder="Unesi novu riječ…"
              value={novaRijec}
              onChange={(e) => setNovaRijec(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !submitting && dodajRijec()}
              sx={{
                flex: 1,
                borderRadius: "8px",
                "&:focus-within": { borderColor: "#9c27b0" },
              }}
              disabled={submitting}
            />
            <Button
              startDecorator={<AddIcon />}
              onClick={dodajRijec}
              loading={submitting}
              sx={{
                backgroundColor: "#9c27b0",
                "&:hover": { backgroundColor: "#7b1fa2" },
                color: "#fff",
                fontWeight: 500,
                borderRadius: "8px",
              }}
            >
              Dodaj
            </Button>
          </Stack>

          {/* lista postojećih riječi */}
          {loading ? (
            <Typography>Učitavanje…</Typography>
          ) : rijeci.length === 0 ? (
            <Typography level="body-sm" sx={{ opacity: 0.8 }}>
              Nema zabranjenih riječi još.
            </Typography>
          ) : (
            <List sx={{ borderRadius: "xl", boxShadow: "sm" }}>
              {rijeci.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    py: 1,
                  }}
                >
                  <Typography>{item.rijec}</Typography>
                  <IconButton
                    color="danger"
                    variant="soft"
                    onClick={() => obrisiRijec(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      </Stack>

      {/* snackbar poruke */}
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
