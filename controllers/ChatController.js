const mongoose = require("mongoose");
const Chat = require("../modles/ChatSchema");
const Message = require("../modles/MessageSchema");

const sendMessage = async (req, res) => {
    try {
        const userId = req.user;
        const { content } = req.body;
        const { senderId } = req.params;

        // can't send req with empty message field
        if (!content || content.trim() === '') {
            return res.status(400).json({
                message: "Can't send empty message",
                success: false
            })
        }

        // get the conversation between both
        const conversation = await Chat.findOne({
            $and: [
                {
                    participants: {
                        $elemMatch: { userId: new mongoose.Types.ObjectId(userId) }
                    }
                },
                {
                    participants: {
                        $elemMatch: { userId: new mongoose.Types.ObjectId(senderId) }
                    }
                }
            ]
        });

        // an optional or additional check
        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
                success: false
            });
        }

        // create a new message with the chatId of conversation between them
        const message = await Message.create({
            chatId: conversation._id,
            userId: userId,
            content: content.trim(),
        })

        // return with a success message and send the new message as the response
        return res.status(200).json({
            message: "Message sent successfully",
            success: true,
            newMessage: message
        })

    } catch (error) {
        console.log("Error in sendMessage:", error);
        return res.status(500).json({
            message: "Server error in sending message",
            success: false
        })
    }
}

const getAllMessage = async (req, res) => {
    try {
        const { senderId } = req.params;
        const userId = req.user;
        const { page, limit } = req.query;

        // check page and limit value
        if (page <= 0 || limit <= 0) {
            return res.status(400).json({
                message: "Page and limit need to be a positive integers.",
                success: false
            });
        }

        // check that conversation is started before between them
        let chat = await Chat.findOne({
            $and: [
                {
                    participants: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } }
                },
                {
                    participants: { $elemMatch: { userId: new mongoose.Types.ObjectId(senderId) } }
                }
            ]
        });

        // if conversation is not start before then create it
        if (!chat) {

            chat = await Chat.create({
                createdBy: userId, chatType: "individual", participants: [
                    {
                        userId: userId,
                        role: "creator"
                    },
                    {
                        userId: senderId,
                    }
                ]
            })
        }

        // find the all limited messages between both conversation (pagination)
        let allMessage = await Message.find({ chatId: chat._id })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        // reverse the order of the messages array so that newly message shown in the bottom in frontend
        allMessage = allMessage.reverse();

        // send all message if find otherwise send empty array
        return res.status(200).json({
            message: "All messages fetched successfully",
            success: true,
            allMessage: allMessage || []
        })

    } catch (error) {
        console.log("Error in getAllMessage:", error);
        return res.status(500).json({
            message: "Server error in getting all messages",
            success: false
        })
    }
}

const getUserChats = async (req, res) => {
    try {
        const userId = req.user;

        // find all conversation with this user (participants[0] userItself)
        const allChats = await Chat.find({
            participants: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } }
        }).populate({ path: 'participants.userId', select: 'userName nickName avatarUrl' })

        // send all chats if find otherwise send empty array
        return res.status(200).json({
            message: "All Chats fetched successfully",
            success: true,
            allChats: allChats || []
        })

    } catch (error) {
        console.log("Error in getUserChats:", error);
        return res.status(500).json({
            message: "Server error in findOut your Chats",
            success: false
        })
    }
}

const deleteMessage = async (req, res) => {
    try {
        const userId = req.user;
        const { messageId } = req.params;

        // find by Id and delete the message
        const message = await Message.findOneAndDelete({ _id: messageId, userId });
        if (!message) {
            return res.status(400).json({
                message: "No message found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Message Deleted",
            success: true
        })

    } catch (error) {
        console.log("Error in deleteMessage:", error)
        return res.status(500).json({
            message: "Server error in deleting the message",
            success: false
        })
    }
}

const editMessage = async (req, res) => {
    try {
        const userId = req.user;
        const { messageId } = req.params;
        const { content } = req.body;

        const message = await Message.findOne({ _id: messageId, userId });
        if (!message) {
            return res.status(400).json({
                message: "No message found",
                success: false
            })
        }

        message.content = content;
        await message.save();

        return res.status(200).json({
            message: "Message Updated",
            success: true
        })

    } catch (error) {
        console.log("Error in editMessage:", error)
        return res.status(500).json({
            message: "Server error in edit the message",
            success: false
        })
    }
}


module.exports = {
    sendMessage, getAllMessage, getUserChats, deleteMessage, editMessage
}