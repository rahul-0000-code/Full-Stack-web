const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
    try{    
        //get email for request body
        const email = req.body.email;

        //check user for this email, i.e email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.status(404).json({message: "Your email is not registered"});
        }

        //generate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            {email: email}, 
            {
                token: token, 
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
        {new: true});

        //create url
        const url = `http://localhost:3000/update-password/${token}`

        //send mail containing the url
        await mailSender(email,
                        "Password Reset Link",
                        `Please click on the link to reset your password: ${url}`);

        //return response
        return res.json({
            success: true,
            message: "Password reset link sent to your email",
        });
    }
    catch (error){
        console.log(error);
        return res.status(500).json({message: "Something went wrong, while sending reset password email"});
    }
}

//resetPassword
exports.resetPassword = async(req, res) => {
    try{
        //data fetch
        const {password, confirmPassword, token} = req.body;

        //validation
        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Passwords do not match",
            });
        }

        //get userDetails from DB using token
        const userDetails = await User.findOne({token: token});

        // if no entry found, then it s inavlid token
        if(!userDetails) {
            return res.json({
                success: false,
                message: "Token is invalid",
                });
        }

        //token time check
        if (userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message: "Token has expired",
                });
        }

        //hash paswword
        const hashedPassword = await bcrypt.hash(password, 10);

        //update password in DB
        await User.findOneAndUpdate({token: token}, {password: hashedPassword}, {new: true},
        );

        //return res
        return res.status(200).json({
            success: true,
            message: 'Password reset successfull'
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Password reset failed, please try again later'
        });
    }
}