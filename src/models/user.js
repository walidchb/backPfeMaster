const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  phoneNumber: { type: String, unique: true },
  gender: { type: String },
  role: {
    type: String,
    required: true,
    enum: ["employee", "orgBoss", "teamBoss", "prjctBoss"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 6 },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  organizations: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  ],
  businessName: { type: String, unique: true },
  country: { type: String, unique: true },
  province: { type: String, unique: true },
  street: { type: String, unique: true },
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10; // Adjust salt rounds as needed
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Virtual property for full name (optional)
userSchema.virtual("fullName").get(function () {
  return `${this.nom} ${this.prenom}`;
});

module.exports = mongoose.model("User", userSchema);
