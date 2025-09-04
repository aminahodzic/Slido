"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, Typography, Divider, Button } from "@mui/joy";
import Link from 'next/link';

const PredavanjePage = () => {
  const { id } = useParams();
  const [predavanje, setPredavanje] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');  // State za čuvanje URL-a covera

  useEffect(() => {
    console.log("Fetching predavanje for ID:", id); // Log za proveru ID-a
    const fetchPredavanje = async () => {
      try {
        const response = await fetch(`http://localhost:8000/predavanja/${id}`);
        console.log("Response status:", response.status); // Log za status odgovora
        if (response.ok) {
          const data = await response.json();
          console.log("Predavanje data:", data); // Log za podatke koji dolaze sa servera
          setPredavanje(data);
          setCoverUrl(data.cover_url);  // Postavi URL covera
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

  // Ako predavanje nije učitano, prikaži loading tekst
  if (!predavanje) {
    return <Typography>Učitavanje...</Typography>;
  }

  // Ako coverUrl nije definiran, postavi fallback URL za pozadinu
  const backgroundImageUrl = coverUrl ? `http://localhost:8000${coverUrl}` : '/path/to/placeholder-image.jpg';

  // Generiši link za pristup predavanju
  const linkZaPristup = `http://localhost:3000/predavanje/${id}`;
  console.log("Link za pristup predavanju:", linkZaPristup); // Log za link

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImageUrl})`,  // Ažuriraj background image
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        height: "100vh",
        color: "#fff",
      }}
    >
      <Typography variant="h4">{predavanje.naziv}</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body1">Vrijeme početka: {predavanje.vrijeme_start}</Typography>
      <Typography variant="body1">Ponavljanje: {predavanje.ponavljanje}</Typography>

      {/* Link za pristup predavanju */}
      <Typography variant="body2" sx={{ mt: 2 }}>
        Link za pristup predavanju: <a href={linkZaPristup} target="_blank" rel="noopener noreferrer">{linkZaPristup}</a>
      </Typography>

      {/* Link za dijeljenje koda */}
      <Typography variant="body2" sx={{ mt: 2 }}>
        <Link href={`/predavanje/${id}/sharecode`} passHref>
          <Button variant="contained" sx={{ mt: 2 }}>
            Podijeli kod predavanja
          </Button>
        </Link>
      </Typography>
    </Box>
  );
};


export default PredavanjePage;
