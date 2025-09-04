"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, Input, Stack } from "@mui/joy";
import EmailForm from "@/components/EmailForm";
import Ocjena from "@/components/Ocjena";

interface Pitanje {
  id: number;
  sadrzaj: string;
  odobravanja_count: number;
  created_at?: string;
  odgovor?: string | null;
}

export default function Homepage() {
  const [emailUnesen, setEmailUnesen] = useState(false);
  const [eventCode, setEventCode] = useState("");
  const [predavanje, setPredavanje] = useState<any | null>(null);
  const [pitanja, setPitanja] = useState<Pitanje[]>([]);
  const [novoPitanje, setNovoPitanje] = useState("");
  const [filter, setFilter] = useState<"sva" | "odgovoreno" | "bezOdgovora">("sva");
  const [sort, setSort] = useState<"najnovije" | "najpopularnije">("najnovije");

  // --- Fetch predavanje ---
  const fetchPredavanje = async () => {
    if (!eventCode) return;
    try {
      const res = await fetch(`http://localhost:8000/predavanja/by-code/${eventCode}`);
      if (!res.ok) throw new Error("Predavanje nije pronađeno");
      const data = await res.json();
      setPredavanje({ ...data, predavacId: data.predavac_id });
      console.log("Predavanje učitano:", data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch pitanja ---
  const fetchPitanja = async () => {
    if (!predavanje?.id || !predavanje?.predavacId) return;
    try {
      const [pitanjaRes, odgovoriRes] = await Promise.all([
        fetch(`http://localhost:8000/pitanja/public/${predavanje.id}`),
        fetch(`http://localhost:8000/pitanja/odgovori/predavac/${predavanje.predavacId}`),
      ]);

      if (!pitanjaRes.ok || !odgovoriRes.ok) throw new Error("Greška pri dohvatanju pitanja ili odgovora");

      const pitanjaData: Pitanje[] = await pitanjaRes.json();
      const odgovoriData: Pitanje[] = await odgovoriRes.json();

      const pitanjaSaOdgovorima = pitanjaData.map((p) => {
        const odg = odgovoriData.find((o) => o.id === p.id);
        return { ...p, odgovor: odg?.odgovor ?? null };
      });

      setPitanja(pitanjaSaOdgovorima);
    } catch (err) {
      console.error(err);
    }
  };

  const likePitanje = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/pitanja/pitanje/${id}/lajk`, { method: "POST" });
      if (!res.ok) throw new Error("Neuspešan zahtev");
      fetchPitanja();
    } catch (err) {
      console.error(err);
    }
  };

  const postaviPitanje = async () => {
    if (!novoPitanje.trim() || !predavanje) return;
    try {
      const res = await fetch(`http://localhost:8000/pitanja/${predavanje.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sadrzaj: novoPitanje }),
      });
      if (!res.ok) throw new Error("Neuspešno postavljanje pitanja");
      setNovoPitanje("");
      fetchPitanja();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (predavanje?.id && predavanje?.predavacId) {
      fetchPitanja();
      const interval = setInterval(fetchPitanja, 5000);
      return () => clearInterval(interval);
    }
  }, [predavanje]);

  const getFilteredAndSortedPitanja = () => {
    let filtered = [...pitanja];
    if (filter === "odgovoreno") filtered = filtered.filter((p) => p.odgovor);
    if (filter === "bezOdgovora") filtered = filtered.filter((p) => !p.odgovor);

    if (sort === "najpopularnije") {
      filtered.sort((a, b) => b.odobravanja_count - a.odobravanja_count);
    } else if (sort === "najnovije") {
      filtered.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }

    return filtered;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-500"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Naslov aplikacije */}
      <Typography level="h2" className="text-center text-white mb-6">
        Dobro došli u aplikaciju SLIDO
      </Typography>

      {!emailUnesen ? (
        <Box className="bg-white p-6 rounded-2xl shadow-xl">
          <Typography level="h4" className="text-center mb-4">
            Unesite svoj email
          </Typography>
          <EmailForm onSuccess={() => setEmailUnesen(true)} />
        </Box>
      ) : !predavanje ? (
        <Box className="bg-white p-6 rounded-2xl shadow-xl">
          <Typography level="h4" className="text-center mb-4">
            Unesite kod predavanja
          </Typography>
          <Input
            placeholder="Kod predavanja..."
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value)}
            className="mb-4"
          />
          <Button fullWidth onClick={fetchPredavanje}>
            Potvrdi
          </Button>
        </Box>
      ) : (
        <Box className="w-full max-w-2xl p-6 bg-white/90 rounded-2xl shadow-xl flex flex-col gap-6">
          <Typography level="h3" className="text-center">
            Predavanje: {predavanje.naziv}
          </Typography>

          {/* --- Ocjena komponenta --- */}
          <Ocjena predavanjeId={predavanje.id.toString()} nazivPredavanja={predavanje.naziv} />

          {/* Filter i sortiranje pitanja */}
          <Box className="flex gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="sva">Sva pitanja</option>
              <option value="odgovoreno">S odgovorom</option>
              <option value="bezOdgovora">Bez odgovora</option>
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="najnovije">Najnovije</option>
              <option value="najpopularnije">Najpopularnije</option>
            </select>
          </Box>

          {/* Lista pitanja */}
          {getFilteredAndSortedPitanja().length === 0 ? (
            <Typography className="text-center text-gray-700">Nema postavljenih pitanja.</Typography>
          ) : (
            <ul className="space-y-4">
              {getFilteredAndSortedPitanja().map((p) => (
                <li key={p.id} className="p-4 bg-white rounded-xl shadow-md flex flex-col gap-2">
                  <span>{p.sadrzaj}</span>
                  <span className={`text-sm ${p.odgovor ? "text-green-600 italic" : "text-gray-500"}`}>
                    Odgovor: {p.odgovor ?? "Nema odgovora još"}
                  </span>
                  <div className="flex justify-between items-center">
                    <span>👍 {p.odobravanja_count}</span>
                    <Button size="sm" onClick={() => likePitanje(p.id)}>
                      Like
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Unos novog pitanja */}
          <Box className="flex gap-2 mt-4">
            <Input
              placeholder="Postavite novo pitanje..."
              value={novoPitanje}
              onChange={(e) => setNovoPitanje(e.target.value)}
              fullWidth
            />
            <Button onClick={postaviPitanje}>Postavi</Button>
          </Box>
        </Box>
      )}

      {/* Donja sekcija sa Sign In i Register */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 6, mb: 6 }}>
        <Button
          variant="solid"
          color="primary"
          onClick={() => (window.location.href = "/sign-in")}
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => (window.location.href = "/register")}
        >
          Register
        </Button>
      </Stack>
    </div>
  );
}
