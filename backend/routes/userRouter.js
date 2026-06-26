const express = require('express')
const {registerUser,loginUser,logoutUser,forgotPassword, resetPassword, getMyDetails, updatePassword,updateProfile,getAllusers,getSingleUser,deleteProfile,updateRoles} = require('../controllers/userController')
const {isAuthenticatedUser,authorizeRoles} = require('../middleware/authentication')
const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(isAuthenticatedUser,logoutUser)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').put(resetPassword)
router.route('/me').get(isAuthenticatedUser ,getMyDetails)
router.route('/update-password').patch(isAuthenticatedUser ,updatePassword)
router.route('/me/update').patch(isAuthenticatedUser ,updateProfile)
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles("admin"),getAllusers)
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProfile).put(isAuthenticatedUser,authorizeRoles("admin"),updateRoles)



module.exports = router