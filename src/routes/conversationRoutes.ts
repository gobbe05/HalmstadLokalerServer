import { Router } from "express";
import { getAllConversations } from "../controllers/conversationController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()

router.get("/", isAuthenticated, getAllConversations)

export default router