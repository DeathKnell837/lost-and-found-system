const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// User routes (require authentication)
router.get('/form/:itemId', isAuthenticated, claimController.getClaimForm);
router.post('/submit/:itemId', isAuthenticated, upload.array('proofImages', 3), claimController.submitClaim);
router.get('/my-claims', isAuthenticated, claimController.getMyClaims);
router.get('/details/:claimId', isAuthenticated, claimController.getClaimDetails);
router.post('/withdraw/:claimId', isAuthenticated, claimController.withdrawClaim);

module.exports = router;
