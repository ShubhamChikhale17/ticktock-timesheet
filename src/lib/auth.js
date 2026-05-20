import CredentialsProvider from "next-auth/providers/credentials";

// hardcoded demo users — obviously swap this for a real DB lookup in prod
const DEMO_USERS = [
  { id: "1", name: "Alex Johnson", email: "alex@tentwenty.me", password: "password123" },
  { id: "2", name: "Sam Rivera", email: "sam@tentwenty.me", password: "password123" },
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = DEMO_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) return null;

        // don't return the password to the session
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id;
      return session;
    },
  },
};
