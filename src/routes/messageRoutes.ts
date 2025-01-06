import { Router } from "express";
import { getAllMessages, getMessage, getMessages, postMessage } from "../controllers/messageController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()

// Utility for dev, unsafe to run in prod
//router.get("/all", getAllMessages)

//router.get("/latest/:id", isAuthenticated, getLatestMessage)
router.get("/:id", isAuthenticated, getMessage)
router.get("/", isAuthenticated, getMessages)

router.post("/", isAuthenticated, postMessage)
//router.post("/first", isAuthenticated, postFirstMessage)

export default router