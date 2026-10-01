//This is the actual Prisma database client.
import "dotenv/config";
import "temporal-polyfill/global";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../prisma/contract.d.ts";
import contractJson from "../../prisma/contract.json" with { type: "json" };

export const db = postgres<Contract>({
  contractJson,
  url: process.env["DATABASE_URL"]!,
});