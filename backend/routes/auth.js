const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
// const { getDb } = require('../database/init');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { Store, Rating, User, Sequelize } = require("../database/init");

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
  body('address')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Register endpoint (for normal users only)
router.post("/register", [
  body("name").isLength({ min: 3, max: 60 }).withMessage("Name must be between 20 and 60 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must be 8-16 characters with at least one uppercase letter and one special character"),
  body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, address, role: "user" });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});



// Login endpoint
router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "Invalid email or password" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
});


// Update password
router.put("/password", authenticateToken, [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must be 8-16 characters with at least one uppercase letter and one special character")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Password update failed" });
  }
});




// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "address", "role"]
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});



module.exports = router;
