const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
    }
    catch(error){

    }
};


exports.showAllCategories = async (req, res) => {
    try{

    }
    catch(error){

    }
};

exports.categoryPageDetails = async (req, res) => {
    try{
        //get categoryId
        const categoryId = req.body;
        //get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();
        //validation
        if(!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Data Not Found',
            });
        }
        //get courses for different categories
        const differentCategories = await Category.find({
            _id: {$ne: categoryId},
        })
        .populate("courses")
        .exec();
        //get top selling courses
        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            },
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