import { Router } from "express";

import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { getAllLogs, getInfoLog, getRangeLogs } from "../controller/log.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/", getAllLogs);

router.get("/:id", getInfoLog);

router.get("/range", getRangeLogs);

export default router;
