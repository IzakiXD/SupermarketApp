const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');

const db = require('./db');

// Controllers
const userController = require('./controllers/usercontroller');
const categoryController = require('./controllers/categoryController');
const cartController = require('./controllers/cartcontroller');
const productController = require('./controllers/productcontroller');
const orderController = require('./controllers/ordercontroller');
const paymentController = require('./controllers/paymentcontroller');

// Middleware
const { checkAuthenticated, checkAdmin } = require('./middleware/authentication');
const {
  validateRegistration,
  validateProduct
} = require('./middleware/validation');

const app = express();

/* ============================
   Multer for image upload
============================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

/* ============================
   Express / Session config
============================ */
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
  })
);

app.use(flash());

/* ============================
   ⭐ Global cart count (DB)
============================ */
app.use((req, res, next) => {
  if (!req.session.user) {
    res.locals.cartCount = 0;
    return next();
  }

  const userId = req.session.user.iduser;
  const sql = 'SELECT SUM(quantity) AS total FROM cart WHERE iduser = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      res.locals.cartCount = 0;
    } else {
      res.locals.cartCount = result[0].total || 0;
    }
    next();
  });
});

/* ============================
   USER / AUTH ROUTES
============================ */
app.get('/', userController.getIndex);

app.get('/register', userController.getRegister);
app.post('/register', validateRegistration, userController.postRegister);

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);

app.get('/logout', userController.logout);

/* ============================
   INVENTORY (ADMIN)
============================ */
app.get('/inventory', checkAuthenticated, checkAdmin, (req, res) => {
  db.query('SELECT * FROM product', (error, results) => {
    if (error) {
      console.error('Error fetching inventory:', error);
      req.flash('error', 'Failed to fetch inventory.');
      return res.redirect('/');
    }

    res.render('inventory', {
      products: results,
      user: req.session.user
    });
  });
});

app.get('/addProduct', checkAuthenticated, checkAdmin, (req, res) => {
  res.render('addProduct', { user: req.session.user });
});

app.post(
  '/addProduct',
  checkAuthenticated,
  checkAdmin,
  upload.single('image'),
  validateProduct,
  productController.addProduct
);

app.get(
  '/updateProduct/:id',
  checkAuthenticated,
  checkAdmin,
  productController.getUpdateProduct
);

app.post(
  '/updateProduct/:id',
  checkAuthenticated,
  checkAdmin,
  upload.single('image'),
  validateProduct,
  productController.updateProduct
);

app.get(
  '/deleteProduct/:id',
  checkAuthenticated,
  checkAdmin,
  productController.deleteProduct
);

/* ============================
   PRODUCT DETAILS
============================ */
app.get('/product/:id', checkAuthenticated, productController.viewProduct);

/* ============================
   SHOPPING & CATEGORIES
============================ */
app.get('/shopping', checkAuthenticated, categoryController.getShopping);
app.get('/freshproduce', checkAuthenticated, categoryController.getFreshProduce);
app.get('/bakery', checkAuthenticated, categoryController.getBakery);
app.get('/dairy_eggs', checkAuthenticated, categoryController.getDairyEggs);
app.get('/meat_seafood', checkAuthenticated, categoryController.getMeatSeafood);
app.get('/frozenfood', checkAuthenticated, categoryController.getFrozenFood);
app.get('/beverages', checkAuthenticated, categoryController.getBeverages);

/* ============================
   CART ROUTES (DB)
============================ */
app.post('/addToCart/:id', checkAuthenticated, cartController.addToCart);
app.get('/cart', checkAuthenticated, cartController.getCart);
app.post('/cart/update/:id', checkAuthenticated, cartController.updateItem);
app.post('/cart/remove/:id', checkAuthenticated, cartController.removeItem);
app.post('/cart/clear', checkAuthenticated, cartController.clearCart);

/* ============================
   ORDERS (optional, not used in payment flow)
============================ */
app.post('/createOrder', checkAuthenticated, orderController.createOrder);

/* ============================
   CHECKOUT (USES DB CART)
============================ */
app.get('/checkout', checkAuthenticated, (req, res) => {
  const userId = req.session.user.iduser;

  const sql = `
    SELECT c.*, p.name AS productName, p.price, p.image
    FROM cart c
    JOIN product p ON c.productid = p.productId
    WHERE c.iduser = ?
  `;

  db.query(sql, [userId], (err, items) => {
    if (err) {
      console.error('Error loading checkout cart:', err);
      return res.redirect('/cart');
    }
    res.render('checkout', { cart: items, user: req.session.user });
  });
});

app.post('/checkout', checkAuthenticated, (req, res) => {
  const userId = req.session.user.iduser;

  const sqlCart = `
    SELECT c.*, p.price
    FROM cart c
    JOIN product p ON c.productid = p.productId
    WHERE c.iduser = ?
  `;

  db.query(sqlCart, [userId], (err, cart) => {
    if (err || cart.length === 0) {
      req.flash('error', 'Your cart is empty.');
      return res.redirect('/cart');
    }

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const sqlPayment = `
      INSERT INTO payment (iduser, amount, paymentdate, method, status, transaction_id)
      VALUES (?, ?, NOW(), NULL, 'Pending', NULL)
    `;

    db.query(sqlPayment, [userId, totalAmount], (err2, result) => {
      if (err2) {
        console.error('Error creating payment:', err2);
        return res.status(500).send('Error creating payment');
      }

      const paymentID = result.insertId;
      res.redirect(`/payment/${paymentID}`);
    });
  });
});

/* ============================
   PAYMENT SUMMARY
============================ */
app.get('/payment/:id', checkAuthenticated, paymentController.showPaymentPage);

/* ============================
   PAYNOW ROUTES
============================ */
app.get('/payment/paynow/:id', checkAuthenticated, (req, res) => {
  const paymentID = req.params.id;

  db.query(
    'SELECT amount FROM payment WHERE paymentID = ?',
    [paymentID],
    (err, result) => {
      if (err || result.length === 0) {
        return res.send('Payment not found');
      }
      res.render('paynow', {
        amount: result[0].amount,
        paymentID
      });
    }
  );
});

app.post('/payment/paynow/confirm/:id', checkAuthenticated, (req, res) => {
  const paymentID = req.params.id;
  const userId = req.session.user.iduser;

  const sql = `
    UPDATE payment
    SET method = 'PayNow', status = 'Paid'
    WHERE paymentID = ?
  `;

  db.query(sql, [paymentID], (err) => {
    if (err) {
      console.error('Error updating payment (PayNow):', err);
      return res.send('Error updating payment');
    }

    // clear cart after successful payment
    db.query('DELETE FROM cart WHERE iduser = ?', [userId], () => {
      res.redirect(`/receipt/${paymentID}`);
    });
  });
});

/* ============================
   CARD PAYMENT ROUTES
============================ */
app.get('/payment/card/:id', checkAuthenticated, (req, res) => {
  const paymentID = req.params.id;
  res.render('cardpayment', { paymentID });
});

app.post('/payment/card/confirm/:id', checkAuthenticated, (req, res) => {
  const paymentID = req.params.id;
  const userId = req.session.user.iduser;

  const sql = `
    UPDATE payment
    SET method = 'Card', status = 'Paid'
    WHERE paymentID = ?
  `;

  db.query(sql, [paymentID], (err) => {
    if (err) {
      console.error('Error updating payment (Card):', err);
      return res.send('Error updating payment');
    }

    // clear cart after successful payment
    db.query('DELETE FROM cart WHERE iduser = ?', [userId], () => {
      res.redirect(`/receipt/${paymentID}`);
    });
  });
});

/* ============================
   RECEIPT
============================ */
app.get('/receipt/:id', checkAuthenticated, (req, res) => {
  const paymentID = req.params.id;

  const sql = `
    SELECT p.*, u.name
    FROM payment p
    JOIN user u ON p.iduser = u.iduser
    WHERE p.paymentID = ?
  `;

  db.query(sql, [paymentID], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error loading receipt:', err);
      return res.send('Receipt not found');
    }

    res.render('receipt', { payment: results[0] });
  });
});

/* ============================
   SERVER START
============================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
