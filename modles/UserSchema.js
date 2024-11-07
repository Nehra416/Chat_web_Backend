const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        toLowecase: true
    },
    nickName:{
        type:String,
        required: true,   
    },
    email: {
        type: String,
        required: true
    },
    hashPassword: {
        type: String,
        required: true
    },
    avatarUrl:{
        type:String,
        default: ''
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;