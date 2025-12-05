// controllers/paymentcontroller.js
const db = require('../db');

// Show payment summary page
const showPaymentPage = (req, res) => {
  const paymentID = req.params.id;

  const sql = `
    SELECT p.*, u.name
    FROM payment p
    JOIN user u ON p.iduser = u.iduser
    WHERE p.paymentID = ?
  `;

  db.query(sql, [paymentID], (err, results) => {
    if (err) {
      console.error('Error fetching payment:', err);
      return res.status(500).send('Error loading payment');
    }

    if (results.length === 0) {
      return res.status(404).send('Payment not found');
    }

    const payment = results[0];

    res.render('payment', {
      user: req.session.user,
      payment
    });
  });
};

module.exports = {
  showPaymentPage
};

// ADMIN: VIEW ALL PAYMENTS
exports.getAdminPayments = (req, res) => {
    const sql = `
        SELECT p.paymentID, u.name, p.amount, p.method, p.status, p.paymentdate
        FROM payment p
        JOIN user u ON p.iduser = u.iduser
        ORDER BY p.paymentdate DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error loading admin payments:", err);
            return res.send("Error loading admin payments");
        }
        res.render("admin_payments", { payments: results, user: req.session.user });
    });
};
