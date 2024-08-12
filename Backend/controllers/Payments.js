const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../")



//capturing the payment and initianting the razorpay order
exports.capturePayment = async(req, res) => {
    //get courseId and userId
    const {course_id} = req.body;
    const userId = req.user.id;
    //validation
    //valid courseId
    if(!course_id) {
        return res.json({
            success: false,
            message: "Course Id is required"
        })
    };
    //valid courseDetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course) {
            return res.json({
                success: false,
                message: "Course not found"
            });
        }

        //user already paid for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return res.json({
                success: false,
                message: "You have already enrolled for this course"
            })
        }
    }
    catch(error){
        console.error(error);
        return res.json({
            success: false,
            message: "Error fetching course details"
            });
    }

    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId :course_id,
            userId,
        }
    };

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        //return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount
        })
    }
    catch(error){
        console.log(error);
        return res.json({
            success: false,
            message: "Could not inititate order"
            });
    }

};

//verify signature of razorpay and server

exports.verifySignature = async (req, res) => {
    const webhookSecret = "1234GETONTHEDANCEFLOOR";

    const signature = req.header["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is authorized");

        const {courseId, userId} = req.body.payload.payment.entity.notes;  

        try{
            //fulfill the action
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id: courseId},
                {$push: {studentsEnrolled: userId}},
                {new: true},
            );

            if(!enrolledCourse) {
                return res.json({
                    success: false,
                    message: "Could not enroll student in course"
                    });
            }
            console.log(enrolledCourse);

            //find the student and add the course to their list of enrolled course
            const enrolledStudent = await User.findOneAndUpdate(
                {_id: userId},
                {$push: {courses: courseId}},
                {new: true},
            );
            console.log(enrolledCourse);

            //sending mail of confirmation
            const emailResponse = await mailSender(
                enrolledStudent. email,
                "Congratulations from Placify",
                "Congratulations, you are on onboarded on a new placify's course",
            )
            console.log(emailResponse)
            return res.status(200).json({
                success: true,
                message: "Signature verified and course added"
            });
        }
        
        catch(error){
            console.log(error);
            res.status(500).json({
            success: false,
            message: error.message,
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            message: "Invalid request"
        });
    }
};