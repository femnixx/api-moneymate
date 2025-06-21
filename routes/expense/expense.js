const express = require('express');
const router = express.Router();
const {addExpense, deleteExpense, updateExpense, getExpense, getExpenseSum} = require('../../controllers/expenseController');

router.post('/add', addExpense);
router.get('/list', getExpense);
router.put('/edit/:expenseId', updateExpense);
router.delete('/delete/:expenseId', deleteExpense);
router.get('/sum', getExpenseSum);

module.exports = router;