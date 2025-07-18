import { Router } from "express";
import { deleteUser, getAllUsers, getAuth, getLogout, getMe, getToAccept, getUser, getUsername, postLogin, postRegister, putAcceptUser, putUser, putChangePassword} from "../controllers/authController";
import isAuthenticated from "../middleware/isAuthenticated";
import { IUser } from "../models/userModel";
import adminProtection from "../middleware/adminProtection";

const router = Router()

router.get("/", isAuthenticated, getAuth)
router.get("/me", isAuthenticated, getMe)
router.get("/user", getAllUsers)
router.get("/toaccept", isAuthenticated, adminProtection, getToAccept)
router.get("/user/:search", getUser)
router.get("/username/:id", getUsername)
router.get("/logout", isAuthenticated, getLogout)
router.get("/isadmin", isAuthenticated, (req, res) => res.json({isAdmin: (req.user as IUser).admin || false}))

router.post("/login", postLogin);
router.post("/register", postRegister)

router.put("/user/:id", isAuthenticated, putUser)
router.put("/changepassword", isAuthenticated, putChangePassword)
router.put("/accept/:id", isAuthenticated, adminProtection, putAcceptUser)

router.delete("/user/:id", deleteUser)

export default router