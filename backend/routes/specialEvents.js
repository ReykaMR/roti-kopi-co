const express = require("express");
const router = express.Router();
const specialEventController = require("../controllers/specialEventController");

router.get("/", specialEventController.getAllEvents);
router.get("/:id", specialEventController.getEventById);

module.exports = router;
