const multer = require('multer');

// const storage = multer.memoryStorage();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public');
    },
    filename: function (req, file, cb) {
        const suffix = Date.now()
        cb(null, suffix + '-' + file.originalname);
    }
})

const upload = multer({ storage: storage });

module.exports = upload;