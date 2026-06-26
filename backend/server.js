const app = require('./app')
const dotenv = require('dotenv')
const connectDataBase = require('./config/database')

//adding any statement like console.log(youtube) : where youtube is not defined
process.on("uncaughtException",(err)=>{
    console.log(`${err} \n Shutting down Server : UnCaught Exception\n`)
    
    server.close(()=>{
        process.exit(1)
    })
})


dotenv.config({path:"backend/config/config.env"})


connectDataBase()
const server =app.listen(process.env.PORT,()=>{console.log(`Server Started! : Working on ${process.env.PORT}`)})

process.on("unhandledRejection",(err)=>{
    console.log(`${err} \n Shutting down Server : Unhandled Promise Rejection`)

    server.close(()=>{
        process.exit(1)
    })
})