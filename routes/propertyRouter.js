const router = require("express").Router();
const {
    handleAddProperty,
  handleGetAllProperties,
  handleGetASingleProperty,
  handleEditProperties,
  handleDeleteProperties,
  handleGetRecentProperties,
} = require("../controllers/propertyControllers")

router.route("/").get(handleGetAllProperties).post(handleAddProperty)
router.get("/recent", handleGetRecentProperties)

router.route("/:propertyId")
.get(handleGetASingleProperty)
.patch(handleEditProperties)
.delete(handleDeleteProperties)

module.exports = router