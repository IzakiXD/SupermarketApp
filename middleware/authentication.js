// middleware/authentication.js

// Check if user is logged in
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Please log in to view this resource');
    return res.redirect('/login');
};

// Check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        return next();
    }
    req.flash('error', 'Access denied');
    return res.redirect('/shopping');
};

module.exports = {
    checkAuthenticated,
    checkAdmin
};
