const express = require('express');
const router = express.Router();
const {
    makeCategories, addCategories, editCategories, deleteCategories, getCategories, getExpenseCount, getExpenseSum, getIdByCategory
    } = require('../../controllers/categoryController');

router.post('/make', makeCategories);
router.post('/add', addCategories);
router.put('/edit', editCategories);
router.delete('/del', deleteCategories);
router.get('/getC', getCategories);
router.get('/count/:categoryId', getExpenseCount);
router.get('/sum/:categoryId', getExpenseSum);
router.get('/id/:name', getIdByCategory);

module.exports = router;
