const express = require('express');
const router = express.Router();
const {
    marksDistribution,
    uploadProfileImage,
    changePassword,
    changeName,
    addNewBatch,
    removeBatch,
    fetchAllUsers,
    removeUser,
    fetchCommittees,
    fetchNotInCommittee,
    addMemberToCommittee,
    removeFromCommitteeDepartment,
    removeFromCommittee,
    setStudentsCount,
    setStartingDate,
    fetchStudentsBarData,
    fetchAllSupervisors
} = require('../controllers/users');
const upload = require('../upload');
const {requireSignin} = require('../controllers/auth');

router.put('/chairman/settings/marksDistribution',marksDistribution);
router.put('/chairman/settings/batch/add',addNewBatch);
router.put('/chairman/settings/batch/remove',removeBatch);

router.put('/coordinator/settings/set/studentsCount',setStudentsCount);
router.put('/coordinator/settings/set/startingDate',setStartingDate);

router.put('/profile/upload/:type',upload.single('file'),uploadProfileImage);

router.get('/fetchAll',fetchAllUsers);
router.get('/fetch/studentsBarData',fetchStudentsBarData);
router.get('/fetch/supervisors',fetchAllSupervisors);
router.get('/fetchCommittees',fetchCommittees);
router.get('/fetchNotInCommittee',fetchNotInCommittee);

router.put('/change/name',changeName);
router.put('/change/password',changePassword);
router.put('/committee/addMember',addMemberToCommittee);
router.put('/committee/remove/department',removeFromCommitteeDepartment);
router.put('/committee/remove/committee',removeFromCommittee);
router.delete('/remove/:userId',removeUser);
module.exports = router;