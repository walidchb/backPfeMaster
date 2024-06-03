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
const sendEmailRoute = require("./routes/sendEmailRoute")
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
app.use("/send-email", sendEmailRoute);

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

// const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://walidchebbab2001:Maman123@cluster0.k5q0dbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your connection string

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

module.exports = app;
