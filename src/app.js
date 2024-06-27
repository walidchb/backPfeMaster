// src/app.js
const express = require("express");
const app = express();
const mongoose = require("mongoose");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// Routes
const indexRoutes = require("./routes/index");
const userRoute = require("./routes/userRoute");
const organizationRoute = require("./routes/organizationRoute");
// <<<<<<< HEAD
const taskRoute = require("./routes/taskRoute");

const projectRoute = require("./routes/projectRoute");
const teamRoute = require("./routes/teamRoute");
const commentRoute = require("./routes/commentRoute");
const notificationRoute = require("./routes/notificationRoute");
const invitationRoute = require("./routes/invitationRoute");
const sendEmailRoute = require("./routes/sendEmailRoute");
const delegationRoute = require("./routes/delegationRoute");
// =======
// >>>>>>> a28265b8e5ac52ec9a9eded7de38aeb729310987

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.json());
// app.use(require("express-inspector"));
// Routes
app.use("/", indexRoutes);
app.use("/user", userRoute);
app.use("/project", projectRoute);
app.use("/organization", organizationRoute);
app.use("/team", teamRoute);
app.use("/task", taskRoute);
app.use("/comment", commentRoute);
app.use("/notification", notificationRoute);
app.use("/invitation", invitationRoute);
app.use("/send-email", sendEmailRoute);
app.use("/delegation", delegationRoute);

// Route statique pour servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, './uploads')));


app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: "ValidationError",
      message: err.message,
    });
  }

  if (err.code && err.code === 11000) {
    return res.status(409).json({
      error: "DuplicateKeyError",
      message: "Duplicate key error: a record with this value already exists.",
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: "CastError",
      message: `Invalid ${err.kind}: ${err.value}`,
    });
  }

  if (err.name === "MongoNetworkError") {
    return res.status(503).json({
      error: "NetworkError",
      message: "Failed to connect to the database. Please try again later.",
    });
  }

  // Default to 500 server error
  res.status(500).json({
    error: "InternalServerError",
    message: "An unexpected error occurred. Please try again later.",
  });
});

const port = process.env.PORT || 1937; // Use environment variable or default port

module.exports = app;
