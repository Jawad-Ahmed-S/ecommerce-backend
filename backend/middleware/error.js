const ErrorHandler = require('../utils/errorHandler')

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode ||500
    err.message = err.message || "Internal Server Error"

//mongodb id error
    if(err.name === "CastError"){
        const message = `Resource Not Found. Invalid ${err.path}`
        err = new ErrorHandler(message,400)
    }
//duplicate key error
    if(err.code === "11000"){
        const message = `Duplicate ${Object.keys(err.keyValue)} Enterned!`
        err = new ErrorHandler(message,400)
    }
//jwt error
if(err.name === "jsonWebTokenError"){
    const message = `JSON Web Token is invalid, try again`
    err = new ErrorHandler(message,400)
}

//jwt expired  error
    if(err.name === "TokenExpiredError"){
        const message = `JSON Web Token is Expired , try again`
        err = new ErrorHandler(message,400)
    }

    res.status(err.statusCode).json({
        sucess:false,
        message:err.message 
    })
}

