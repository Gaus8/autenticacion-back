import  express from 'express'  
import cors from 'cors'

import {routerRegistro} from './registrarUsuario.js';
import { routerLogin } from './verificarUsuario.js';

const app = express();

app.use(express.json());
app.use(cors({
  origin:"http://localhost:5173",
  methods:['POST','GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

const PORT = process.env.PORT || 5000

app.get('/', (req, res) =>{
  res.send("El servidor está funcionando")
})

//Endpoint para el registro
app.use("/api",routerRegistro);
//Endpoint verificar usuario
app.use('/api', routerLogin)

app.listen(PORT, ( ) =>{
  console.log(`server listening on http://localhost:${PORT}`)
})