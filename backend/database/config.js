// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",  // use "mysql" if external MySQL
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false
//     }
//   }
// });

// module.exports = sequelize;
// 4️⃣ Deploying your backend

// Push your project to GitHub (with Sequelize models and routes).

// In Render → New → Web Service

// Connect your GitHub repo

// Choose Node as the environment

// Set Build Command: npm install

// Set Start Command: node index.js (or whatever your main file is)

// Set Environment → Add all variables from .env

// Click Create Web Service → Render will build and deploy

// npx sequelize-cli db:migrate
// sequelize.sync({ alter: true });
// npm install sequelize pg  # if PostgreSQL
// npm install sequelize mysql2  # if MySQL
