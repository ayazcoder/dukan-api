const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongoDbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

//create user
const createUser = expressAsyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      // create new user
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      // user already exists
      res.status(400).json({ message: "User already exists" });
    }
  } catch {
    throw new Error("User already exists");
  }
});
//login user
const login = expressAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //find created user
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstName: findUser?.firstName,
      lastName: findUser?.lastName,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    return res.json({
      message: "not Login",
    });
  }
});
//logout user
// const logout = expressAsyncHandler(async (req, res, next) => {
//   const cookie = req.cookies
//   if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
//   const refreshToken = cookie.refreshToken
//   const user = await User.findOne({ refreshToken })
//   if (!user) {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: true,
//     })
//     return res.sendStatus(204)   //forbidden
//   }
//   await User.findOneAndUpdate(refreshToken,{
//     refreshToken:"",
//   })
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//   })
//   res.sendStatus(204)   //forbidden
// })

const logout = expressAsyncHandler(async (req, res, next) => {
  const cookie = req.cookies;

  if (!cookie?.refreshToken) {
    throw new Error("No Refresh Token in Cookies");
  }

  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    return res.sendStatus(403); // Forbidden
  }

  // Assuming you want to update the user's refreshToken field to an empty string
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  res.sendStatus(204); // No Content
});

//get all users
const getAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (error) {
    throw new Error(error);
  }
});
//get single user
const getUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaUser = await User.findById(id);
    res.json(getaUser);
  } catch (error) {
    throw new Error(error);
  }
});
//delete single user
const deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      message: "User Deleted!",
    });
  } catch (error) {
    throw new Error(error);
  }
});
//update single user
const updateUser = expressAsyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  const { firstName, lastName, mobile, email } = req?.body;
  try {
    const updateaUser = await User.findByIdAndUpdate(
      _id,
      {
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        email: email,
      },
      {
        new: true,
      }
    );
    res.json(updateaUser);
  } catch (error) {
    throw new Error(error);
  }
});
//block single user
const blockUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new Error("not able to block user");
  }
});
//unBlock single user
const unBlockUser = expressAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unBlockUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error("not able to unBlock the user");
  }
});
//refresh token of user
const handleRefreshToken = expressAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("Refresh Tokenn key", refreshToken);
  if (!refreshToken) throw new Error("No Refersh Token in Cookies");

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error("No Refresh token present in db or not matched");
    // res.json(user)
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      console.log(decoded);
      if (err || user.id !== decoded.id) {
        throw new Error("There is something wrong with the refresh token");
      }
      const accessToken = generateToken(user?._id);
      res.json({ accessToken });
    });
  } catch (error) {
    throw new Error(`internal server error ${error}`);
  }
});

module.exports = handleRefreshToken;

module.exports = {
  createUser,
  login,
  logout,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
};
