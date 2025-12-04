const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { apiRateLimit, validateObjectIdParams } = require('../middleware/security');

// User routes (require authentication with validation)
router.get('/form/:itemId', isAuthenticated, validateObjectIdParams('itemId'), claimController.getClaimForm);
router.post('/submit/:itemId', isAuthenticated, apiRateLimit, validateObjectIdParams('itemId'), upload.array('proofImages', 3), claimController.submitClaim);
router.get('/my-claims', isAuthenticated, claimController.getMyClaims);
router.get('/details/:claimId', isAuthenticated, validateObjectIdParams('claimId'), claimController.getClaimDetails);
router.post('/withdraw/:claimId', isAuthenticated, apiRateLimit, validateObjectIdParams('claimId'), claimController.withdrawClaim);

module.exports = router;
