// backend/connection.js
import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const authAdmin = admin.auth();
export const db = admin.firestore();
