const mongoose = require("mongoose");
const validateMongoDbId = id =>{
    console.log("id",id)
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error ("The user id is not valid or not found")
}
module.exports = validateMongoDbId;