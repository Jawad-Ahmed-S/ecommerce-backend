const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    // userId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // },
    rating:{
        type:Number,
        required:true,
        default:0
    },
    comment:{
        type:String,
        required:true,

    }
})

module.exports = mongoose.model("Review",reviewSchema)