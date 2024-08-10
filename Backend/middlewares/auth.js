const jwt = require('jsonwebtoken');
const User = require('../models/User');
require("dotenv").config()


//auth
exports.auth = async (req, res, next) => {
    try{
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer", "");

        //if token is missing, then return response
        if(!token) {
            return resizeBy.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }

        //verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET );
            console.log(decode);
            req.user = decode;
        }
    catch (error){
        //if verification has an issue
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
    next();
}
catch (error){
    return res.status(401).json({
        success: false,
        message: 'Something went wrong while validating the token',
    });
}
};

//isStudent
exports.isStudent = async (req, res, next) => {
    try{
            if(req.user.accountType !== "Student") {
                return res.status(401).json({
                    success: false,
                    message: 'You are not a student',
            });
        }
        next();
    }
    catch (error){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while verifying user',
        })
    }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
    try{
            if(req.user.accountType !== "Instructor") {
                return res.status(401).json({
                    success: false,
                    message: 'You are not a Instructor',
            });
        }
        next();
    }
    catch (error){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while verifying user',
        })
    }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try{
            if(req.user.accountType !== "Admin") {
                return res.status(401).json({
                    success: false,
                    message: 'You are not a Admin',
            });
        }
        next();
    }
    catch (error){
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while verifying user',
        })
    }
};