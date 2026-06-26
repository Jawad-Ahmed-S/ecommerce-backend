const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name']
        
    },
    email:{
        type:String,
        required:[true,'Please enter your email'],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,'Please enter your password'],
        minLength:[8,'Password should be greater than 8 characters'],
        select:false
    },
    avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
    role:{
        type:String,
        default:"User"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
    
})

userSchema.pre("save" ,async function(){
    
    if(!this.isModified("password")){
        return;
    }

    this.password =await bcrypt.hash(this.password,10)
    
})

userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}

userSchema.methods.comparePassword = function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getResetPasswordToken = function(){
    
    const resetToken = crypto.randomBytes(20).toString("hex")

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 15 * 60 *60 *1000;

    return resetToken;
}

module.exports = mongoose.model("User",userSchema);