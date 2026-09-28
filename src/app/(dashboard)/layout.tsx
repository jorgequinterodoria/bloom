import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// INVARIANTE: el redirect de un layout NO impide que el body del hijo se
// renderice en la respuesta 307. Nunca renderizar datos de usuario en el
// servidor bajo (dashboard) sin su propio `auth()`; todo dato viene de /api/*
// (que exigen requireUserId).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <>{children}</>;
}
