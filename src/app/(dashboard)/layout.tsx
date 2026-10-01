import { redirect } from "next/navigation";
import { AppNav } from "@/components/navigation/AppNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <><ThemeToggle /><div className="pb-20">{children}</div><AppNav /></>;
}
