const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose
  .connect("YOUR MONGO DB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Create URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

// Create URL model
const Url = mongoose.model("SHORTURL", urlSchema);

// Set up routes
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Welcome to the URL shortener!");
});

app.post("/shorten", (req, res) => {
  const { originalUrl } = req.body;

  // Generate a short URL
  const shortUrl = shortid.generate();

  // Save the URL to the database
  const url = new Url({ originalUrl, shortUrl });
  url
    .save()
    .then(() => {
      res.send(
        `Shortened URL: ${req.protocol}://${req.get("host")}/${shortUrl}`
      );
    })
    .catch((error) => {
      console.error("Error saving URL:", error);
      res.status(500).send("An error occurred while shortening the URL.");
    });
});

app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;

  // Find the URL in the database
  const url = Url.findOne({ shortUrl }).then((url) => {
    if (url) {
      res.redirect(url.originalUrl);
    } else {
      res.status(404).send("URL not found");
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
