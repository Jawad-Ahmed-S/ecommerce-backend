const express = require('express')
const Product = require("../models/productModel")
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchasyncerror')
const ApiFeatures = require('../utils/apifeatures')
const User = require('../models/userModel')


const getAllProducts = catchAsyncError(async function(req,res){ 

    const productCount = await Product.countDocuments();
    const resultPerPage = 5
    const apifeature = new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage)
    const products = await apifeature.query; 

    res.status(200).json({"sucess":true,products,productCount})
    
})

const createProduct = catchAsyncError(async function(req,res){ //admin
        const product = await Product.create(req.body)
        res.status(200).json({
        sucess:true,
        product
    })
}) 

const getProduct = catchAsyncError(async function(req,res,next){

    let product = await Product.findById(req.params.id) 
    
    if(!product){
        return next(new ErrorHandler("Product not found!",404))
    }
        res.status(200).json({"sucess":true,product})
       
})
const  updateProduct = catchAsyncError(async function(req,res,next){ //admin
    
    let product = await Product.findById(req.params.id)
    
    if(!product){
        return next(new ErrorHandler("Product not found!",404))
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body)
    res.status(200).json({"sucess":true,product})
    
})
const  deleteProduct = catchAsyncError(async function(req,res,next){ //admin
    
    let product = await Product.findById(req.params.id)
    
    if(!product){
        return next(new ErrorHandler("Product not found!",404))
    }
    product = await Product.findByIdAndDelete(req.params.id,req.body)
    res.status(200).json({"sucess":true,"message":"Deleted!"})

})

const createProductReview = catchAsyncError(async function(req,res,next){
    const {rating,comment} = req.body
    const productId = req.params.id
    
    const product = await Product.findById(productId)

    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }

    const review = {
        userId: req.user.id,
        rating: Number(rating),
        comment}
    
        const isReviewed = product.reviews.find(r=>r.userId.toString()===req.user.id)

        if(isReviewed){
            product.reviews.forEach((rev)=>{
                if(rev.userId.toString()===req.user.id.toString()){
                    rev.rating=rating,
                    rev.comment=comment
                }
            })
        }
        else{
            product.reviews.push(review);
        }

        let sum=0;

        product.reviews.forEach(rev=>{
            sum+=rev.rating
        })

        let avg = sum/product.reviews.length
        product.average_rating = avg

    await product.save()

    res.status(200).json({sucess:true,review})

})

const getAllReviews = catchAsyncError(async function(req,res,next){
    
    const product = await Product.findById(product.params.id)

     if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }

    res.status(200).json({sucess:true,reviews:product.reviews})
})

//pass product via query params and review via /:id 
const deleteReview = catchAsyncError(async function(req,res,next){
    
    const product = await Product.findById(req.query.productId)
   

     if(!product){
        return next(new ErrorHandler("Product Not Found",404))
    }
    const reviews = product.reviews.filter(
        (rev)=>rev._id.toString() !== req.params.id
    )
        let sum=0;

        reviews.forEach(rev=>{
            sum+=rev.rating
        })

        let avg = reviews.length === 0 ? 0 : sum / reviews.length;

        product.reviews = reviews
        product.average_rating = avg


        await product.save({ validateBeforeSave: false })
    
    res.status(200).json({sucess:true,message:"Review Deleted!"})
})
 
module.exports = {getAllProducts,getProduct,createProduct,updateProduct,deleteProduct,createProductReview,getAllReviews,deleteReview}