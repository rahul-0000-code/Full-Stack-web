const mongoose = require('mongoose');

//define the tags schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: 
    { 
        type: String
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
});


//export the tag model
module.exports = mongoose.model("Category", categorySchema);