require('dotenv').config(); // This loads the .env file

const express = require('express');
const mongoose = require('mongoose');
const Notice = require('./models/Notice');
const app = express();

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err)=> console.log('MongoDB Connection Error:', err));

app.post('/api/notices', async (req, res) => {
    try {
        const newNotice = new Notice({
            title: req.body.title,
            content: req.body.content,
            department: req.bpdy.department
        });

        const savedNotice = await newNotice.save();
        res.status(201).json(savedNotice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/notices', async (req, res) => {
    try {
        const notices = await Notice.find().sort({ date: -1 }); // Sort by newest first
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('College Notice Board Server is Running.....!!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});