import { Router } from "express"
import isAuthenticated from "../middleware/isAuthenticated"
import { getIfInSavedSearch, getSavedSearch, postSavedSearch, postSavedSearchToggle } from "../controllers/savedSearchController"

const router = Router()

router.get("/", isAuthenticated, getSavedSearch)
router.get("/insavedsearch", getIfInSavedSearch)

router.post("/", isAuthenticated, postSavedSearch);
router.post("/toggle", isAuthenticated, postSavedSearchToggle)

//router.delete("/", deleteUser)

export default router