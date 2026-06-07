import "./globals.css";
import { cookies } from "next/headers";
import Header from "@/components/Header";

export const metadata = {
  title: "Wartable — WoW Character Showcase",
  description: "View a World of Warcraft character: gear, Mythic+, raids, and achievements.",
};

export default async function RootLayout({ children }) {
  // read saved theme cookie so server render matches (no flash)
  const cookieStore = await cookies();
  const theme = cookieStore.get("wt_theme")?.value === "light" ? "light" : "dark";

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
