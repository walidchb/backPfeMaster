const express = require("express");
const router = express.Router();
const User = require("../models/user");
const admin = require("firebase-admin");

// Check if the request contains a Firebase ID token
const verifyFirebaseUser = async (req, res, next) => {
  // Check if the request contains a Firebase ID token
  const idToken = req.headers.authorization;

  if (!idToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No ID token provided" });
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach the decoded user ID to the request object
    req.user = {
      id: decodedToken.uid,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If verification fails, return an error response
    return res.status(403).json({ message: "Forbidden: Invalid ID token" });
  }
};

router.get("/", (req, res) => {
  res.json({ message: "Welcome to my users routes!" });
});

// Get current user (`/me`)
router.get("/me", verifyFirebaseUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id); // Replace 'req.user.id' with your Firebase user ID extraction logic
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(currentUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
});

// Get users based on dynamic attribute
router.get("/users", verifyFirebaseUser, async (req, res) => {
  const { attribute, value } = req.query; // Get attribute and value from query parameters

  if (!attribute || !value) {
    return res
      .status(400)
      .json({ message: "Missing attribute or value in query" });
  }

  const filter = { [attribute]: value }; // Build dynamic filter object

  try {
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
});

// add user
router.post("/users", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser); // Created
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad request (validation errors)
  }
});

// update user
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID format (optional, using Mongoose built-in validation)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const updates = Object.keys(req.body); // Get properties to update
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
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }); // Find by ID, update, return new doc, run validation

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message }); // Bad request (validation errors)
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

module.exports = router;
