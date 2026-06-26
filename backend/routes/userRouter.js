const express = require('express')
const {registerUser,loginUser,logoutUser,forgotPassword, resetPassword} = require('../controllers/userController')

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(logoutUser)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').put(resetPassword)



module.exports = router