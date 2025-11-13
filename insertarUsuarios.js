import { db } from "./connection.js";
import fs from "fs";
// Leer el JSON
const rawData = fs.readFileSync("./datos.json", "utf-8");
const usuarios = JSON.parse(rawData);

// Función para limpiar movTotales
function limpiarMovTotales(mov) {
  return mov
    .filter(item => item !== null)
    .map(item => {
      if (Array.isArray(item)) {
        if (item.length === 2) return { valor: item[0], duracion: item[1] };
        if (item.length === 3) return { valor: item[0], duracion: item[1], tipo: item[2] };
      }
      return { valor: item };
    });
}

function limpiarUsuario(usuario) {
  for (const key in usuario) {
    if (key === "movTotales" && Array.isArray(usuario[key])) {
      usuario[key] = limpiarMovTotales(usuario[key]);
    } else if (usuario[key] && typeof usuario[key] === "object") {
      limpiarUsuario(usuario[key]);
    }
  }
}

// Subida por lotes
async function subirUsuarios(data) {
  const batchSize = 500;
  let batch = db.batch();
  let counter = 0;

  for (const [id, usuario] of Object.entries(data.usuarios)) {
    limpiarUsuario(usuario);

    const docRef = db.collection("usuarios").doc(id);
    batch.set(docRef, usuario);
    counter++;

    if (counter % batchSize === 0) {
      await batch.commit();
      batch = db.batch();
      console.log(`Subidos ${counter} documentos`);
    }
  }

  if (counter % batchSize !== 0) {
    await batch.commit();
    console.log(`Subidos ${counter} documentos (final)`);
  }

  console.log("Todos los usuarios subidos!");
}

subirUsuarios(usuarios).catch(console.error);
