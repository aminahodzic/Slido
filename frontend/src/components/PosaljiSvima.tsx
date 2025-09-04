"use client";

import { useState } from "react";

export default function PosaljiSvima() {
  const [predavanjeId, setPredavanjeId] = useState(1); // default ID predavanja
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const posaljiSvima = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/predavanja/${predavanjeId}/posalji_svima`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Greška pri slanju mejlova");
      }

      const data = await res.json();
      setMessage(data.message);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Došlo je do greške pri slanju mejlova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        ID predavanja: 
        <input
          type="number"
          value={predavanjeId}
          onChange={(e) => setPredavanjeId(Number(e.target.value))}
          style={{ marginLeft: "8px", marginRight: "8px" }}
        />
      </label>
      <button onClick={posaljiSvima} disabled={loading}>
        {loading ? "Šaljem..." : "Pošalji svima"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
