const { default: mongoose } = require("mongoose");

 const dbConnect = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected Sucessfully!");
  } catch (error) {
    console.log(`Database error:${error}`);
  }
};
module.exports = dbConnect;
