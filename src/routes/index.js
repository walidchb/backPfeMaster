// src/routes/index.js
const express = require("express");
const router = express.Router();

// Controllers
const { indexController } = require("../controllers/index");

// Routes
router.get("/", indexController);

module.exports = router;
