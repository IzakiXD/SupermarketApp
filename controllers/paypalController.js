const db = require('../db');
const paypalService = require('../services/paypal');

/* =================================
   START PAYPAL PAYMENT
================================= */
exports.startPaypalPayment = async (req, res) => {
  const paymentID = req.params.id;

  // 1️⃣ Get payment record
  db.query(
    'SELECT amount FROM payment WHERE paymentID = ?',
    [paymentID],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.send('Database error');
      }

      if (results.length === 0) {
        return res.send('Payment not found');
      }

      // IMPORTANT: amount from MySQL is STRING
      const amount = Number(results[0].amount);

      try {
        // 2️⃣ Create PayPal order
        const order = await paypalService.createOrder(amount, paymentID);

        if (!order || !order.id) {
          console.error('Invalid PayPal order:', order);
          return res.send('Failed to create PayPal order');
        }

        // 3️⃣ Store PayPal token IMMEDIATELY
        db.query(
          'UPDATE payment SET transaction_id=? WHERE paymentID=?',
          [order.id, paymentID]
        );

        // 4️⃣ Get approval URL
        const approvalLink = order.links.find(link => link.rel === 'approve');

        if (!approvalLink) {
          console.error('No approval link:', order.links);
          return res.send('PayPal approval link not found');
        }

        // 5️⃣ Redirect user to PayPal
        res.redirect(approvalLink.href);

      } catch (error) {
        console.error('PayPal start error:', error);
        res.status(500).send('PayPal error');
      }
    }
  );
};


/* =================================
   PAYPAL SUCCESS / CAPTURE
================================= */
exports.capturePaypalPayment = async (req, res) => {
  const { token, paymentID } = req.query;

  console.log('PayPal callback:', req.query);

  if (!token) return res.send('PayPal token missing');

  // 1️⃣ Find payment using paymentID (preferred) then fall back to token
  const findSql = paymentID
    ? 'SELECT * FROM payment WHERE paymentID = ?'
    : 'SELECT * FROM payment WHERE transaction_id = ?';
  const findParam = paymentID ? paymentID : token;

  db.query(findSql, [findParam], async (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Database error');
    }

    if (results.length === 0) {
      // fall back to token if first lookup by paymentID failed
      if (paymentID) {
        return db.query(
          'SELECT * FROM payment WHERE transaction_id = ?',
          [token],
          async (err2, results2) => {
            if (err2) {
              console.error(err2);
              return res.send('Database error');
            }
            if (results2.length === 0) {
              return res.send('Payment not found');
            }
            return handleCapture(req, res, results2[0], token);
          }
        );
      }
      return res.send('Payment not found');
    }

    return handleCapture(req, res, results[0], token);
  });
};

async function handleCapture(req, res, payment, token) {
  try {
    // 2️⃣ Capture PayPal payment
    const capture = await paypalService.captureOrder(token);

    if (capture.status !== 'COMPLETED') {
      console.error('Capture failed:', capture);
      return res.send('Payment not completed');
    }

    // 3️⃣ Update payment status (enum only allows card/paynow, so store lowercase paypal)
    db.query(
      "UPDATE payment SET method='paynow', status='Paid' WHERE paymentID=?",
      [payment.paymentID]
    );

    // 4️⃣ Clear cart (only if session exists)
    if (req.session && req.session.user) {
      db.query('DELETE FROM cart WHERE iduser=?', [req.session.user.iduser]);
    }

    // 5️⃣ Redirect to receipt
    return res.redirect(`/receipt/${payment.paymentID}`);
  } catch (error) {
    console.error('PayPal capture error:', error);
    return res.send('PayPal capture failed');
  }
}
