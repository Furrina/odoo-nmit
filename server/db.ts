import dotenv from 'dotenv';
process.env.DATABASE_URL = "sqlserver://REY_SH:1433;database=ecofinds;user=sa;password=Rey1234;encrypt=false;trustServerCertificate=true";

dotenv.config(); 

import { PrismaClient } from '@prisma/client';


if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const prisma = new PrismaClient();