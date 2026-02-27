import { Router } from "express";

import { getUserData, addUser, updateUser, authUser, deleteUser, getUsers } from "../controller/user.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", authUser);

router.get("/me", authenticate, getUserData);

router.get("/home", authenticate, getUsers);

router.post("/register", authenticate, authorizeAdmin, addUser);

router.put("/update/:id", authenticate, updateUser);

router.delete("/delete/:id", authenticate, deleteUser);

export default router;
