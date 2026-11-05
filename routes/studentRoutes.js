const express = require('express');
const controller = require('../controllers/studentController');

const router = express.Router();

router.post('/', controller.addStudent);
router.get('/', controller.getAllStudents);

// IMPORTANT: /count must be registered BEFORE /:roll_no, otherwise
// Express would treat the word "count" as a roll number.
router.get('/count', controller.getStudentCount);

router.get('/:roll_no', controller.getStudentByRollNo);
router.put('/:roll_no', controller.updateStudent);
router.delete('/:roll_no', controller.deleteStudent);

module.exports = router;
