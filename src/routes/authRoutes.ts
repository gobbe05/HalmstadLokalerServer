import { Router } from "express";
import { deleteUser, getAllUsers, getAuth, getLogout, getMe, getUser, getUsername, postLogin, postRegister, putChangePassword} from "../controllers/authController";
import isAuthenticated from "../middleware/isAuthenticated";
import { IUser } from "../models/userModel";

const router = Router()

router.get("/", isAuthenticated, getAuth)
router.get("/me", isAuthenticated, getMe)
router.get("/user", getAllUsers)
router.get("/user/:username", getUser)
router.get("/username/:id", getUsername)
router.get("/logout", isAuthenticated, getLogout)
router.get("/isadmin", isAuthenticated, (req, res) => res.json({isAdmin: (req.user as IUser).admin || false}))

router.post("/login", postLogin);
router.post("/register", postRegister)

router.put("/changepassword", isAuthenticated, putChangePassword)

router.delete("/user/:id", deleteUser)

export default router