import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata = {
  title: "Ticktock — Timesheet Manager",
  description: "Track your weekly hours and project time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* next/font doesn't play nice with a custom .babelrc, so loading Inter the old-fashioned way */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
