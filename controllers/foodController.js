import foodModel from "../models/foodModel.js";
import fs from "fs/promises"
// add food item

const addFood = async (req, res) => {
  // Ensure file is uploaded
  if (!req.file || !req.file.filename) {
    return res.status(400).json({
      success: false,
      message: "image is required",
    });
  }

  let image_filename = req.file.filename;

  // Validate request body fields
  const { name, description, price, category } = req.body;
  if (!name || !description || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, description, price, category) are required",
    });
  }

  const food = new foodModel({
    name,
    description,
    price,
    image: image_filename,
    category,
  });

  try {
    await food.save();
    res.json({
      success: true,
      message: "Food added successfully",
    });
  } catch (e) {
    console.log(e, "An error occurred while adding food item");
    res.json({
      success: false,
      message: e.message,
    });
  }
};

// All food List
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (e) {
    console.log(e);
    res.json({ succes: false, message: "error in list food" });
  }
};

//remove food
const removeFood = async (req, res) => {
  try {
    // Find the food item by its ID
    const food = await foodModel.findById(req.body.id);

    if (!food) {
      return res.json({ success: false, message: "Food item not found" });
    }

    // Remove the associated image file if it exists
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) {
        console.error("Error deleting image file:", err); // Log the error if unlink fails
      }
    });

    // Delete the food item from the database
    await foodModel.findByIdAndDelete(req.body.id);

    // Respond with success
    res.json({ success: true, message: "Food item removed successfully" });
  } catch (e) {
    console.error("Error in removeFood:", e); // Log error for debugging
    res.json({
      success: false,
      message: "An error occurred while removing food item",
    });
  }
};

export { addFood, listFood, removeFood };
