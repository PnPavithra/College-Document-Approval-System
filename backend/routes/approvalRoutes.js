const router = require('express').Router();
const { approveDocument } = require('../controllers/approvalController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, allowRoles('guide', 'hod', 'admin'), approveDocument);

module.exports = router;
