// controllers/cartcontroller.js
const db = require('../db');

// ================================
// ADD TO CART
// ================================
exports.addToCart = (req, res) => {
  const userId = req.session.user.iduser;
  const productId = parseInt(req.params.id, 10);
  const quantity = Math.max(1, parseInt(req.body.quantity) || 1);

  const findSql = `
    SELECT * FROM cart WHERE iduser = ? AND productid = ?
  `;

  db.query(findSql, [userId, productId], (err, rows) => {
    if (err) return console.error(err);

    // If product already in cart → update quantity
    if (rows.length > 0) {
      const updateSql = `
        UPDATE cart 
        SET quantity = quantity + ?, updated_order = NOW()
        WHERE iduser = ? AND productid = ?
      `;
      db.query(updateSql, [quantity, userId, productId], (err2) => {
        if (err2) console.error(err2);
        res.redirect('/cart');
      });

    } else {
      // Else → insert new row
      const insertSql = `
        INSERT INTO cart (iduser, productid, quantity, created_order, updated_order)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      db.query(insertSql, [userId, productId, quantity], (err3) => {
        if (err3) console.error(err3);
        res.redirect('/cart');
      });
    }
  });
};

// ================================
// VIEW CART
// ================================
exports.getCart = (req, res) => {
  const userId = req.session.user.iduser;

  const sql = `
    SELECT c.cartid, c.productid, c.quantity, 
           p.name AS productName, p.price, p.image
    FROM cart c
    JOIN product p ON c.productid = p.productId
    WHERE c.iduser = ?
  `;

  db.query(sql, [userId], (err, items) => {
    if (err) {
      console.error('Error loading cart:', err);
      return res.status(500).send('Error loading cart');
    }

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.render('cart', {
      cart: items,       // IMPORTANT — matches cart.ejs
      total,
      user: req.session.user
    });
  });
};

// ================================
// UPDATE CART ITEM QUANTITY
// ================================
exports.updateItem = (req, res) => {
  const userId = req.session.user.iduser;
  const productId = parseInt(req.params.id, 10);
  const quantity = Math.max(1, parseInt(req.body.quantity) || 1);

  const sql = `
    UPDATE cart
    SET quantity = ?, updated_order = NOW()
    WHERE iduser = ? AND productid = ?
  `;

  db.query(sql, [quantity, userId, productId], (err) => {
    if (err) console.error(err);
    res.redirect('/cart');
  });
};

// ================================
// REMOVE ITEM FROM CART
// ================================
exports.removeItem = (req, res) => {
  const userId = req.session.user.iduser;
  const productId = parseInt(req.params.id, 10);

  const sql = `
    DELETE FROM cart
    WHERE iduser = ? AND productid = ?
  `;

  db.query(sql, [userId, productId], (err) => {
    if (err) console.error(err);
    res.redirect('/cart');
  });
};

// ================================
// CLEAR ENTIRE CART
// ================================
exports.clearCart = (req, res) => {
  const userId = req.session.user.iduser;

  const sql = `DELETE FROM cart WHERE iduser = ?`;

  db.query(sql, [userId], (err) => {
    if (err) console.error(err);
    res.redirect('/cart');
  });
};
