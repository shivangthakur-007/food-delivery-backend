import mongoose from "mongoose";

const MongoosePort = process.env.MONGO_URI;
const connectDB = async () => {
  const { connection } = await mongoose.connect(
    MongoosePort ||
      "mongodb+srv://thakurshivang579:57575751@cluster0.aj8hrur.mongodb.net/food"
  );
  if (connection) {
    console.log(`DB Connected at ${connection.host}`);
  }
};

export default connectDB;
