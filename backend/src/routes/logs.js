import { Router } from "express";

import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { getAllLogs } from "../controller/log.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/", getAllLogs);

export default router;
