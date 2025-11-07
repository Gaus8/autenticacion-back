import express from "express";
import { authAdmin,db } from "./connection.js"; // Admin SDK de Firebase

export const routerLogin = express.Router();

// Verificar usuario existente
routerLogin.post("/verificar-usuario", async (req, res) => {
  try {
    // Obtener token de la cabecera
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ message: "Token requerido" });

    // Verificar token con Firebase Admin SDK
    const decoded = await authAdmin.verifyIdToken(token);

    const adminDoc = await db.collection("admins").doc(decoded.uid).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ message: "Usuario no autorizado" });
    }
  
    res.status(200).json({ message: "Usuario verificado"});
  } catch (err) {
    res.status(401).json({ message: "Token inválido" }, err);
  }
});

