const mongoose = require('mongoose');

const DbConnection = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log('MongoDb is Connected'))
        .catch((err) => console.error("Error in MongoDb :", err))
}

module.exports = DbConnection;