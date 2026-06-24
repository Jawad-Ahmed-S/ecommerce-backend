const express = require('express')
const errorMiddleware = require('./middleware/error')
const app =express()
const qs = require('qs')
app.set('query parser', (str) => qs.parse(str))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const product = require('./routes/productRoute')
app.use("/api/v1",product)
app.use(errorMiddleware)


module.exports = app