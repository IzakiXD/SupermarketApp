// middleware/validation.js

// Validate registration input
const validateRegistration = (req, res, next) => {
  const { name, email, number, password, gender, dob, role } = req.body;
  const errors = [];

  if (!name || !email || !number || !password || !gender || !dob || !role) {
    errors.push('All fields are required.');
  }

  if (role !== 'Customer' && role !== 'Admin') {
    errors.push('Invalid role selected.');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    req.flash('error', errors);
    req.flash('formData', req.body);
    return res.redirect('/register');
  }

  next();
};

// Validate product
const validateProduct = (req, res, next) => {
  const { name, quantity, price, category } = req.body;
  const errors = [];

  if (!name || !quantity || !price || !category) {
    errors.push('All product fields must be filled.');
  }
  if (quantity < 0) {
    errors.push('Quantity cannot be negative.');
  }
  if (price < 0) {
    errors.push('Price cannot be negative.');
  }

  if (errors.length > 0) {
    req.flash('error', errors);
    return res.redirect(req.originalUrl);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateProduct
};
