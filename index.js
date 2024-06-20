const app = require("./src/app");
const mongoose = require("mongoose");

const port = process.env.PORT || 1937;

const connectionString =
  "mongodb+srv://walidchebbab2001:Maman123@cluster0.k5q0dbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your connection string

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
