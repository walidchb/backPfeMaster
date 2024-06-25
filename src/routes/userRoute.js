const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Task = require("../models/task");
const Project = require("../models/projectModel");
const admin = require("firebase-admin");
const mongoose = require("mongoose");
// const { ObjectId } = require('mongoose').Types;

async function getUserTasks(userId, organizationId, teamId) {
  try {
    const user = await User.findById(userId).populate("team");

    if (!user) {
      throw new Error("User not found");
    }

    let tasks = [];
    const userRole = user.roles.find(
      (r) => r.organization && r.organization.toString() === organizationId
    );

    if (!userRole) {
      throw new Error("User not associated with this organization");
    }
    switch (userRole.role) {
      case "orgBoss":
        const Orgprojects = await Project.find({
          organization: organizationId,
        })
          .populate("teams")
          .populate("tasks") // Optionally populate team details
          .populate("boss"); // Optionally populate project boss details

        tasks = Orgprojects.reduce((acc, project) => {
          return acc.concat(project.tasks);
        }, []);
        break;
      case "prjctBoss":
        const Bossprojects = await Project.find({
          boss: userId,
          organization: organizationId,
        })
          .populate("teams")
          .populate("tasks") // Optionally populate team details
          .populate("boss"); // Optionally populate project boss details

        tasks = Bossprojects.reduce((acc, project) => {
          return acc.concat(project.tasks);
        }, []);
        break;
      case "teamBoss":
        tasks = await Task.find({
          team: teamId,
        })
          .populate("affectedto")
          .populate("projet")
          .populate("team");
        break;
      case "employee":
        tasks = await Task.find({
          affectedto: userId,
          team: teamId,
        })
          .populate("affectedto")
          .populate("projet")
          .populate("team");
        break;
      default:
        throw new Error(
          "Role not recognized or no tasks to display for this role."
        );
    }
    return tasks;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function getUserProjects(userId, organizationId) {
  try {
    const user = await User.findById(userId).populate("team");

    if (!user) {
      throw new Error("User not found");
    }

    const userTeams = user.team.map((t) => t._id);
    console.log(3);

    const projects = await Project.find({
      teams: { $in: userTeams },
      organization: organizationId,
    })
      .populate("teams") // Optionally populate team details
      .populate("boss"); // Optionally populate project boss details

    return projects;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

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
      .populate("roles.organization")
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
  // const filters = req.query; // Expect multiple attribute-value pairs
  const {
    roles,
    organizations,
    "roles.organization": rolesOrganization,
    ...otherFilters
  } = req.query;

  try {
    let query = {};

    if (roles) {
      const roleList = roles.split(",");
      query["roles.role"] = { $in: roleList };
    }

    if (rolesOrganization) {
      query["roles.organization"] = rolesOrganization;
    }

    if (organizations) {
      query.organizations = organizations;
    }

    // Ajouter d'autres filtres si nécessaire
    Object.keys(otherFilters).forEach((key) => {
      if (key === "team") {
        const teamIds = otherFilters[key].split(",").map((id) => id);
        query[key] = { $in: teamIds };
      } else {
        query[key] = otherFilters[key];
      }
    });

    const users = await User.find(query)
      .populate("roles.organization")
      .populate("team");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// get all users qui ont role différent de orgBoss
router.get("/Allusers", async (req, res) => {
  try {
    const users = await User.find({ "roles.role": { $ne: "orgBoss" } })
      .populate("roles.organization")
      .populate("team");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

router.get("/userProjects", async (req, res) => {
  const { userId, organizationId } = req.query;
  console.log("userId");

  // console.log(userId.userId);

  try {
    const projects = await getUserProjects(userId, organizationId);
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/userTasks", async (req, res) => {
  const { userId, organizationId, teamId } = req.query;
  console.log("userId");

  // console.log(userId.userId);

  try {
    const tasks = await getUserTasks(userId, organizationId, teamId);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    if (
      req.body.roles &&
      req.body.roles.length > 0 &&
      req.body.roles[0].role === "individual"
    ) {
      req.body.roles[0].organization = null;
    }
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
    "roles",
    "email",
    "team",
  ]; // Allowed fields for update
  // const arrayUpdates = ["team", "organizations"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    // Separate regular updates and array updates
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Push new values to array fields
    updates.forEach((update) => {
      if (update === "roles") {
        // Gestion spéciale pour les rôles
        const newRole = req.body.roles[0]; // On suppose qu'un seul rôle est envoyé à la fois

        const individualRoleIndex = user.roles.findIndex(
          (role) => role.role === "individual"
        );

        if (individualRoleIndex !== -1) {
          // Si un rôle "individual" existe, on le remplace
          user.roles[individualRoleIndex] = newRole;
        } else {
          // Sinon, on gère comme avant
          const existingRoleIndex = user.roles.findIndex(
            (role) =>
              role.organization &&
              role.organization.toString() === newRole.organization
          );
          if (existingRoleIndex !== -1) {
            user.roles[existingRoleIndex] = newRole;
          } else {
            user.roles.push(newRole);
          }
        }
      } else if (update === "team") {
        // Gestion des équipes (inchangée)
        const newTeams = req.body.team.filter(
          (teamId) => !user.team.includes(teamId)
        );
        user.team = user.team.concat(newTeams);
      } else {
        user[update] = req.body[update];
      }
    });

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// update user in admin
router.patch("/updateUser", async (req, res) => {
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
    "roles",
    "email",
    "team",
    "password"
  ];

  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    updates.forEach((update) => {
      if (update === "roles") {
        // Remplacer complètement le tableau des rôles
        user.roles = req.body.roles.map(role => ({
          role: role.role,
          organization: role.organization
        }));
      } else if (update === "team") {
        // Remplacer complètement le tableau des équipes
        user.team = req.body.team;
      } else if (update === "password") {
        // Le middleware pre-save se chargera du hachage du mot de passe
        user.password = req.body.password;
      } else {
        user[update] = req.body[update];
      }
    });

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
