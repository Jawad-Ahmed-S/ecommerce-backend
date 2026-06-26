const express = require('express')
const Product = require("../models/productModel")
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchasyncerror')
const ApiFeatures = require('../utils/apifeatures')
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
 
module.exports = {getAllProducts,getProduct,createProduct,updateProduct,deleteProduct}