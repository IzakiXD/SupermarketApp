// controllers/userController.js
const bcrypt = require('bcrypt');
const db = require('../db');

// 🔐 Middleware: check if user is logged in
const checkAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    req.flash('error', 'Please log in to view this resource');
    return res.redirect('/login');
  }
};

// 🔐 Middleware: check if user is admin
const checkAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'Admin') {
    return next();
  } else {
    req.flash('error', 'Access denied');
    return res.redirect('/shopping');
  }
};

// GET /
const getIndex = (req, res) => {
  res.render('index', { user: req.session.user });
};

// GET /register
const getRegister = (req, res) => {
  res.render('register', {
    messages: req.flash('error'),
    formData: req.flash('formData')[0]
  });
};

// POST /register
const postRegister = (req, res) => {
  const { name, email, number, password, gender, dob, role } = req.body;

  // Validate role
  if (role !== 'Customer' && role !== 'Admin') {
    return res
      .status(400)
      .send('Invalid role. Please select either Customer or Admin.');
  }

  // Hash password then insert user
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Error hashing password');
    }

    const sql = `
      INSERT INTO user (name, email, number, password_hash, gender, dob, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, number, hashedPassword, gender, dob, role],
      (error) => {
        if (error) {
          console.error('Error registering user:', error);
          return res.status(500).send('Error registering user');
        }
        req.flash('success', 'Registration successful! Please log in.');
        return res.redirect('/login');
      }
    );
  });
};

// GET /login
const getLogin = (req, res) => {
  res.render('login', {
    messages: req.flash('success'),
    errors: req.flash('error')
  });
};

// POST /login
const postLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/login');
  }

  const sql = 'SELECT * FROM user WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      throw err;
    }

    if (results.length === 0) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const user = results[0];

    bcrypt.compare(password, user.password_hash, (err2, isMatch) => {
      if (err2) {
        return res.status(500).send('Error comparing password');
      }

      if (!isMatch) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }

      // Successful login
      req.session.user = user;
      req.flash('success', 'Login successful!');

      // Customer -> shopping, Admin -> inventory (original behaviour)
      return res.redirect(user.role === 'Customer' ? '/shopping' : '/inventory');
    });
  });
};

// GET /logout
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = {
  checkAuthenticated,
  checkAdmin,
  getIndex,
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout
};
