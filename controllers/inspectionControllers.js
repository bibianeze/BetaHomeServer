const Inspection = require("../models/inspection");

//create inspection
const createInspection = async (req, res) => {
  try {
    const inspection = await Inspection.create({ ...req.body });
    res.status(201).json({ success: true, inspection });
  } catch (error) {
    console.log();
    res.status(400).json(error);
  }
};

//get all inspection
const getAllInspections = async (req, res) => {
  try {
    const inspections = await Inspection.find().sort("-createAt");
    res.status(200).json({ success: true, inspections });
  } catch (error) {
    console.log();
    res.status(500).json({ err: "internal server error" });



























    
  }
};

module.exports = { createInspection, getAllInspections };
