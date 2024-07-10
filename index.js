const app = require("./src/app");
const mongoose = require("mongoose");

const port = process.env.PORT || 1937;

const connectionString =
  "mongodb+srv://gartiabdou074:rzOhzb4FGcScSBNr@pfemaster.nv4nnwo.mongodb.net/?retryWrites=true&w=majority&appName=PFEmaster"; // Replace with your connection string

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
