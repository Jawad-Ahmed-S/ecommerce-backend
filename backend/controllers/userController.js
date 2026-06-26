
const User = require("../models/userModel")
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middleware/catchasyncerror')
const sendToken = require('../utils/jwt')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

const registerUser = catchAsyncError(async (req,res,next)=>{

    const {name,email,password} = req.body

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"Sample",
            url:"sample"
        }
        
    })
     sendToken(user,200,res)
})

const loginUser = catchAsyncError(async (req,res,next)=>{
    const {email,password} = req.body
    if(!email || !password){
        return next(new ErrorHandler("Please Enter both password and email",400))
    }
    
    const user = await User.findOne({email:email}).select("+password")
    if(!user){
        return next(new ErrorHandler("User Not Found",404))
    }
    
    const isPasswordMatched =await  user.comparePassword(password)
    
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password",400))
    }
    
    sendToken(user,200,res);

})

const logoutUser = catchAsyncError(async (req,res,next)=>{

    res.cookie('token',null,{
        expires: new Date(Date.now()), 
        httpOnly:true
    })

    res.status(200).json({sucess:true,message:"Logged out Sucessfully!"})
})

const forgotPassword = catchAsyncError(async (req,res,next)=>{
    
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not Found",404))
    }

    const resetPasswordToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false})
    

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/reset-password/${resetPasswordToken}`
    console.log(resetPasswordUrl)
    const mailMessage = `Your password reset url is here: \n\n ${resetPasswordUrl} \n\n. If you haven't Requested this then, ignore this mail.`
    try {
        
        await sendEmail({
            email:user.email,
            subject: `Ecommerce Recovery Mail`,
            mailMessage,
        })

        res.status(200).json({success:true,message:`Email Sent to ${user.email}`})

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message,500))
    }


})

const resetPassword = catchAsyncError(async (req,res,next)=>{

    
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset Passowrd toekn is invalid or expired",404))
    }
    
    if(req.body.password != req.body.confirmPassword){
        return next(new ErrorHandler("Password doesnt match with the confirm password",404))
    }


    user.password = req.body.password
    user.resetPasswordToken= undefined
    user.resetPasswordExpire =undefined

    await user.save()

    sendToken(user,200,res);
})

const getMyDetails = catchAsyncError(async (req,res,next)=>{

    const user =await  User.findById(req.user.id)

    res.status(200).json({sucess:true,user})
}) 

const updatePassword = catchAsyncError(async (req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await  user.comparePassword(req.body.oldPassword)
    
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password",400))
    }

    if(req.body.newPassword !==req.body.confirmPassword ){
        return next(new ErrorHandler("Password doesn't match.",400));
    }

    user.password = req.body.newPassword
    await user.save()
    
    sendToken(user,200,res)

}) 
const updateProfile = catchAsyncError(async (req,res,next)=>{
    
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id,newUserData)

    res.status(200).json({sucess:true,updatedUser})

}) 

const getAllusers = catchAsyncError(async (req,res,next)=>{
    const users = await User.find();

    res.status(200).json({sucess:true,users})
})


const getSingleUser = catchAsyncError(async (req,res,next)=>{

    const user =await  User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler("User not found!",404))
    }



    res.status(200).json({sucess:true,user})
}) 

const updateRoles = catchAsyncError(async (req,res,next)=>{
    

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id,newUserData)

    res.status(200).json({sucess:true,updatedUser})

}) 
const deleteProfile = catchAsyncError(async (req,res,next)=>{
    
    const user =await User.findById(req.params.id)


    if(!user){
        return next(new ErrorHandler("User not found!",404))
    }


    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({sucess:true,user,message:"user Deleted Sucessfully!"})

}) 



module.exports = {registerUser,loginUser,logoutUser,forgotPassword,resetPassword,getMyDetails,updatePassword,updateProfile,getAllusers,getSingleUser,updateRoles,deleteProfile}