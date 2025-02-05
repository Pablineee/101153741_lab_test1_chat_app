// Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user');

// Signup endpoint
router.post('/signup', async (req, res) => {
    const { username, firstname, lastname, password } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword
        });

        // Save newly created user to database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' })
    } catch (err) {
        // Unsuccessful user registration
        res.status(500).json({ error: err.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username});
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare provided password with hashed password stored in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // On successful login, return user info
        res.status(200).json({
            message: 'Login successful',
            user: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            }
        })
    } catch (err) {
        // Unsuccessful login attempt
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;