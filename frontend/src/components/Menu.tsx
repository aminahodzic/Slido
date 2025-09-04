"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserType = {
  id: number;
  username: string;
  role: string;
  avatar_url: string | null;
} | null;

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Home", href: "/", visible: ["admin", "predavac"] },
      { icon: "/teacher.png", label: "Predavači", href: "/predavac", visible: ["admin", "predavac"] },
      { icon: "/lesson.png", label: "Predavanje", href: "#predavanje", visible: ["admin", "predavac"] },
    ],
  },
  {
    title: "DRUGO",
    items: [
      { icon: "/profile.png", label: "Profil", href: "/admin", visible: ["admin"] },
      { icon: "/logout.png", label: "Logout", href: "#", visible: ["admin", "predavac"] },
    ],
  },
];

const Menu = () => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || token.trim() === "") {
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Neuspješno dohvaćanje korisnika");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => console.error("Greška u fetch korisnika:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/register"); // prebacuje na register
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-2" key={section.title}>
          {/* Naslov sekcije */}
          <span className="hidden lg:block text-[#ab47bc] font-light my-4">{section.title}</span>
          {section.items
            .filter((item) => item.visible.includes(user?.role || ""))
            .map((item) =>
              item.label === "Logout" ? (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-4 py-2 text-[#ab47bc] hover:bg-[#9c27b0] hover:text-white transition-colors rounded-md"
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center gap-4 py-2 text-[#ab47bc] hover:bg-[#9c27b0] hover:text-white transition-colors rounded-md"
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              )
            )}
        </div>
      ))}
    </div>
  );
};

export default Menu;



