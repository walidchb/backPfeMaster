// src/app.js
const express = require("express");
const app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// Routes
const indexRoutes = require("./routes/index");
const userRoute = require("./routes/userRoute");
const teamRoute = require("./routes/teamRoute");

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
app.use("/walid", indexRoutes);
app.use("/user", userRoute);
app.use("/team", teamRoute);

// Start the server

const port = process.env.PORT || 3000; // Use environment variable or default port

const mongoose = require("mongoose");

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
