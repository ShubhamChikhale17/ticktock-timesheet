"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// thin wrapper so we can use SessionProvider inside a server component layout
export default function SessionProvider({ children }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
