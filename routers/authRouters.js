const express = require("express");
const router = express.Router();
const authController = require('../controllers/authContoller');
const verifyJWT = require("../middelware/verifyJWT");

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/getAllUsers', verifyJWT, authController.getAllUsers);
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);
module.exports = router;
