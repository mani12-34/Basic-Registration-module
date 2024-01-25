
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const User = require('../models/user_model.js');
const jwt = require('jsonwebtoken');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
       user: process.env.EMAIL_USERNAME,
       pass: process.env.EMAIL_PASSWORD,
    },
});
exports.signup = async (req, res) => {
    const { email } = req.body
    // Check we have an email
    if (!email) {
       return res.status(422).send({ message: "Missing email." });
    }
    try{
       // Check if the email is in use
       const existingUser = await User.findOne({ email }).exec();
       if (existingUser) {
          return res.status(409).send({ 
                message: "Email is already in use."
          });
        }
       // Step 1 - Create and save the user
       const user = await new User({
          _id: new mongoose.Types.ObjectId,
          email: email
       }).save();
       // Step 2 - Generate a verification token with the user's ID
       const verificationToken = user.generateVerificationToken();
       // Step 3 - Email the user a unique verification link
       const url = `http://localhost:3000/api/verify/${verificationToken}`
       transporter.sendMail({
         to: email,
         subject: 'Verify Account',
         html: `Click <a href = '${url}'>here</a> to confirm your email.`
       })
       return res.status(201).send({
         message: `Sent a verification email to ${email}`
       });
   } catch(err){
       return res.status(500).send(err);
   }
}
exports.login = async (req, res) => {
    const { email } = req.body
    // Check we have an email
    if (!email) {
        return res.status(422).send({ 
             message: "Missing email." 
        });
    }
    try{
        // Step 1 - Verify a user with the email exists
        const user = await User.findOne({ email }).exec();
        if (!user) {
             return res.status(404).send({ 
                   message: "User does not exists" 
             });
        }
        // Step 2 - Ensure the account has been verified
      //   if(!user.verified){
      //        return res.status(403).send({ 
      //              message: "Verify your Account." 
      //        });
      //   }
        return res.status(200).send({
             message: "User logged in"
        });
     } catch(err) {
        return res.status(500).send(err);
     }
}

exports.verify = async (req, res) => {
   try {
     const token = req.params.token;
 
     if (!token) {
       return res.status(403).send("A token is required for authentication");
     }
 
     const decode = jwt.verify(token, 'secret');
     const user = await User.findOne({ _id: decode.ID });
 
     if (!user) {
       return res.status(404).send("User not found");
     }
 
     user.verified = true;
     await user.save();
 
     return res.status(200).send('<h1>Successfully verified</h1>');
   } catch (err) {
     console.error('Error during verification:', err.message);
     return res.status(401).send("Token verification failed");
   }
 };
