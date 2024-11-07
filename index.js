const express = require('express');
const app = express();

// PORT number of server
const PORT = 8000;

// define route
app.get('/', (req, res) => {
    res.send("Welcome in Chat web");
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is started at PORT: ${PORT}`)
});