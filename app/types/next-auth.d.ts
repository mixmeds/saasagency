import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      type: "agency" | "client"
    }
  }

  interface User {
    id: string
    email: string
    name: string
    type: "agency" | "client"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    type: "agency" | "client"
  }
}

