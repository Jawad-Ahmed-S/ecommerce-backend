const express = require('express');
const { getAllProducts,createProduct,updateProduct, deleteProduct, getProduct } = require('../controllers/productController');
const {isAuthenticatedUser,authorizeRoles} = require('../middleware/authentication')

const router = express.Router();


router.route('/products').get(getAllProducts)
router.route('/admin/products/new').post(isAuthenticatedUser,authorizeRoles("admin"),createProduct)
router.route('/admin/products/:id').put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizeRoles("admin"),    deleteProduct).get(getProduct)

router.route('/products/:id').get(getProduct)

module.exports = router