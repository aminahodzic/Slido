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
  Select,
  Option,
  Snackbar,
} from "@mui/joy";
import MuiAlert from "@mui/material/Alert";

interface Predavanje {
  naziv: string;
  kod: string;
  vrijeme_start: string;
  ponavljanje: string;
  ponavlja_do?: string;
  status: string;
}

const AddPredavanje = () => {
  const [naziv, setNaziv] = useState("");
  const [kod, setKod] = useState("");
  const [vrijemeStart, setVrijemeStart] = useState("");
  const [ponavljanje, setPonavljanje] = useState("nista");
  const [ponavljaDo, setPonavljaDo] = useState("");
  const [status, setStatus] = useState("aktivno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePredavanjeAdd = async () => {
    if (ponavljanje === "sedmicno" && !ponavljaDo) {
      setError("Polje 'Ponavlja Do' je obavezno kada je odabrano sedmično ponavljanje.");
      return;
    }

    const newPredavanje: Predavanje = {
      naziv,
      kod,
      vrijeme_start: vrijemeStart,
      ponavljanje,
      ponavlja_do: ponavljaDo || undefined,
      status,
    };

    const token = localStorage.getItem("access_token");
    if (!token || token.trim() === "") {
      setError("Token nije pronađen!");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/predavanja", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPredavanje),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Greška pri dodavanju predavanja: ${errorText}`);
      }

      const addedPredavanje = await res.json();
      setSuccess(true);

      // Preusmjeri
      window.location.href = `/predavanje/${addedPredavanje.id}`;

      // Reset forme
      setNaziv("");
      setKod("");
      setVrijemeStart("");
      setPonavljanje("nista");
      setPonavljaDo("");
      setStatus("aktivno");
      setError(null);
    } catch (error) {
      setError((error as Error).message);
      console.error(error);
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
              Dodaj Predavanje
            </Typography>
            <Typography level="body-md" sx={{ color: "text.secondary" }}>
              Dodajte novo predavanje u sistem.
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <FormInput
              label="Naziv Predavanja"
              value={naziv}
              setValue={setNaziv}
              placeholder="Naziv predavanja"
            />
            <FormInput
              label="Kod Predavanja"
              value={kod}
              setValue={setKod}
              placeholder="Kod predavanja"
            />
            <FormInput
              label="Vrijeme Početka"
              value={vrijemeStart}
              setValue={setVrijemeStart}
              type="datetime-local"
              placeholder="Vrijeme početka"
            />

            {/* Select za ponavljanje */}
            <Stack spacing={1}>
              <FormLabel sx={{ fontWeight: 500, color: "#333" }}>Ponavljanje</FormLabel>
              <Select
                value={ponavljanje}
                onChange={(event, value) => setPonavljanje(value || "nista")}
                size="sm"
              >
                <Option value="nista">Ništa</Option>
                <Option value="sedmicno">Sedmično</Option>
              </Select>
            </Stack>

            {ponavljanje === "sedmicno" && (
              <FormInput
                label="Ponavlja Do"
                value={ponavljaDo}
                setValue={setPonavljaDo}
                type="date"
                placeholder="Ponavlja do"
              />
            )}

            <FormInput
              label="Status"
              value={status}
              setValue={setStatus}
              placeholder="Status"
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
                onClick={handlePredavanjeAdd}
                disabled={loading}
                sx={{
                  backgroundColor: "#9c27b0",
                  "&:hover": { backgroundColor: "#7b1fa2" },
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                {loading ? "Dodavanje..." : "Dodaj predavanje"}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      {/* Snackbar */}
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
          Predavanje je uspješno dodano!
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

export default AddPredavanje;
