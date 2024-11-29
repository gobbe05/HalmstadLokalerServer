import { Router } from "express";
import { getAllViews, getOfficeCount } from "../controllers/statisticController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router();

router.get("/views", isAuthenticated, getAllViews)
router.get("/offices", isAuthenticated, getOfficeCount)

export default router