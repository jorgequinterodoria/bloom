import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email.includes("@") || email.length > 255) {
    return NextResponse.json(
      { error: "Correo inválido." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  if (existing) {
    return NextResponse.json(
      { error: "Ese correo ya está registrado." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await db.insert(users).values({ email, passwordHash });
  } catch (err) {
    // 23505 = unique_violation (carrera de registros duplicados)
    if ((err as { code?: string })?.code === "23505") {
      return NextResponse.json(
        { error: "Ese correo ya está registrado." },
        { status: 409 },
      );
    }
    throw err;
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
