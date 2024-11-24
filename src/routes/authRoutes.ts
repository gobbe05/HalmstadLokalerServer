import { Router } from "express";
import { deleteUser, getAllUsers, getAuth, getLogout, getMe, getUser, getUsername, postLogin, postRegister, putChangePassword} from "../controllers/authController";
import isAuthenticated from "../middleware/isAuthenticated";

const router = Router()

router.get("/", isAuthenticated, getAuth)
router.get("/me", isAuthenticated, getMe)
router.get("/user", getAllUsers)
router.get("/user/:username", getUser)
router.get("/username/:id", getUsername)
router.get("/logout", isAuthenticated, getLogout)

router.post("/login", postLogin);
router.post("/register", postRegister)

router.put("/changepassword", isAuthenticated, putChangePassword)

router.delete("/user/:id", deleteUser)

export default router