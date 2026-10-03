import "dotenv/config";
import "temporal-polyfill/global";
import bcrypt from "bcrypt";
import postgres from "@prisma/orm-postgres/runtime";
import type { Varchar } from "@prisma/orm-postgres/target/codec-types";
import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

const email = process.env["MANAGER_EMAIL"];
const password = process.env["MANAGER_PASSWORD"];

if (!email || !password) {
  console.error("Set MANAGER_EMAIL and MANAGER_PASSWORD in .env first.");
  process.exit(1);
}

const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});

try {
  const existing = await db.orm.public.Users.where({
    email: email as Varchar<150>,
  }).first();

  if (existing && process.env["MANAGER_RESET_PASSWORD"] === "true") {
    if (existing.role !== "MANAGER") {
      console.error(`${email} exists but is ${existing.role}, not MANAGER. Refusing to reset.`);
      process.exit(1);
    }
    await db.orm.public.Users.where({ userId: existing.userId }).update({
      passwordHash: await bcrypt.hash(password, 10),
    });
    console.log(`Password reset for manager ${email}. Remove MANAGER_RESET_PASSWORD from .env.`);
  } else if (existing) {
    console.log(`${email} already exists (role ${existing.role}). Nothing to do.`);
  } else {
    await db.orm.public.Users.create({
      email: email as Varchar<150>,
      passwordHash: await bcrypt.hash(password, 10),
      role: "MANAGER" as Varchar<20>,
    });
    console.log(`Manager ${email} created.`);
  }
} finally {
  await db.close();
}