import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginUser } from "@/app/lib/firebase"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        try {
          const userData = await loginUser(credentials.email, credentials.password)

          if (userData) {
            return {
              id: userData.uid || userData.id,
              email: userData.email,
              name: userData.name,
              type: userData.userType,
            }
          }

          throw new Error("Invalid credentials")
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed")
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.type = user.type
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.type = token.type as "agency" | "client"
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

