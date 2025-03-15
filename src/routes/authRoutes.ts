import { Router } from "express";
import { deleteUser, getAllUsers, getAuth, getLogout, getMe, getToAccept, getUser, getUsername, postLogin, postRegister, putAcceptUser, putChangePassword} from "../controllers/authController";
import isAuthenticated from "../middleware/isAuthenticated";
import adminProtection from "../middleware/adminProtection";

const router = Router()

router.get("/", isAuthenticated, getAuth)
router.get("/me", isAuthenticated, getMe)
router.get("/user", getAllUsers)
router.get("/toaccept", isAuthenticated, adminProtection, getToAccept)
router.get("/user/:username", getUser)
router.get("/username/:id", getUsername)
router.get("/logout", isAuthenticated, getLogout)

router.post("/login", postLogin);
router.post("/register", postRegister)

router.put("/changepassword", isAuthenticated, putChangePassword)
router.put("/accept/:id", isAuthenticated, adminProtection, putAcceptUser)

router.delete("/user/:id", deleteUser)

export default router