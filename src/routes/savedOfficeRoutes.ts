import { Router } from "express"
import isAuthenticated from "../middleware/isAuthenticated"
import { deleteSavedOffice, getSavedOffices, getSavedOfficesForUser, postSavedOffice } from "../controllers/savedOfficeController"

const router = Router()

router.get("/all", getSavedOffices)
router.get("/", isAuthenticated, getSavedOfficesForUser)

router.post("/", isAuthenticated, postSavedOffice)

router.delete("/", isAuthenticated, deleteSavedOffice)

export default router