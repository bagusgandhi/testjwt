require('dotenv').config();
require('./config/database').connect();

const express = require('express');
const bcrypt = require('bcryptjs');

const app = express();
const User = require('./model/user');
const jwt = require('jsonwebtoken');

app.use(express.json());

app.post("/register", async (req, res) => {
    try{
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    }catch(err){
        console.log(err);
    }
});

app.post("/login", (req, res) => {
    
});

module.exports = app;