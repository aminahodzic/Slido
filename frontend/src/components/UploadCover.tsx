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
  Alert,
} from "@mui/joy";
import { useRouter } from "next/navigation";

const UploadCover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [predavanjeId, setPredavanjeId] = useState<number | string>('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) {
      setError("Molimo odaberite sliku!");
      return;
    }

    if (!predavanjeId) {
      setError("Molimo unesite ID predavanja!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Niste prijavljeni. Molimo prijavite se.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/predavanja/${predavanjeId}/cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(errorText);
        console.error("Greška prilikom upload-a slike:", errorText);
        throw new Error(errorText);
      }

      const data = await res.json();
      setCoverUrl(data.cover_url);
      setSuccess("Slika uspješno upload-ovana!");
      router.push(`/predavanje/${predavanjeId}?cover=${encodeURIComponent(data.cover_url)}`);
    } catch (err) {
      setError("Greška prilikom upload-a slike.");
      console.error("Greška:", err);
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
              Upload Cover Slike za Predavanje
            </Typography>
            <Typography level="body-md" sx={{ color: "text.secondary" }}>
              Postavite sliku koja će biti pozadina za predavanje.
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Stack spacing={1}>
              <FormLabel sx={{ fontWeight: 500, color: "#333" }}>ID Predavanja</FormLabel>
              <FormControl>
                <Input
                  size="sm"
                  type="number"
                  value={predavanjeId || ""}
                  onChange={(e) => setPredavanjeId(e.target.value)}
                  placeholder="Unesite ID predavanja"
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#ccc",
                    "&:focus-within": { borderColor: "#9c27b0" },
                  }}
                />
              </FormControl>
            </Stack>

            <Stack spacing={1}>
              <FormLabel sx={{ fontWeight: 500, color: "#333" }}>Odaberite sliku</FormLabel>
              <FormControl>
                <Input
                  size="sm"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#ccc",
                    "&:focus-within": { borderColor: "#9c27b0" },
                  }}
                />
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => setError("Operacija prekinuta")}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="solid"
                onClick={handleUpload}
                disabled={loading}
                sx={{
                  backgroundColor: "#9c27b0",
                  "&:hover": { backgroundColor: "#7b1fa2" },
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                {loading ? "Upload in Progress..." : "Upload Cover Sliku"}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      {/* Snackbar za greške */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ minWidth: "300px" }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Snackbar za uspjeh */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          variant="filled"
          sx={{ minWidth: "300px" }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadCover;
