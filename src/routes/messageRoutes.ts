import { Router } from "express";
import { deleteMessage, getMessage, getMessages, getSentMessages, postMessage } from "../controllers/messageController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()

// Utility for dev, unsafe to run in prod
//router.get("/all", getAllMessages)

//router.get("/latest/:id", isAuthenticated, getLatestMessage)
router.get("/", isAuthenticated, getMessages)
router.get("/sent/:id", isAuthenticated, getSentMessages)
router.get("/:id", isAuthenticated, getMessage)

router.post("/", isAuthenticated, postMessage)
//router.post("/first", isAuthenticated, postFirstMessage)

router.delete("/:id", isAuthenticated, deleteMessage)

export default router