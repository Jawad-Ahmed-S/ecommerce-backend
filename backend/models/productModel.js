const mongoose = require("mongoose")
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please enter product description"],
    },
    price:{
        type:Number,
        required:[true,"Please enter product price"],
    },
    average_rating:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"Please enter product category"],
    },
    stock:{
        type:Number,
        required:true,
        default:1
    },
    reviews:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref:'Review',
            
        }
    ]

})

module.exports = mongoose.model("Product",productSchema)