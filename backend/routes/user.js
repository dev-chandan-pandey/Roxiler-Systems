// const express = require("express");
// const { authenticateToken, requireRole } = require("../middleware/auth");
// const { Store, Rating, User, Sequelize } = require("../database/init");

// const router = express.Router();

// // Apply authentication to all routes
// router.use(authenticateToken);

// /**
//  * GET /stores
//  * Get all stores for normal users (with filters, sorting, and user's own rating)
//  */
// router.get("/stores", requireRole(["user"]), async (req, res) => {
//   try {
//     const { name, address, sortBy = "name", sortOrder = "asc" } = req.query;
//     const userId = req.user.id;

//     // Filters
//     const where = {};
//     if (name) where.name = { [Sequelize.Op.like]: `%${name}%` };
//     if (address) where.address = { [Sequelize.Op.like]: `%${address}%` };

//     // Sorting
//     const validSortColumns = ["name", "address", "overall_rating"];
//     const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "name";
//     const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

//     // Query stores with aggregated ratings + user's rating
//     const stores = await Store.findAll({
//       where,
//       attributes: [
//         "id",
//         "name",
//         "address",
//         "created_at",
//         [Sequelize.fn("AVG", Sequelize.col("Ratings.rating")), "overall_rating"],
//         [Sequelize.fn("COUNT", Sequelize.col("Ratings.id")), "rating_count"],
//       ],
//       include: [
//         {
//           model: Rating,
//            as: "ratings",   // 👈 matches `Store.hasMany(..., as: "ratings")`
//           attributes: [],
//         },
//         {
//           model: Rating,
//           as: "UserRating",
//           attributes: ["rating"],
//           required: false,
//           where: { user_id: userId },
//         },
//       ],
//       group: ["Store.id", "UserRating.id"],
//       order:
//         sortColumn === "overall_rating"
//           ? [[Sequelize.fn("AVG", Sequelize.col("Ratings.rating")), order]]
//           : [[sortColumn, order]],
//     });

//     res.json({
//       stores: stores.map((s) => ({
//         id: s.id,
//         name: s.name,
//         address: s.address,
//         created_at: s.created_at,
//         overall_rating: s.get("overall_rating") ? parseFloat(s.get("overall_rating")) : 0,
//         rating_count: s.get("rating_count"),
//         user_rating: s.UserRating?.rating || null,
//       })),
//     });
//   } catch (err) {
//     console.error("Error fetching stores:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * POST /stores/:storeId/rating
//  * Submit or update a rating
//  */
// router.post("/stores/:storeId/rating", requireRole(["user"]), async (req, res) => {
//   try {
//     const { storeId } = req.params;
//     const { rating } = req.body;
//     const userId = req.user.id;

//     if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
//       return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
//     }

//     // Check if store exists
//     const store = await Store.findByPk(storeId);
//     if (!store) {
//       return res.status(404).json({ error: "Store not found" });
//     }

//     // Insert or update rating
//     const [ratingRecord, created] = await Rating.upsert({
//       user_id: userId,
//       store_id: storeId,
//       rating,
//       updated_at: new Date(),
//     });

//     res.json({
//       message: created ? "Rating submitted successfully" : "Rating updated successfully",
//       rating,
//     });
//   } catch (err) {
//     console.error("Error submitting rating:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// module.exports = router;
const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { Store, Rating, Sequelize } = require("../database/init");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /stores
 * Get all stores for normal users (with filters, sorting, and user's own rating)
 */
router.get("/stores", requireRole(["user"]), async (req, res) => {
  try {
    const { name, address, sortBy = "name", sortOrder = "asc" } = req.query;
    const userId = req.user.id;

    // Filters
    const where = {};
    if (name) where.name = { [Sequelize.Op.like]: `%${name}%` };
    if (address) where.address = { [Sequelize.Op.like]: `%${address}%` };

    // Sorting
    const validSortColumns = ["name", "address", "overall_rating"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "name";
    const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

    // Query stores with aggregated ratings + user's rating
    const stores = await Store.findAll({
      where,
      attributes: [
        "id",
        "name",
        "address",
        "created_at",
        [Sequelize.fn("AVG", Sequelize.col("ratings.rating")), "rating"],
        [Sequelize.fn("COUNT", Sequelize.col("ratings.id")), "rating_count"],
      ],
      include: [
        {
          model: Rating,
          as: "ratings", // 👈 must match init.js alias
          attributes: [],
        },
        {
          model: Rating,
          as: "userRating", // 👈 must match init.js alias
          attributes: ["rating"],
          required: false,
          where: { user_id: userId },
        },
      ],
      group: ["Store.id", "userRating.id"],
      order:
        sortColumn === "overall_rating"
          ? [[Sequelize.fn("AVG", Sequelize.col("ratings.rating")), order]]
          : [[sortColumn, order]],
    });

    res.json({
      stores: stores.map((s) => ({
        id: s.id,
        name: s.name,
        address: s.address,
        created_at: s.created_at,
        overall_rating: s.get("overall_rating")
          ? parseFloat(s.get("overall_rating"))
          : 0,
        rating_count: parseInt(s.get("rating_count") || 0, 10),
        user_rating: s.userRating?.rating || null,
        rating: s.get("rating") ? parseFloat(s.get("rating")) : 0,  
      })),
    });
  } catch (err) {
    console.error("Error fetching stores:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /stores/:storeId/rating
 * Submit or update a rating
 */
router.post("/stores/:storeId/rating", requireRole(["user"]), async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res
        .status(400)
        .json({ error: "Rating must be an integer between 1 and 5" });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // // Insert or update rating
    // const [ratingRecord, created] = await Rating.upsert({
    //   user_id: userId,
    //   store_id: storeId,
    //   rating,
    //   updated_at: new Date(),
    // });

    //  res.json({
    //   message: created
    //     ? "Rating submitted successfully"
    //     : "Rating updated successfully",
    //   rating,
    // });

// Check if rating already exists
    let existing = await Rating.findOne({
      where: { user_id: userId, store_id: storeId },
    });

    let message;
    if (existing) {
      // Update existing rating
      await existing.update({ rating, updated_at: new Date() });
      message = "Rating updated successfully";
    } else {
      // Create new rating
      await Rating.create({
        user_id: userId,
        store_id: storeId,
        rating,
        created_at: new Date(),
        updated_at: new Date(),
      });
      message = "Rating submitted successfully";
    }
   res.json({ message, rating });
  } catch (err) {
    console.error("Error submitting rating:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
