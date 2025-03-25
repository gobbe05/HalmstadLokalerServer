import { Router } from "express";
import { deleteArticle, getAllArticles, getArticle, postArticle, putArticle } from "../controllers/articleController";
import isAuthenticated from "../middleware/isAuthenticated";
import adminProtection from "../middleware/adminProtection";

const router = Router()

router.get("/:id", getArticle)
router.get("/", getAllArticles)

router.post("/", isAuthenticated, adminProtection, postArticle)

router.put("/:id", isAuthenticated, adminProtection, putArticle)

router.delete("/:id", isAuthenticated, adminProtection, deleteArticle)

export default router