const mongoose = require("mongoose");

const archivedSchema = new mongoose.Schema({
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
    archivedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Archived = mongoose.model("Archived", archivedSchema);
module.exports = Archived;