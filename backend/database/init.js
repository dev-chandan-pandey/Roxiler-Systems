const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();
const isRender = !!process.env.RENDER;  // true on Render, false locally
// Choose database connection from environment (Render → PostgreSQL)
const sequelize = new Sequelize(
  process.env.DB_NAME,       // database name
  process.env.DB_USER,       // username
  process.env.DB_PASSWORD,   // password
  {
    host: isRender ? process.env.DB_HOST_INTERNAL : process.env.DB_HOST_EXTERNAL|| "localhost",
    port: process.env.DB_PORT || 5432, // default Postgres port
    dialect: process.env.DB_DIALECT || "postgres", // change to 'mysql' if using MySQL
    logging: false, // disable SQL query logging
      dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  }
);

// =======================
// MODELS
// =======================

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(60), allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING(400), allowNull: false },
  role: {
    type: DataTypes.ENUM("admin", "user", "store_owner"),
    allowNull: false,
  },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, {
  tableName: "users",
  timestamps: false,
});

const Store = sequelize.define("Store", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  address: { type: DataTypes.STRING(400), allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, {
  tableName: "stores",
  timestamps: false,
});

const Rating = sequelize.define("Rating", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
}, {
  tableName: "ratings",
  timestamps: false,
});

// =======================
// RELATIONSHIPS
// =======================

User.hasMany(Store, { foreignKey: "owner_id", as: "stores" });
Store.belongsTo(User, { foreignKey: "owner_id", as: "owner" });

// User ↔ Rating
User.hasMany(Rating, { foreignKey: "user_id", as: "ratings" });
Rating.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Store ↔ Rating
Store.hasMany(Rating, { foreignKey: "store_id", as: "ratings" });
Rating.belongsTo(Store, { foreignKey: "store_id", as: "store" });

// Special association for user-specific rating
Store.hasOne(Rating, { foreignKey: "store_id", as: "userRating" });

// =======================
// INIT FUNCTION
// =======================

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync({ alter: true }); // adjust tables safely (use { force: true } only for dev)
    console.log("✅ Models synchronized");

    // Create default admin if not exists
    const bcrypt = require("bcryptjs");
    const adminEmail = "admin@example.com";
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      await User.create({
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        address: "Admin Address",
        role: "admin",
      });
      console.log("✅ Default admin user created");
    }

  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  Sequelize,
  initializeDatabase,
  User,
  Store,
  Rating,
};


/*
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",   // change to "mysql" if using MySQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Define Models
const User = sequelize.define("User", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("admin", "user", "store_owner"),
    allowNull: false,
  },
}, { timestamps: true });

const Store = sequelize.define("Store", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  address: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

const Rating = sequelize.define("Rating", {
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
}, { timestamps: true });

// Relations
Store.belongsTo(User, { as: "owner", foreignKey: "owner_id" });
User.hasMany(Store, { as: "stores", foreignKey: "owner_id" });

Rating.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Rating, { foreignKey: "user_id" });

Rating.belongsTo(Store, { foreignKey: "store_id" });
Store.hasMany(Rating, { foreignKey: "store_id" });

// Initialize DB
const initializeDatabase = async () => {
  await sequelize.sync({ alter: true }); // creates/updates tables

  // Create default admin if not exists
  const adminEmail = "admin@example.com";
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    await User.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      address: "Admin Address",
      role: "admin",
    });
    console.log("Default admin created");
  }

  console.log("Database initialized ✅");
};

module.exports = { sequelize, initializeDatabase, User, Store, Rating };

*/