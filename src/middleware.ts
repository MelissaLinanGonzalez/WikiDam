import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  // Aquí decimos: "Protege SOLO lo que esté dentro de /dashboard"
  // Todo lo demás (incluida la carpeta /uploads) será público.
  matcher: ["/dashboard/:path*"],
};