const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Load data from JSON files
const teachersData = JSON.parse(fs.readFileSync("data/teachers.json", "utf8"));
const usersData = JSON.parse(fs.readFileSync("data/users.json", "utf8"));

app.use(bodyParser.json());

// Login API endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = usersData.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
  res.json({ token });
});

// Get All Data API endpoint (protected route)
app.get("/teachers", verifyToken, (req, res) => {
  res.json(teachersData);
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, "secret_key", (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
