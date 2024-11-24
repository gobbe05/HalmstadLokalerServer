import { Router } from "express";
import { getAllMessages, getLatestMessage, getMessages, postFirstMessage, postMessage } from "../controllers/messageController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()

// TEMP
router.get("/all", getAllMessages)
router.get("/latest/:id", isAuthenticated, getLatestMessage)
router.get("/:id", isAuthenticated, getMessages)

router.post("/", isAuthenticated, postMessage)
router.post("/first", isAuthenticated, postFirstMessage)

export default router