const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    chatType: {
        type: String,
        enum: ['individual', 'group'],
        required: true
    },
    chatName: {
        type: String, // this chatName is required for group chat
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    participants: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ['member', 'admin', 'creator'],
                default: 'member'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;