import { Router } from "express"
import isAuthenticated from "../middleware/isAuthenticated"
import { deleteSavedOffice, getSavedOffices, getSavedOfficesForUser, getSavedOfficeState, postSavedOffice } from "../controllers/savedOfficeController"

const router = Router()

router.get("/all", getSavedOffices)
router.get("/status/:office", isAuthenticated, getSavedOfficeState)
router.get("/", isAuthenticated, getSavedOfficesForUser)

router.post("/", isAuthenticated, postSavedOffice)

router.delete("/:office", isAuthenticated, deleteSavedOffice)

export default router