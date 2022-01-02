import express from "express";

const router = express.Router();

// controllers
import {
  signup,
  signin,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
