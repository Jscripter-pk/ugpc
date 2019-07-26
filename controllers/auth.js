const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
require('dotenv').config();
const User = require('../models/users');
const {sendEmail} = require("../helpers");


exports.studentSignup = async (req, res)=>{
    console.log(Math.floor(Math.random() * 100000000));
    const userExists = await User.findOne({email: req.body.email});
    if (userExists) return res.status(403).json({
        error: "Email Already Exists"
    });
    const emailVerCode = Math.floor(Math.random() * 100000000);

    const user = await new User({
        ...req.body,
        emailVerificationCode: emailVerCode
    });
    const student = await user.save();
    if (student){
        const {email}=req.body;
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Email Verification Instructions",
            text: `Please use the following code for email verification ${emailVerCode}`,
            html: `<p>Please use the following code for email verification</p> <h3>${emailVerCode}</h3>`
        };

        sendEmail(emailData)
            .then(()=>{
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Please check your email for verification`
                });
            });
    }
};

exports.verifyEmail = (req, res) => {
    const { emailVerificationCode,email } = req.body;

    User.findOne({$and:[{email},{emailVerificationCode}]}).then(user => {
        // if err or no user
        if (!user)
            return res.status(401).json({
                error: "Invalid Code!"
            });


        const updatedFields = {
            isEmailVerified:true,
            emailVerificationCode: undefined
        };

        Object.assign(user,updatedFields);


        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Your Email Has been verified.`
            });
        });
    });
};

// add forgotPassword and resetPassword methods
exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: "No request body" });
    if (!req.body.email)
        return res.status(400).json({ message: "No Email in request body" });

    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "User with that email does not exist!"
            });

        // generate a token with user id and secret
        const token = jwt.sign(
            { _id: user._id, iss: "NODEAPI" },
            process.env.JWT_SECRET
        );

        // email data
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};


exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "Invalid Link!"
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
        };

        Object.assign(user,updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};





exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth'
});