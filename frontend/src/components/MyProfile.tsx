"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import * as React from "react";
import {
  Box,
  Card,
  CardActions,
  Divider,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Stack,
  Button,
  Typography,
} from "@mui/joy";
import EditRounded from '@mui/icons-material/EditRounded';  // Corrected icon import

// Define the UserType interface here
interface UserType {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

const MyProfile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

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
        setUsername(data.username);
        setEmail(data.email);
        setAvatarSrc(data.avatar_url ? `http://localhost:8000${data.avatar_url}` : null);
      })
      .catch((err) => {
        console.error("Greška u fetch korisnika:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const token = localStorage.getItem("access_token");
      if (!token || token.trim() === "") throw new Error("Nema tokena za autorizaciju");

      const res = await fetch(`http://localhost:8000/users/${user.id}/upload-avatar`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload nije uspio: ${errorText}`);
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setAvatarSrc(updatedUser.avatar_url ? `http://localhost:8000${updatedUser.avatar_url}` : null);
      alert("Avatar uspješno uploadan!");
    } catch (error) {
      console.error("Greška prilikom upload-a avatara:", error);
      alert("Greška prilikom upload-a avatara: " + (error as Error).message);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const updatedData = { username, email };

    const token = localStorage.getItem("access_token");
    if (!token || token.trim() === "") throw new Error("Nema tokena za autorizaciju");

    const res = await fetch(`http://localhost:8000/users/${user.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ažuriranje nije uspjelo: ${errorText}`);
    }

    const updatedUser = await res.json();
    setUser(updatedUser);
    setAvatarSrc(updatedUser.avatar_url ? `http://localhost:8000${updatedUser.avatar_url}` : null);
    alert("Podaci uspješno ažurirani!");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Stack spacing={4} sx={{ display: 'flex', maxWidth: '800px', mx: 'auto', px: { xs: 2, md: 6 }, py: { xs: 2, md: 3 } }}>
        <Card sx={{ backgroundColor: '#e0f7fa' }}> {/* Svijetloplava pozadina forme */}
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Moj profil</Typography>
            <Typography level="body-sm">
              Prilagodite kako će vaši podaci o profilu izgledati drugima.
            </Typography>
          </Box>
          <Divider />
          <Stack direction="row" spacing={3} sx={{ display: 'flex', my: 1 }}>
            <Stack direction="column" spacing={1}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt="Avatar"
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                ) : (
                  <div className="bg-gray-300 w-full h-full flex items-center justify-center text-gray-600">
                    Nema slike
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Upload avatar"
                />
              </Box>
              <IconButton
                aria-label="upload new picture"
                size="sm"
                variant="outlined"
                color="neutral"
                sx={{
                  bgcolor: 'background.body',
                  position: 'absolute',
                  zIndex: 2,
                  borderRadius: '50%',
                  left: 100,
                  top: 100,
                  boxShadow: 'sm',
                }}
              >
                <EditRounded />
              </IconButton>
            </Stack>
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              <Stack spacing={1}>
                <FormLabel>Ime</FormLabel>
                <FormControl sx={{ display: 'flex-column', gap: 2 }}>
                  <Input
                    size="sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    size="sm"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button size="sm" variant="outlined" color="neutral" onClick={() => alert("Cancelled")}>
                  Cancel
                </Button>
                <Button size="sm" variant="solid" onClick={handleProfileUpdate}>
                  Save
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
};

export default MyProfile;
