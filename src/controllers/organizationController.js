const Organization = require("../models/organization");
const User = require("../models/user");
const mongoose = require("mongoose");

// Get Organizations based on dynamic attributes
const getOrganizations = async (req, res) => {
  const filters = req.query; // Expect multiple attribute-value pairs

  if (Object.keys(filters).length === 0) {
    return res.status(400).json({ message: "Missing filters in query" });
  }

  const filterObject = {};
  for (const key in filters) {
    filterObject[key] = filters[key];
  }

  try {
    const organizations = await Organization.find(filterObject).populate(
      "Boss"
    );
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// create organization whith email
const createOrganization = async (req, res) => {
  try {
    console.log("req.body = ", req.body);

    // Extract email from request body
    const { email, ...organizationData } = req.body;
    console.log(1);

    // Find user by email
    const user = await User.findOne({ email: email });
    console.log(2);
    if (!user) {
      console.log(3);
      return res.status(404).json({ error: "User not found" });
    }
    console.log(4);
    console.log(user._id);

    // Add boss field to organization data
    organizationData.Boss = user._id;
    console.log(5);
    const newOrganization = new Organization(organizationData);
    console.log(6);
    // Validate organization data before saving
    const validationErrors = newOrganization.validateSync();
    console.log(7);
    if (validationErrors) {
      console.log(8);
      const formattedErrors = Object.values(validationErrors.errors).map(
        (error) => ({
          message: error.message,
          field: error.path,
        })
      );
      console.log(9);
      return res.status(400).json({ errors: formattedErrors });
    }
    console.log(10);

    const savedOrganization = await newOrganization.save();
    console.log(11);
    res.status(201).json(savedOrganization); // Created
    console.log(12);
  } catch (err) {
    console.error(err); // Log the error for debugging

    if (err.name === "MongoServerError" && err.code === 11000) {
      // Handle duplicate key error (unique constraint violation)
      return res.status(409).json({
        error: "An organization with this information already exists.",
      });
    } else {
      // Handle other errors (e.g., database connection issues)
      return res.status(500).json({ error: err.message });
    }
  }
};

// delete organization
const deleteOrganization = async (req, res) => {
  const { id } = req.params;

  // Validate ID format (optional)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid organization ID" });
  }

  try {
    const deletedOrganization = await Organization.findByIdAndDelete(id);

    if (!deletedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json({ message: "Organization deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Internal server error
  }
};

// update organization
const updateOrganization = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Organization ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["Name", "Boss"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).json({ message: "Invalid update fields" });
  }

  try {
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if name is being updated
    if (updates.includes("Name")) {
      const newName = req.body.Name;

      // Check if new name already exists
      const existingOrganization = await Organization.findOne({
        Name: newName,
        _id: { $ne: id }, // Exclude the current organisation
      });
      if (existingOrganization) {
        return res
          .status(400)
          .json({ message: "Organization name already exists" });
      }
    }

    // Check if boss is being updated
    if (updates.includes("Boss")) {
      const newBossId = req.body.Boss;

      // Validate new boss ID format
      if (!mongoose.Types.ObjectId.isValid(newBossId)) {
        return res.status(400).json({ message: "Invalid boss ID" });
      }

      // Check if new boss exists
      const newBoss = await User.findById(newBossId);
      if (!newBoss) {
        return res.status(404).json({ message: "Boss not found" });
      }
    }

    updates.forEach((update) => (organization[update] = req.body[update]));

    const updatedOrganization = await organization.save();

    res.json(updatedOrganization);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createOrganization,
  getOrganizations,
  deleteOrganization,
  updateOrganization,
};
