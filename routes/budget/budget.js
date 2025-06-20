const express = require('express');
const router = express.Router();
const {createBudget, addBudget, getBudget, subtractBudget}  = require('../../controllers/budgetController');

router.post('/make', createBudget);
router.post('/add', addBudget);
router.get('/', getBudget);
router.post('/subtract', subtractBudget);

module.exports = router;
