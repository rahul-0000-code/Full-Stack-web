const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


//send otp
exports.sendOTP = async (req, res) => {
    //fetching email from req body
    try{
        const {email} = req.body;

    //checking if user already exists
    const checkUserPresent = await User.findOne({email});

    //if user already exist, then return a response
    if(checkUserPresent) {
        return res.status(401).json({
            success: false,
            message: "User already exists",
        })
    }

    var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    console.log("Otp generated successfully", otp);

    //checking if the otp is unique or not
    const result = await OTP.findOne({otp: otp});
    while(result) {
        otp = otpGenerator(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        result = await OTP.findOne({otp: otp});
    }

    const otpPayload = {email, otp};

    //create an entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return resposne successfully
    res.status(200).json({
        success: true,
        message: "OTP Sent Successfully",
        otp,
    })
}
catch(error){
    console.log(error);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
}

    //generate otp

};

//signup
exports.signUp = async (req, res) => {

    try{
        //data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
        })
    }
        //check 2 matchable passwords, confirm password and normal password
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Passwords do not match, please try again"
            });
        }

        //check if user already exists
        const existinUser = await User.findOne({email});
        if(existinUser){
            return res.status(400).json({
                success: false,
                message: "User already exists",
                });
            }

        //find most recent OTP stored for user
        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(recentOtp);

        //validate otp
        if(recentOtp.length == 0){
            return res.status(400).json({
                success: false,
                message: "OTP not found",
                });
        } else if(otp !== recentOtp.otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in DB

        const profileDetails = await profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            accountType,
            password: hashedPassword,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //return resposne
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        })
    }

 catch(error){
    console.log(error);
    return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again later",   
        });
    }
}

//Login
exports.login = async (req, res) => {
    try{
        // get data from req body
        const {email, password} = req.body;
        
        //validating the data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password",
                });
        }

        //user exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        //generate jwt after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            }); 
            user.token = token;
            user.password = undefined;       
        //create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: 'Logged in successfully'

        })
    }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure, please try again",
        });
    }
};

//changePassword
exports.changePassword = async (req, res) => {
    try {
        //get data from req body
        //get oldPassword, newPassword, confirmPassword
        //validation
        //update pwsd in DB
        //send mail for updated password
        //return response

    }
    catch(error){

    }
};