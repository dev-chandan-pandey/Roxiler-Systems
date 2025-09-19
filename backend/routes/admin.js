// const express = require('express');
// const bcrypt = require('bcryptjs');
// const { body, validationResult } = require('express-validator');
// const { getDb } = require('../database/init');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const { User, Store, Rating } = require("../database/init");
// const router = express.Router();

// // Apply authentication and admin role requirement to all routes
// router.use(authenticateToken);
// router.use(requireRole(['admin']));

// // Validation rules
// const userValidation = [
//   body('name')
//     .isLength({ min: 20, max: 60 })
//     .withMessage('Name must be between 20 and 60 characters'),
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('password')
//     .isLength({ min: 8, max: 16 })
//     .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
//     .withMessage('Password must be 8-16 characters with at least one uppercase letter and one special character'),
//   body('address')
//     .isLength({ max: 400 })
//     .withMessage('Address must not exceed 400 characters'),
//   body('role')
//     .isIn(['admin', 'user', 'store_owner'])
//     .withMessage('Invalid role')
// ];

// const storeValidation = [
//   body('name')
//     .isLength({ min: 1, max: 100 })
//     .withMessage('Store name is required'),
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('address')
//     .isLength({ max: 400 })
//     .withMessage('Address must not exceed 400 characters')
// ];

// // Dashboard stats


// router.get("/dashboard", async (req, res) => {
//   try {
//     const totalUsers = await User.count();
//     const totalStores = await Store.count();
//     const totalRatings = await Rating.count();

//     res.json({ totalUsers, totalStores, totalRatings });
//   } catch (err) {
//     res.status(500).json({ error: "Database error" });
//   }
// });


// // Add new user
// router.post("/users", userValidation, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { name, email, password, address, role } = req.body;

//     // Check duplicate
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists with this email" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await User.create({ name, email, password: hashedPassword, address, role });

//     if (role === "store_owner") {
//       await Store.create({ name, email, address, owner_id: newUser.id });
//     }

//     res.status(201).json({ message: "User created successfully", user: newUser });
//   } catch (err) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// // Add new store
// router.post('/stores', storeValidation, (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { name, email, address } = req.body;
//     const db = getDb();

//     // Check if store already exists
//     db.get('SELECT id FROM stores WHERE email = ?', [email], (err, row) => {
//       if (err) {
//         return res.status(500).json({ error: 'Database error' });
//       }
//       if (row) {
//         return res.status(400).json({ error: 'Store already exists with this email' });
//       }

//       db.run(
//         'INSERT INTO stores (name, email, address) VALUES (?, ?, ?)',
//         [name, email, address],
//         function(err) {
//           if (err) {
//             return res.status(500).json({ error: 'Failed to create store' });
//           }

//           res.status(201).json({
//             message: 'Store created successfully',
//             store: { id: this.lastID, name, email, address }
//           });
//         }
//       );
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get all users with filtering and sorting
// router.get("/users", async (req, res) => {
//   try {
//     const { name, email, address, role, sortBy = "name", sortOrder = "ASC" } = req.query;

//     const where = {};
//     if (name) where.name = { [Op.like]: `%${name}%` };
//     if (email) where.email = { [Op.like]: `%${email}%` };
//     if (address) where.address = { [Op.like]: `%${address}%` };
//     if (role) where.role = role;

//     const users = await User.findAll({
//       where,
//       order: [[sortBy, sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]],
//       include: [
//         {
//           model: Store,
//           as: "stores",
//           include: [{ model: Rating }]
//         }
//       ]
//     });

//     res.json({ users });
//   } catch (err) {
//     res.status(500).json({ error: "Database error" });
//   }
// });



// // Get all stores with filtering and sorting
// router.get('/stores', (req, res) => {
//   const { name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
//   const db = getDb();

//   let query = `
//     SELECT s.id, s.name, s.email, s.address, s.created_at,
//            AVG(r.rating) as rating, COUNT(r.id) as rating_count
//     FROM stores s
//     LEFT JOIN ratings r ON s.id = r.store_id
//     WHERE 1=1
//   `;
//   const params = [];

//   // Apply filters
//   if (name) {
//     query += ' AND s.name LIKE ?';
//     params.push(`%${name}%`);
//   }
//   if (email) {
//     query += ' AND s.email LIKE ?';
//     params.push(`%${email}%`);
//   }
//   if (address) {
//     query += ' AND s.address LIKE ?';
//     params.push(`%${address}%`);
//   }

//   query += ' GROUP BY s.id';

//   // Apply sorting
//   const validSortColumns = ['name', 'email', 'address', 'created_at'];
//   const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
//   const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
//   query += ` ORDER BY s.${sortColumn} ${order}`;

//   db.all(query, params, (err, stores) => {
//     if (err) {
//       return res.status(500).json({ error: 'Database error' });
//     }
//     res.json({ stores });
//   });
// });

// // Get user details by ID
// router.get('/users/:id', (req, res) => {
//   const { id } = req.params;
//   const db = getDb();

//   const query = `
//     SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
//            CASE WHEN u.role = 'store_owner' THEN AVG(r.rating) END as rating
//     FROM users u
//     LEFT JOIN stores s ON u.id = s.owner_id AND u.role = 'store_owner'
//     LEFT JOIN ratings r ON s.id = r.store_id
//     WHERE u.id = ?
//     GROUP BY u.id
//   `;

//   db.get(query, [id], (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: 'Database error' });
//     }
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json({ user });
//   });
// });

// module.exports = router;
const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { User, Store, Rating, sequelize } = require("../database/init");
const { Op } = require("sequelize");

const router = express.Router();

// Apply authentication + admin role to all routes
router.use(authenticateToken);
router.use(requireRole(["admin"]));

// =========================
// Validation Rules
// =========================
const userValidation = [
  body("name")
    .isLength({ min: 20, max: 60 })
    .withMessage("Name must be between 20 and 60 characters"),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage(
      "Password must be 8-16 characters with at least one uppercase letter and one special character"
    ),
  body("address")
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters"),
  body("role").isIn(["admin", "user", "store_owner"]),
];

const storeValidation = [
  body("name").isLength({ min: 1, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("address")
    .isLength({ max: 400 })
    .withMessage("Address must not exceed 400 characters"),
];

// =========================
// Dashboard
// =========================
  router.get("/dashboard", async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// Create User
// =========================
router.post("/users", userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    if (role === "store_owner") {
      await Store.create({ name, email, address, owner_id: newUser.id });
    }

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// Create Store
// =========================
router.post("/stores", storeValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, address } = req.body;

    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ error: "Store already exists with this email" });
    }

    const store = await Store.create({ name, email, address });
    res.status(201).json({ message: "Store created successfully", store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// Get All Users
// =========================
router.get("/users", async (req, res) => {
  try {
    const { name, email, address, role, sortBy = "name", sortOrder = "ASC" } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };
    if (role) where.role = role;

    const users = await User.findAll({
  where,
  order: [[sortBy, sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]],
  include: [
    {
      model: Store,
      as: "stores",
      include: [{ model: Rating, as: "ratings" }],
    },
  ],
});


    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// Get All Stores
// =========================
router.get("/stores", async (req, res) => {
  try {
    const { name, email, address, sortBy = "name", sortOrder = "ASC" } = req.query;

    const where = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (email) where.email = { [Op.like]: `%${email}%` };
    if (address) where.address = { [Op.like]: `%${address}%` };

    const stores = await Store.findAll({
  where,
  attributes: {
    include: [
      [sequelize.fn("AVG", sequelize.col("ratings.rating")), "rating"],
      [sequelize.fn("COUNT", sequelize.col("ratings.id")), "rating_count"],
    ],
  },
  include: [{ model: Rating, as: "ratings", attributes: [] }],
  group: ["Store.id"],
  order: [[sortBy, sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]],
});


    res.json({
  stores: stores.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    address: s.address,
    created_at: s.created_at,
    rating: s.get("rating") ? parseFloat(s.get("rating")) : 0, // ✅ ensure number
    rating_count: parseInt(s.get("rating_count") || 0, 10),
  })),
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// Get User by ID
// =========================
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
  include: {
    model: Store,
    as: "stores",
    include: [{ model: Rating, as: "ratings" }],
  },
});

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
