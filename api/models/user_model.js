const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true, // Ensure email is unique
        lowercase: true, // Convert email to lowercase
        trim: true // Remove leading/trailing whitespaces
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    }
});

// Method to generate a verification token
UserSchema.methods.generateVerificationToken = function () {
    const user = this;
    const verificationToken = jwt.sign(
        { ID: user._id },
        // process.env.USER_VERIFICATION_TOKEN_SECRET,
        'secret',
        { expiresIn: "7d" }
    );
    return verificationToken;
};

// Pre-save hook to generate a verification token before saving the user
UserSchema.pre('save', async function (next) {
    const user = this;

    // Check if the user is new or the email has been modified
    if (user.isNew || user.isModified('email')) {
        user.verified = false; // Set verification status to false
        // You can also add additional checks or validations here before generating the token
        user.verificationToken = user.generateVerificationToken();
    }

    next();
});

module.exports = mongoose.model("User", UserSchema);
