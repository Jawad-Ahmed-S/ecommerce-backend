const express = require('express')
const errorMiddleware = require('./middleware/error')
const app =express()
const qs = require('qs')
const cookieParser = require('cookie-parser')



app.set('query parser', (str) => qs.parse(str))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
const product = require('./routes/productRoute')
app.use("/api/v1",product)

const user = require('./routes/userRouter')
app.use("/api/v1",user)

app.use(errorMiddleware)


module.exports = app