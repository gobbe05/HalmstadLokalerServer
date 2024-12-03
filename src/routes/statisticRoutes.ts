import { Router } from "express";
import { getAllViews, getAllVisits, getOfficeCount } from "../controllers/statisticController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

router.get("/views", isAuthenticated, getAllViews)
router.get("/offices", isAuthenticated, getOfficeCount)
router.get("/visits", isAuthenticated, getAllVisits)

export default router