// controllers/productController.js

const db = require('../db');

const viewProduct = (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM product WHERE productId = ?';

  db.query(sql, [productId], (error, results) => {
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(500).send('Error fetching product');
    }

    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = results[0];

    res.render('product', {
      product,
      user: req.session.user
    });
  });
};

const addProduct = (req, res) => {
  const { name, price, category, stock } = req.body;
  const image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO product (name, price, category, image, stock)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, price, category, image, stock], (error) => {
    if (error) {
      console.error('Error adding product:', error);
      req.flash('error', 'Failed to add product!');
      return res.redirect('/inventory');
    }

    req.flash('success', 'Product added successfully!');
    res.redirect('/inventory');
  });
};

const getUpdateProduct = (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM product WHERE productId = ?';

  db.query(sql, [productId], (error, results) => {
    if (error) {
      console.error('Error fetching product for update:', error);
      return res.status(500).send('Error fetching product');
    }

    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }

    res.render('updateProduct', {
      product: results[0],
      user: req.session.user
    });
  });
};

const updateProduct = (req, res) => {
  const productId = req.params.id;
  const { name, price, category, stock } = req.body;

  const sqlGet = 'SELECT * FROM product WHERE productId = ?';
  db.query(sqlGet, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product before update:', err);
      return res.status(500).send('Error fetching product');
    }

    if (results.length === 0) {
      return res.status(404).send('Product not found');
    }

    const existingProduct = results[0];
    const image = req.file ? req.file.filename : existingProduct.image;

    const sqlUpdate = `
      UPDATE product
      SET name = ?, price = ?, category = ?, image = ?, stock = ?
      WHERE productId = ?
    `;

    db.query(
      sqlUpdate,
      [name, price, category, image, stock, productId],
      (error) => {
        if (error) {
          console.error('Error updating product:', error);
          req.flash('error', 'Failed to update product!');
          return res.redirect('/inventory');
        }

        req.flash('success', 'Product updated successfully!');
        res.redirect('/inventory');
      }
    );
  });
};

const deleteProduct = (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM product WHERE productId = ?';

  db.query(sql, [productId], (error) => {
    if (error) {
      console.error('Error deleting product:', error);
      req.flash('error', 'Failed to delete product!');
      return res.redirect('/inventory');
    }
    res.redirect('/inventory');
  });
};

module.exports = {
  viewProduct,
  addProduct,
  getUpdateProduct,
  updateProduct,
  deleteProduct
};
