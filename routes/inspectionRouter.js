const router = require("express").Router();
const {
  getAllInspections,
  createInspection,
} = require("../controllers/inspectionControllers");
const { authentication, requirePermission } = require("../middlewares/auth");

router
  .route("/inspection")
  .get(authentication, requirePermission("admin"), getAllInspections)
  .post(authentication, createInspection);

module.exports = router;
