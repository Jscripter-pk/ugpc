const express = require('express');
const router = express.Router();
const {
    addNewTask,
    planSprint,
    changeTaskStatus,
    changeTaskPriority,
    completeSprint
} = require('../controllers/backlog');
const {requireSignin} = require('../controllers/auth');

router.put('/task/add',addNewTask);
router.put('/sprint/plan',planSprint);
router.put('/task/change/column',changeTaskStatus);
router.put('/task/change/priority',changeTaskPriority);
router.put('/sprint/complete',completeSprint)
module.exports = router;