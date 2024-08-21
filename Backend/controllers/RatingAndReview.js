const RatingAndReview = require("../models/RatingAndReview")
const Course = require("../models/Course");

//createRating
exports.createRating = async (req, res) => {
    try{
         //get userId
         const userId = req.user.id;
         //fetchdata from req body
         const {rating, review, courseId} = req.body;
         //check if user is enrolled or not
         const courseDetails = await courseId.findOne(
            {_id:courseId,
            studentsEnrolled: {$elemMatch: {$req: userId}},
    });

    if(!courseDetails) {
        return res.status(400).json({message: "You are not enrolled in this course"});
    }
         //check if user already reviewed the course
         const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
         });
         if(alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "You have already reviewed this course",
            })
         }
         //create rating and review
         const ratingReview = await RatingAndReview.create({
             rating, review,
             course: courseId,
             user: userId,
         });
         //update the course with rating/review
         const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId}, 
            {
                $push: {
                    ratingsAndReviews: ratingReview._id,
                }
            },
            {new: true});
            
            console.log(updatedCourseDetails, "loggin course after update");
         //return response
         return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            ratingReview,
         })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })

    }
}

//getAverageRating
exports.getAverageRating = async (req, res) => {
    try{
        //get courseId
        const courseId = req.body.courseId;
        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
            },
        },
        {
            $group:{
                _id: null,
                averageRating: { $avg: "$rating" },
            } 
        }
        ])
        //return rating
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Average rating retrieved successfully",
                averageRating: result[0].averageRating,
                })

        }
        //if no review/rating exists
        return res.status(200).json({
            success: true,
            message: "No reviews/ratings exist for this course",
            averageRating: 0,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

//getAllRatingAndReviews
exports.getAllRating= async(req, res) => {
    try{
        const allReviews = await RatingAndReview.find({})
        .sort({rating: "desc"})
        .populate({
            path:"user",
             select:"firstName lastName email image"
        })
        .populate({
            path: "course",
            select: "courseName",
        })
        .exec(); 

        return res.status(200).json({
            success: true,
            message: "All reviews retrieved successfully",
            data: allReviews,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


//ForCourseSepcifcGetRatingAndReviews