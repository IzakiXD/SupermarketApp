// controllers/ordercontroller.js
const db = require('../db');

exports.createOrder = (req, res) => {
  const userId = req.session.user.userid; // note: this uses userid column if you have it

  const getCartSql = `
    SELECT c.*, p.price
    FROM cart c
    JOIN product p ON c.productid = p.productId
    WHERE iduser = ?
  `;

  db.query(getCartSql, [userId], (err, items) => {
    if (err) return console.error(err);

    if (!items || items.length === 0) {
      return res.send('Cart is empty.');
    }

    const createOrderSql = `
      INSERT INTO orders (iduser, created_at)
      VALUES (?, NOW())
    `;

    db.query(createOrderSql, [userId], (err2, result) => {
      if (err2) return console.error(err2);

      const orderId = result.insertId;

      const orderItemsSql = `
        INSERT INTO order_items (orderid, productid, quantity, price)
        VALUES ?
      `;

      const values = items.map((item) => [
        orderId,
        item.productid,
        item.quantity,
        item.price
      ]);

      db.query(orderItemsSql, [values], (err3) => {
        if (err3) return console.error(err3);

        db.query(`DELETE FROM cart WHERE iduser = ?`, [userId]);
        res.send('Order placed successfully!');
      });
    });
  });
};
