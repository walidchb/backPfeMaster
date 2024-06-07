const express = require("express");
const router = express.Router();
const User = require("../models/user");
const admin = require("firebase-admin");
const mongoose = require("mongoose");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/", authenticate, (req, res) => {
  res.json({ message: "Welcome to my users routes!" });
});

// Get current user (`/me`)
router.get("/me", async (req, res) => {
  // const { email } = req.body; // Expect an array of attribute-value pairs
  console.log(req.query);
  try {
    const { email } = req.query;
    console.log(email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const currentUser = await User.findOne({ email })
      .populate("organizations") // Populate sendby field with name and email
      .populate("team"); // Replace 'req.user.id' with your Firebase user ID extraction logic
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(currentUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
});

// Get users based on dynamic attribute
router.get("/users", async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  // if (Object.keys(filters).length === 0) {
  //   return res.status(400).json({ message: "Missing filters in query" });
  // }

  const filterObject = {};
  for (const key in filters) {
    filterObject[key] = filters[key];
  }

  try {
    const users = await User.find(
      Object.keys(filters).length === 0 ? {} : filterObject
    );

    res.json(users);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
});

//check-user-exists
router.post("/check-user-exists", async (req, res) => {
  const { email, phoneNumber } = req.body;

  // Input validation (optional)
  if (!email && !phoneNumber) {
    return res.status(400).json({ message: "Missing email or phone number" });
  }

  try {
    // Efficiently combine email and phone number checks using $or and $not operators
    let user = await User.findOne({ email });

    // user =

    console.log(user);
    if (!user) {
      user = await User.findOne({ phoneNumber });
    }

    if (user) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking user existence:", error); // Log specific error details
    res.status(500).json({ message: "Internal server error" }); // Generic error message for user
  }
});

// add user

router.post("/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // Created
  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      // Extract specific validation errors (e.g., required fields)
      const formattedErrors = Object.values(err.errors).map((error) => ({
        message: error.message,
        field: error.path,
      }));
      return res.status(400).json({ errors: formattedErrors });
    } else if (err.name === "CastError") {
      // Handle casting errors (e.g., invalid data types)
      return res.status(400).json({ error: "Invalid data format." });
    } else if (err.name === "MongoServerError" && err.code === 11000) {
      // Handle unique constraint violation (already handled)
      return res
        .status(409)
        .json({ error: "A user with this information already exists." });
    } else {
      // Handle other Mongoose errors
      return res
        .status(500)
        .json({ error: "An error occurred during user creation." });
    }
  }
});

// update user
router.patch("/users", async (req, res) => {
  const { id } = req.query;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "nom",
    "prenom",
    "phoneNumber",
    "gender",
    "role",
    "email",
    "businessName",
    "country",
    "province",
    "street",
  ]; // Allowed fields for update
  const arrayUpdates = ["team", "organizations"];
  const isValidUpdate = updates.every(
    (update) => allowedUpdates.includes(update) || arrayUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    // Separate regular updates and array updates
    const regularUpdates = {};
    const arrayUpdatesData = {};

    updates.forEach((update) => {
      if (arrayUpdates.includes(update)) {
        arrayUpdatesData[update] = req.body[update];
      } else {
        regularUpdates[update] = req.body[update];
      }
    });

    // Update regular fields
    const user = await User.findByIdAndUpdate(id, regularUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push new values to array fields
    for (let key in arrayUpdatesData) {
      if (arrayUpdatesData.hasOwnProperty(key)) {
        user[key].push(arrayUpdatesData[key]);
      }
    }

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete user by id
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
});

// delete user by email

router.delete("/users", async (req, res) => {
  const { email } = req.query;
  console.log("email");

  console.log(email);
  try {
    const deletedUser = await User.findOneAndDelete({ email: email });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err }); // Internal server error
  }
});

module.exports = router;
