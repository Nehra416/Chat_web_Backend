const cloudinary = require('cloudinary').v2;

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});


const uploadToCloudinary = async (imgPath) => {
    try {
        const imgResult = await cloudinary.uploader.upload(imgPath, {
            quality: "auto:low",
            folder: "Chat_web",
            resource_type: 'image'
        })
        // return the image url from the cloudinary
        return imgResult.secure_url;
    } catch (error) {
        res.send("error=>", error)
    }
}

module.exports = uploadToCloudinary;