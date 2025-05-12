import {getAllSellers} from "../controllers/sellerController";
import { Router } from "express";

const router = Router()

router.get("/", getAllSellers)

export default router