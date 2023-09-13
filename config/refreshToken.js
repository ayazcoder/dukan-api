const jwt = require("jsonwebtoken");

const generateRefreshToken = id =>{
    console.log('new token id ',id)

    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "3d"});
}

module.exports= {generateRefreshToken};