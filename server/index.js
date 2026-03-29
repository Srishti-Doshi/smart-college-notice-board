require('dotenv').config(); // This loads the .env file

const express = require('express');
const app = express();

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
    res.send('College Notice Board Server is Running.....!!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});