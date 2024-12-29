import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Doesn't exists",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = createToken(user._id);
    res.status(200).json({
      success: true,
      token,
      message: "login successfully",
    });
  } catch (e) {
    console.log(e, "error from login");
    res.status(500).json({
      success: false,
      message: "Error from login",
    });
  }
};
// register user

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // checking is user already exists
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.status(401).json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.status(402).json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hasing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();

    const token = createToken(user._id);
    res.status(200).json({
      success: true,
      token,
      message: "registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (e) {
    console.log(e, "error from registered user");
    res.status(403).json({
      success: false,
      message: "Error from registered user",
    });
  }
};

export { loginUser, registerUser };
