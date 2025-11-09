import express from "express";
import admin from 'firebase-admin'

import { authAdmin, db } from "./connection.js"; // db = Firestore

export const routerRegistro = express.Router();

routerRegistro.post("/registro-email", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Faltan datos" });

  try {
    // Crear usuario con Admin SDK
    const userRecord = await authAdmin.createUser({ email, password });

    // Guardar datos extra en Firestore
    await db.collection("admins").doc(userRecord.uid).set({
      correo: email,
      creadoEn: new Date(),
      rol: "admin"
    });
    res.status(201).json({ uid: userRecord.uid, ok:true });
  } catch (err) {
    console.error("Error en /registro-email:", err.code, err.message);

    // Retornar error específico al frontend
    switch (err.code) {
      case "auth/invalid-password":
        res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
        break;
      case "auth/email-already-exists":
        res.status(400).json({ message: "El email ya está registrado." });
        break;
      case "auth/invalid-email":
        res.status(400).json({ message: "El email no es válido." });
        break;
      default:
        res.status(500).json({ message: "Error interno del servidor." });
    }
  }
});


routerRegistro.post("/registro-google", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).send({ error: "Token requerido" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    await db.collection("admins").doc(decoded.uid).set({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email.split("@")[0],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Usuario registrado" })
  } catch (error) {
    res.status(401).json({ message: "Token inválido" })
  }
});

