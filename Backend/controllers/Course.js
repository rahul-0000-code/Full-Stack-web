const Course = require('../models/Course');
const Tag = require("../models/Tags");
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');


//createCourse handler function
exports.createCourse = async(req, res) => {
    try {
        //fetch data
        const {courseName, courseDescription, whatWillYouLearn, price, tag} = req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "Please fill all the fields",
            });
        }


        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails, 'logging instructor details');

        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found",
            });
        }

        //check if given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details not found",
            });
        }

        //upload image to cloundiary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create an entry for new course 
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            insturctor: instructorDetails._id,
            whatWillYouLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        })

        //add the new course to user schema of instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {new: true},
        );

        //update the tag ka schema


        //return res
        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            data: newCourse,
        });
    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create a course",
        })    
    }
};

//getAll courses handler function
exports.showAllCourse = async (req, res) => {
    try{
        const allCourses = await Course.find({});
        
        return res.status(200).json({
            success: true,
            message: "All Courses Retrieved Successfully",
            data: allCourses,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get all courses",
            });

    }
}