const catchasyncerror = require("./catchasyncerror");
const ErrorHandler = require('../utils/errorHandler')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const isAuthenticatedUser = catchasyncerror(async(req,res,next )=>{
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("Please Login first!",401))
    }
    
    const decodedData = jwt.verify(token,process.env.JWT_SECRET)

    req.user = await User.findById(decodedData.id)

    next();

})

const authorizeRoles = (...roles)=> {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
           return next(new ErrorHandler(`User with role: ${req.user.role} is authorized to acess this resource`,403))
        }
        next();
    }
}

module.exports = {isAuthenticatedUser,authorizeRoles}