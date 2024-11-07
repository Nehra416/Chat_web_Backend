const mongoose = require('mongoose');

const chatReadStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    lastReadMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    },
    lastReadTime: {
        type: Date,
        default: Date.now
    }
});

const ChatReadStatus = mongoose.model("ChatReadStatus", chatReadStatusSchema);
module.exports = ChatReadStatus;