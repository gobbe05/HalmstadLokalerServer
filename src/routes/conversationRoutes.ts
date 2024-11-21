import { Router } from "express";
import { getConversations } from "../controllers/conversationController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()

router.get("/", isAuthenticated, getConversations)

export default router