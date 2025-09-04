"use client";

import { useState, useEffect } from "react";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { Snackbar, Alert } from "@mui/material";

type UserType = {
  id: number;
  username: string;
  role: string;
  avatar_url: string | null;
} | null;

type NavbarProps = {
  mode: "light" | "dark";
  toggleMode: () => void;
};

// Helper koji uvijek vraća validan URL
const getValidAvatarUrl = (avatar_url: string | null | undefined): string => {
  if (!avatar_url || avatar_url.trim() === "") {
    return "https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2";
  }
  if (avatar_url.startsWith("http")) {
    return avatar_url;
  }
  return `http://localhost:8000${avatar_url}`;
};

const Navbar = ({ mode, toggleMode }: NavbarProps) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || token.trim() === "") {
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Neuspješno dohvaćanje korisnika");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.error("Greška u fetch korisnika:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const token = localStorage.getItem("access_token");
      if (!token || token.trim() === "")
        throw new Error("Nema tokena za autorizaciju");

      const res = await fetch(
        `http://localhost:8000/users/${user.id}/upload-avatar`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload nije uspio: ${errorText}`);
      }

      const updatedUser = await res.json();
      setUser(updatedUser);

      setSnackbarMessage("Avatar uspješno uploadan!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Greška prilikom upload-a avatara:", error);

      setSnackbarMessage(
        "Greška prilikom upload-a avatara: " + (error as Error).message
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-between p-4">
      {/* ICONS AND USER INFO */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="flex flex-col items-end text-[#e040fb]">
          <span className="text-sm leading-4 font-medium">{user?.username}</span>
          <span className="text-xs text-[#e040fb] text-right">{user?.role}</span>
        </div>

        {/* Avatar with upload button */}
        <div className="relative cursor-pointer w-9 h-9 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
          <img
            src={getValidAvatarUrl(user?.avatar_url)}
            alt="avatar"
            className="w-9 h-9 object-cover rounded-full"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Upload avatar"
          />
        </div>

        {/* Light/Dark Mode Toggle */}
        <div
          className="flex items-center cursor-pointer text-[#e040fb] hover:opacity-80 transition-opacity"
          onClick={toggleMode}
        >
          {mode === "light" ? (
            <DarkModeRoundedIcon fontSize="small" />
          ) : (
            <LightModeRoundedIcon fontSize="small" />
          )}
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Navbar;
