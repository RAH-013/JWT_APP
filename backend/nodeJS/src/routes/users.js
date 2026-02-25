import { Router } from "express";

import { getUserData, addUser, updateUser, authUser } from "../controller/user.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

//Prueba
router.get("/", (req, res) => {
    res.send("Hola")
})

// Todos
router.get("/home", authenticate, getUserData);

// Crear
router.post("/register", authenticate, addUser);

// Editar
router.put("/", authenticate, updateUser);

// Todos
router.post("/login", authUser);

export default router;