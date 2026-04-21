const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(
        (hash) => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save().then(
                () => {
                    res.status(201).json({
                        message: 'User added successfully!'
                    });
                }
            ).catch(
                (error) => {
                    res.status(500).json({
                        error: error
                    });
                }
            );
        }
    );
};

exports.login = (req, res, next) => {
    //check if the user exists by checking the email address
    User.findOne({ email: req.body.email }).then(
        (user) => {
            if (!user) {
                return res.status(401).json({
                    error: new Error('User not found!')
                });
            }

            //if the user does exist we compare the password typed in with the hashed value from db
            bcrypt.compare(req.body.password, user.password).then(
                (valid) => {
                    console.log("PASSWORD VALID:", valid);
                    if (!valid) {
                        return res.status(401).json({
                            error: new Error('Incorrect password')
                        });
                    }
                    //valid
                    const token = jwt.sign(
                        { userId: user._id },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' });
                    res.status(200).json({
                        userId: user._id,
                        token: token
                    });
                }
                //not valid
            ).catch(
                (error) => {
                    console.error("BCRYPT ERROR:", error);
                    res.status(500).json({
                        error: error
                    });
                }
            );
        }
        //user doesnt exist
    ).catch(
        (error) => {
            console.error("USER FIND ERROR:", error);
            res.status(500).json({
                error: error
            });
        }
    );
};