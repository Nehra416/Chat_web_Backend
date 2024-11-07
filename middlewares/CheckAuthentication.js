const jwt = require('jsonwebtoken');

const checkAuthentication = (req, res, next) => {
    try {
        const { token } = req.cookies;

        // Check token is present or not in user's browser
        if (!token) {
            return res.status(400).json({
                message: 'Pls, LogIn first',
                success: false
            })
        }

        // Check that token
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)
        if (!tokenData) {
            return res.status(400).json({
                message: 'Invalid',
                success: false
            })
        }
        // console.log("jwt data is:", tokenData)

        // send tokenData with req
        req.user = tokenData._id;
        req.token = tokenData;
        next();

    } catch (error) {
        console.log("Error in checkAuthentication :", error)
    }
}

module.exports = checkAuthentication;