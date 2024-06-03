const Organization = require("../models/organization");
const mongoose = require("mongoose");

// Get Organizations based on dynamic attribute
const getOrganizations = async (req, res) => {
    console.log(req.query);
    const { attribute, value } = req.query; // Get attribute and value from query parameters

    if (!attribute || !value) {
        
      return res
        .status(400)
        .json({ message: "Missing attribute or value in query" });
    }
  
    const filter = { [attribute]: value }; // Build dynamic filter object
  
    try {
      const organizations = await Organization.find(filter);
      res.json(organizations);
    } catch (err) {
      res.status(500).json({ message: "Server error" }); // Internal server error
    }
}


// create organization
const createOrganization = async (req, res) => {
    try {
        console.log("req.body = ", req.body)
        const newOrganization = new Organization(req.body);
        const savedOrganization = await newOrganization.save();
        res.status(201).json(savedOrganization); // Created
      } catch (err) {
        res.status(400).json({ message: err.message }); // Bad request (validation errors)
        
      }
}

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
}

// update organization
const updateOrganization = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid organization ID" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["Name", "Description", "CreatedBy", "Teams"];
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

    updates.forEach((update) => (organization[update] = req.body[update]));
    await organization.save();

    res.json(organization);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


module.exports ={
    createOrganization,
    getOrganizations,
    deleteOrganization,
    updateOrganization
}