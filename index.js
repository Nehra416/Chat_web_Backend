require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser')

// PORT number of server
const PORT = process.env.PORT || 8000;

// Connect to MongoDB database 
const DbConnection = require('./config/DbConnection');
DbConnection();

// Middlewares...
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true, // Allow cookies to be sent 
    }
));


// Routes...
const UserRoutes = require("./routes/UserRoutes");
const ChatRoutes = require("./routes/ChatRoutes");

app.use("/user", UserRoutes);
app.use("/chat", ChatRoutes);


// Start the Server
app.listen(PORT, () => {
    console.log(`Server is started at PORT: ${PORT}`)
});