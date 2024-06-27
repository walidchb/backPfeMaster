const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uniqueValidator = require("mongoose-unique-validator");
const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Nom is required"],
    trim: true,
  },
  prenom: {
    type: String,
    required: [true, "Prenom is required"],
    trim: true,
  },
  phoneNumber: {
    type: String,
    unique: [true, "Phone number is already in use"],
  },
  gender: {
    type: String,
    default: null,
  },
  roles: [
    {
      role: {
        type: String,
        required: [true, "Role is required"],
        enum: {
          values: [
            "employee",
            "orgBoss",
            "teamBoss",
            "prjctBoss",
            "individual",
            "admin"
          ],
          message:
            "Role must be one of 'employee', 'orgBoss', 'teamBoss', 'prjctBoss', or 'individual'",
        },
      },
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
      },
    },
  ],
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email is already in use"],
    lowercase: true,
    trim: true,
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  uid : {
    type: String,
    default: null
  }
  
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10; // Adjust salt rounds as needed
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.plugin(uniqueValidator);
// Virtual property for full name (optional)
userSchema.virtual("fullName").get(function () {
  return `${this.nom} ${this.prenom}`;
});

module.exports = mongoose.model("User", userSchema);
