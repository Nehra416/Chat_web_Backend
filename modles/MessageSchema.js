const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;