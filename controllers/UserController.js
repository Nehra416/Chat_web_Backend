const User = require("../modles/UserSchema");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const uploadToCloudinary = require('../config/Cloudinary');
const sendOTP = require('../config/NodeMailer');
const fs = require('fs');
let data = {};
let isOtpVerified = {};


const signup = async (req, res) => {
    const { userName, nickName, email, password, receivedOTP } = req.body;

    try {

        if (!receivedOTP) {

            // Check that all fields are given
            if (!userName || !email || !password || !nickName) {
                return res.status(400).json({ message: "All fields are required", success: false })
            }

            // Check userName already exists or not in the database
            const user = await User.findOne({ userName })
            if (user) {
                return res.status(400).json({ message: "Username already exists", success: false })
            }

            // Hashing the Password
            const hashPassword = await bcrypt.hash(password, 10);

            // OTP send to the email by the nodemailer
            const otp = sendOTP(email);
            console.log("OTP is :", otp);

            // store data as a object
            data[email] = { userName, nickName, email, hashPassword, otp };

            // otp or data object delete after some x time impliment pending ??

            return res.status(201).json({
                message: 'OTP Send to Your Email',
                success: true
            })
        } else {
            try {
                console.log("data object:", data);
                if (!email) {
                    return res.status(400).json({ message: "Email is required", success: false })
                }

                if (!data[email]) {
                    return res.status(400).json({ message: "Something went wrong in OTP verify", success: false });
                }

                // we need only to send otp & email from frontend at otp verify time
                const { userName, nickName, hashPassword, otp } = data[email];

                if (otp == receivedOTP) {
                    // Now create a new user
                    await User.create({ userName, nickName, email, hashPassword })

                    // delete the email object of the user
                    delete data[email];

                    return res.status(201).json({
                        message: "New Account created successfully", success: true
                    })
                } else {
                    return res.status(400).json({
                        message: "OTP is Wrong", success: false
                    })
                }

            } catch (error) {
                console.log("Error in the otpVerifyForSignup :", error)
            }
        }

    } catch (error) {
        console.log("Error in signup ", error)
    }
}

const signin = async (req, res) => {
    try {
        const { userName, password } = req.body;

        // Check that all fields are given
        if (!userName || !password) {
            return res.status(400).json({ message: "All fields are required", success: false })
        }

        // Check the UserName is exist or not 
        let user = await User.findOne({ userName })
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false })
        }

        // Compare with user's password from DB
        const isValidPwd = await bcrypt.compare(password, user.hashPassword);

        // Check the password is correct or not
        if (!isValidPwd) {
            return res.status(401).json({ message: "InCorrect Password", success: false })
        }

        user = await User.findOne({ userName }).select("-hashPassword ")

        // Generate a JWT token for the client
        const token = jwt.sign({ _id: user._id, userName: user.userName, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })

        // return the response with the token
        return res.cookie('token', token, { httpOnly: true, maxAge: 48 * 60 * 60 * 1000 }).status(201)
            .json({
                message: `Welcome ${user.userName}`,
                success: true,
                user: user
            });

    } catch (error) {
        console.log("Error in signin ", error)
    }
}

const verifyOtpForForgetPassword = async (req, res) => {
    try {
        const { userName, receivedOTP } = req.body;

        if (!receivedOTP) {

            // userName is required for further process
            if (!userName) {
                return res.status(404).json({
                    message: 'UserName is Required',
                    success: false
                })
            }

            // check the user exist or not
            const user = await User.findOne({ userName })
            if (!user) {
                return res.status(404).json({
                    message: "Can't found Account",
                    success: false
                })
            }

            // send otp to the email of client and save the otp in data object for comparision
            const otp = sendOTP(user.email);
            console.log("OTP:", otp);
            data[userName] = otp;

            // return with a success message
            return res.status(201).json({
                message: 'OTP Send to your Email',
                success: false
            })
        } else {
            try {
                // for otp verification user needs to send userName and otp only
                const otp = data[userName];

                // if receivedOTP is wrong then return back
                if (otp != receivedOTP) {
                    return res.status(400).json({
                        message: 'OTP Wrong',
                        success: false
                    })
                }

                // delete the otp object for this username
                delete data[userName];

                // set true for otp verification user
                isOtpVerified[userName] = true;

                // return with success message
                return res.status(201).json({
                    message: 'Verification Successfully',
                    success: true
                })

            } catch (error) {
                console.log("Error in verifyOtp :", error)
            }
        }

    } catch (error) {
        console.log("Error in sendOtpForForgetPwd :", error)
    }
}


const updateForgetPassword = async (req, res) => {
    try {
        const { userName, newPassword } = req.body;

        // Check that userName is exixt or not
        const user = await User.findOne({ userName })
        if (!user) {
            return res.status(404).json({
                message: "Can't found Account",
                success: false
            })
        }

        // check that is that user verified the otp in last step or not
        if (!isOtpVerified[userName]) {
            return res.status(400).json({
                message: "Verified by Email OTP first",
                success: false,
            })
        }

        // Hashing the password then update the pwd in db
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.hashPassword = hashedPassword;
        await user.save();

        // delete the isOtpVerified object 
        delete isOtpVerified[userName];

        return res.status(201).json({
            message: 'Password is Updated',
            success: false
        })

    } catch (error) {
        console.log("Error in updatePwd :", error)
    }
}

const updateUser = async (req, res) => {
    try {
        const { userName, nickName, password, newPassword } = req.body;
        const userId = req.user;
        const avatar = req.file;

        // Atleast one thing is required for further process
        if (!avatar && !userName && !newPassword && !nickName) {
            return res.status(404).json({
                message: 'Atleast one update parameter is required',
                success: false
            })
        }

        // check the user exist or not
        const userData = await User.findById(userId)
        if (!userData) {
            return res.status(400).json({
                message: "User can't found",
                success: false,
            })
        }

        // if user can send password then update 
        if (newPassword) {

            // Compare the recieved current password by hashing with the password in db
            const isPwdValid = await bcrypt.compare(password, userData.hashPassword);

            if (isPwdValid) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const updatedUser = await User.findByIdAndUpdate(userId, { hashPassword: hashedPassword }, { new: true }).select("-hashPassword")

                return res.status(400).json({
                    message: 'Password is Updated Successfully',
                    success: false,
                    user: updatedUser
                })
            } else {
                return res.status(400).json({
                    message: 'Current Password is Wrong',
                    success: false
                })
            }
        }

        // if user can send userName then update that
        if (userName) {

            // check that account is already exist or not on this userName
            const isValid = await User.findOne({ userName })
            if (isValid) {
                return res.status(400).json({
                    message: 'This userName is already taken',
                    success: false
                })
            }

            // if not exist then we will update the userName
            const updatedUser = await User.findByIdAndUpdate(userId, { userName }, { new: true }).select("-hashPassword")

            // return with update message
            return res.status(201).json({
                message: 'UserName updated Successfully',
                success: true,
                user: updatedUser
            })
        }

        // if user can nickName then update this
        if (nickName) {
            const updatedUser = await User.findByIdAndUpdate(userId, { nickName }, { new: true }).select("-hashPassword")

            // return with update message
            return res.status(201).json({
                message: 'NickName updated Successfully',
                success: true,
                user: updatedUser
            })
        }

        // if user can send avatarUrl for update profile then update it
        if (avatar) {
            // send the profile image to the cloudinary
            const ImgUrl = await uploadToCloudinary(avatar.path);
            if (!ImgUrl) {
                return res.status(400).json({
                    message: 'Error in Uploading',
                    success: false
                })
            }

            // update the profile string in the dataBase
            const updatedUser = await User.findByIdAndUpdate(userId, { avatarUrl: ImgUrl }, { new: true }).select("-hashPassword")

            // unlink the profile image from the local storage
            fs.unlink(avatar.path, (err) => {
                if (err) console.log(err);
            });

            // return the suucess message
            return res.status(201).json({
                message: 'Profile Updated Successfully',
                success: true,
                user: updatedUser
            })
        }

    } catch (error) {
        console.log("Error in UpdateUser :", error);
    }
}

const logout = async (_, res) => {
    try {
        // clear the cookie value so, the user logout
        res.clearCookie('token');
        return res.status(201).json({
            message: 'Logout Successfully',
            success: true
        })

    } catch (error) {
        console.log("Error in Logout :", error);
    }
}


module.exports = {
    signup, signin, updateUser, verifyOtpForForgetPassword, updateForgetPassword, logout,
}