import { Router } from "express";
import { prisma } from "../db";

export const patientsRouter = Router();

// GET /api/patients?search=riv  (searches first and last name)
patientsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

  const patients = await prisma.patient.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 25,
  });

  res.json(patients);
});

// POST creating new patients
patientsRouter.post("/", async (req, res) => {
  const { firstName, lastName, dateOfBirth, email, phone } = req.body ?? {};

  const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const first = text(firstName);
  const last = text(lastName);

  if (!first || !last || typeof dateOfBirth !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    return res.status(400).json({ error: "bad_request" });
  }

  const dob = new Date(`${dateOfBirth}T00:00:00.000Z`);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) {
    return res.status(400).json({ error: "invalid_date_of_birth" });
  }

  const patient = await prisma.patient.create({
    data: { firstName: first, lastName: last, dateOfBirth: dob, email: text(email), phone: text(phone) },
  });

  res.status(201).json(patient);
});
