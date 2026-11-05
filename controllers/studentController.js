const { pool } = require('../config/db');

// ---------- Validation helpers ----------

// Returns { errors: [...], values: {...} } for a student payload.
// When requireRollNo is false (update), the roll number is not validated here.
function validateStudent(body, requireRollNo) {
  const errors = [];
  const values = {};

  if (requireRollNo) {
    const roll = Number(body.roll_no);
    if (body.roll_no === undefined || body.roll_no === null || String(body.roll_no).trim() === '' ||
        !Number.isInteger(roll) || roll <= 0) {
      errors.push('Roll number must be a positive integer');
    } else {
      values.roll_no = roll;
    }
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) errors.push('Name is required');
  else if (name.length > 100) errors.push('Name must be at most 100 characters');
  else values.name = name;

  const address = typeof body.address === 'string' ? body.address.trim() : '';
  if (!address) errors.push('Address is required');
  else values.address = address;

  const dob = typeof body.dob === 'string' ? body.dob.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    errors.push('Date of birth must be a valid date (YYYY-MM-DD)');
  } else {
    const d = new Date(dob + 'T00:00:00Z');
    const isRealDate = !isNaN(d) && d.toISOString().slice(0, 10) === dob;
    const today = new Date().toISOString().slice(0, 10);
    if (!isRealDate) errors.push('Date of birth must be a valid date (YYYY-MM-DD)');
    else if (dob > today) errors.push('Date of birth cannot be in the future');
    else values.dob = dob;
  }

  const marksRaw = body.marks;
  const marks = Number(marksRaw);
  if (marksRaw === undefined || marksRaw === null || String(marksRaw).trim() === '' || isNaN(marks)) {
    errors.push('Marks are required and must be a number');
  } else if (marks < 0 || marks > 100) {
    errors.push('Marks must be between 0 and 100');
  } else if (Math.round(marks * 100) / 100 !== marks) {
    errors.push('Marks can have at most two decimal places');
  } else {
    values.marks = marks;
  }

  const className = typeof body.class === 'string' ? body.class.trim() : '';
  if (!className) errors.push('Class is required');
  else if (className.length > 30) errors.push('Class must be at most 30 characters');
  else values.class = className;

  return { errors, values };
}

function parseRollParam(param) {
  const roll = Number(param);
  return Number.isInteger(roll) && roll > 0 ? roll : null;
}

// ---------- Controllers ----------

// POST /api/students
async function addStudent(req, res, next) {
  try {
    const { errors, values } = validateStudent(req.body || {}, true);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const [existing] = await pool.query('SELECT roll_no FROM students WHERE roll_no = ?', [values.roll_no]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: `Roll number ${values.roll_no} already exists` });
    }

    await pool.query(
      'INSERT INTO students (roll_no, name, address, dob, marks, class) VALUES (?, ?, ?, ?, ?, ?)',
      [values.roll_no, values.name, values.address, values.dob, values.marks, values.class]
    );

    const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [values.roll_no]);
    res.status(201).json({ success: true, message: 'Student added successfully', data: rows[0] });
  } catch (err) {
    // Safety net for two simultaneous requests with the same roll number
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Roll number already exists' });
    }
    next(err);
  }
}

// GET /api/students   (optional ?search=term, matches name or roll number)
async function getAllStudents(req, res, next) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    let rows;
    if (search) {
      const like = `%${search}%`;
      [rows] = await pool.query(
        'SELECT * FROM students WHERE LOWER(name) LIKE LOWER(?) OR CAST(roll_no AS CHAR) LIKE ? ORDER BY roll_no ASC',
        [like, like]
      );
    } else {
      [rows] = await pool.query('SELECT * FROM students ORDER BY roll_no ASC');
    }
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/count
async function getStudentCount(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM students');
    res.status(200).json({ success: true, totalStudents: rows[0].total });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/:roll_no
async function getStudentByRollNo(req, res, next) {
  try {
    const roll = parseRollParam(req.params.roll_no);
    if (roll === null) {
      return res.status(400).json({ success: false, message: 'Roll number must be a positive integer' });
    }
    const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [roll]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/students/:roll_no   (the roll number itself is never changed)
async function updateStudent(req, res, next) {
  try {
    const roll = parseRollParam(req.params.roll_no);
    if (roll === null) {
      return res.status(400).json({ success: false, message: 'Roll number must be a positive integer' });
    }

    const { errors, values } = validateStudent(req.body || {}, false);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const [existing] = await pool.query('SELECT roll_no FROM students WHERE roll_no = ?', [roll]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await pool.query(
      'UPDATE students SET name = ?, address = ?, dob = ?, marks = ?, class = ? WHERE roll_no = ?',
      [values.name, values.address, values.dob, values.marks, values.class, roll]
    );

    const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [roll]);
    res.status(200).json({ success: true, message: 'Student updated successfully', data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/students/:roll_no
async function deleteStudent(req, res, next) {
  try {
    const roll = parseRollParam(req.params.roll_no);
    if (roll === null) {
      return res.status(400).json({ success: false, message: 'Roll number must be a positive integer' });
    }
    const [result] = await pool.query('DELETE FROM students WHERE roll_no = ?', [roll]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addStudent,
  getAllStudents,
  getStudentCount,
  getStudentByRollNo,
  updateStudent,
  deleteStudent,
};
