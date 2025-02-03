import { Router } from "express";
import { addToHistory, getUserHistroy, login, register } from "../controllers/user.controller.js";

const  router = Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activities").post(addToHistory)
router.route("/get_all_activities").post(getUserHistroy)

export default router;