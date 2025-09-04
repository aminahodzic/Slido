"use client";
import { useState } from "react";
import Menu from "@/components/Menu";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  // Toggle the mode between light and dark
  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      className="h-screen flex"
      style={{
        backgroundColor: mode === "light" ? "#f5f5f5" : "#121212", // Change background color
        backgroundImage: mode === "light"
          ? 'url(https://images.unsplash.com/photo-1527181152855-fc03fc7949c8?auto=format&w=1000&dpr=2)' // Light mode background
          : 'url(https://images.unsplash.com/photo-1572072393749-3ca9c8ea0831?auto=format&w=1000&dpr=2)', // Dark mode background
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-color 0.3s ease, background-image 0.3s ease", // Smooth transition
      }}
    >
      {/* LEFT SIDE (Menu) */}
      <div className='w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%]'>
        <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block">SLIDO</span>
        </Link>
        <Menu />
      </div>

      {/* RIGHT SIDE (Navbar and Children Content) */}
      <div className='w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] overflow-scroll'>
        <Navbar mode={mode} toggleMode={toggleMode} />
        {children}
      </div>
    </div>
  );
}
