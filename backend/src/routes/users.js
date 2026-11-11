import { Router } from "express";

import {
  getUserData,
  addUser,
  updateUser,
  authUser,
  deleteUser,
  getUsers,
} from "../controller/user.js";

import { authenticate, authorizeAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/login", authUser);

router.get("/me", authenticate, getUserData);

router.get("/", authenticate, authorizeAdmin, getUsers);

router.get("/:id", authenticate, getUserData);

router.post("/", authenticate, addUser);

router.put("/:id", authenticate, authorizeAdmin, updateUser);

router.delete("/:id", authenticate, authorizeAdmin, deleteUser);

export default router;
