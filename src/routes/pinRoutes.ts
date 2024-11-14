import { Router } from "express";
import { getAllPins } from "../controllers/pinController";


const router = Router()

router.get('/', getAllPins)

export default router