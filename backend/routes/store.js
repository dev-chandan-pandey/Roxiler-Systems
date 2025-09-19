const express = require("express");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { Store, Rating, User, Sequelize } = require("../database/init");
const { query } = require("express-validator");
const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /store/dashboard
 * Store owner dashboard (stats + ratings)
 */
router.get("/dashboard", requireRole(["store_owner"]), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the store owned by this user
    const store = await Store.findOne({ where: { owner_id: userId } });
    if (!store) {
      return res.status(404).json({ error: "No store found for this owner" });
    }

    // Get store statistics
    const stats = await Rating.findOne({
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("rating")), "average_rating"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total_ratings"],
        [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("user_id"))), "unique_raters"],
      ],
      where: { store_id: store.id },
      raw: true,
    });

    // Get detailed ratings with user info
    const ratings = await Rating.findAll({
      where: { store_id: store.id },
      include: [{ model: User,as: "user",attributes: ["name", "email"] }],
      order: [["created_at", "DESC"]],
    });

    res.json({
      store: {
        id: store.id,
        name: store.name,
      },
      statistics: {
        averageRating: stats.average_rating ? parseFloat(Number(stats.average_rating).toFixed(2)) : 0,
        totalRatings: stats.total_ratings || 0,
        uniqueRaters: stats.unique_raters || 0,
      },
      ratings: ratings.map(r => ({
        rating: r.rating,
        created_at: r.created_at,
        updated_at: r.updated_at,
        user_name: r.user.name,
        user_email: r.user.email,
      })),
    });
  } catch (err) {
    console.error("Error in dashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /store/raters
 * Get users who rated the store
 */
router.get("/raters", requireRole(["store_owner"]), [
    query("sortBy").optional().isIn(["name", "email", "rating", "created_at"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ], async (req, res) => {
  try {
    const { sortBy = "created_at", sortOrder = "desc" } = req.query;
    const userId = req.user.id;

    const store = await Store.findOne({ where: { owner_id: userId } });
    if (!store) {
      return res.status(404).json({ error: "No store found for this owner" });
    }

    const validSortColumns = ["name", "email", "rating", "created_at"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const order = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    const raters = await Rating.findAll({
      where: { store_id: store.id },
      include: [{ model: User, as: "user",attributes: ["name", "email"] }],
      order: [
        sortColumn === "name" || sortColumn === "email"
          ? [User, sortColumn, order]
          : [sortColumn, order],
      ],
    });

    res.json({
      raters: raters.map(r => ({
        name: r.user.name,
        email: r.user.email,
        rating: r.rating,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    });
  } catch (err) {
    console.error("Error fetching raters:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
