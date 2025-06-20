const express = require('express');
const router = express.Router();
const {makeSavingGoal, editSavingGoal, getSavingGoal, checkAndUpdateSavingGoal} = require('../../controllers/savingGoalsController');

router.patch('/check', checkAndUpdateSavingGoal);
router.post('/make', makeSavingGoal);
router.put('/edit', editSavingGoal);
router.get('/get', getSavingGoal);

module.exports = router;
