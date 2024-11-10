const mongoose = require("mongoose");
const Archived = require("../modles/ArchivedSchema")

const chatArchived = async (req, res) => {
    try {
        const userId = req.user;
        const { chatId } = req.params;

        // check that chat is already in archived or not
        const isArchieved = await Archived.findOne({ chatId });
        if (isArchieved) {
            return res.status(400).json({
                message: "Chat is Already archived",
                success: false
            })
        }

        // create a new archievd object for archived chat
        await Archived.create({
            userId, chatId
        })

        return res.status(200).json({
            message: "Chat is Archived",
            success: true
        })

    } catch (error) {
        console.log("Error in chatArchived:", error);
        return res.status(500).json({
            message: "Server error in chatArchived",
            success: false
        })
    }
}

const removeArchivedChat = async (req, res) => {
    try {
        const userId = req.user;
        const { chatId } = req.params;

        // find archived chat and delete it
        await Archived.findOneAndDelete({ chatId, userId })

        return res.status(200).json({
            message: "Chat is UnArchived",
            success: true
        })

    } catch (error) {
        console.log("Error in removeArchivedChat:", error);
        return res.status(500).json({
            message: "Error in removing chat from archived",
            success: false
        })
    }
}

const getArchivedChat = async (req, res) => {
    try {
        const userId = req.user;

        // get archieve chat with user info by the aggregation pipline
        const archivedChats = await Archived.aggregate([
            // match all documents which match with userId
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            // from the above doc. join the chat doc.
            {
                $lookup: {
                    from: "chats",
                    localField: "chatId",
                    foreignField: "_id",
                    as: "chats"
                }
            },
            // join the user doc by the userId in chat doc
            {
                $lookup: {
                    from: "users",
                    localField: "chats.participants.userId",
                    foreignField: "_id",
                    as: "users",
                }

            },
            // add a user field for taking a user from the participant array for sending on frontend (other then user)
            {
                $addFields: {
                    user: {
                        $arrayElemAt: ["$users", 1]
                    }
                },
            },
            // send only limit info of the user as a response and chatId
            {
                $project: {
                    user: {
                        userName: 1,
                        nickName: 1,
                        avatarUrl: 1
                    },
                    chatId: 1
                }
            }
        ])

        return res.status(200).json({
            message: "Archived Chats fetched Successfully",
            success: true,
            archivedChats: archivedChats || []
        })

    } catch (error) {
        console.log("Error in getArchivedChat:", error);
        return res.status(500).json({
            message: "Server error in getArchivedChat",
            success: false
        })
    }
}

module.exports = {
    chatArchived, removeArchivedChat, getArchivedChat
}