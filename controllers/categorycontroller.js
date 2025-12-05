// controllers/categoryController.js
const db = require('../db');

// (old helper, not really used now but safe to keep)
const getCartCount = (req) => {
  const cart = req.session.cart || [];
  return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

// SHOPPING PAGE (all products)
const getShopping = (req, res) => {
  const sql = 'SELECT * FROM product';

  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).send('Error fetching products');
    }

    res.render('shopping', {
      products: results,
      user: req.session.user
    });
  });
};

// Helper to render by category
const getCategoryHandler = (categoryName, viewName) => {
  return (req, res) => {
    const sql = 'SELECT * FROM product WHERE category = ?';

    db.query(sql, [categoryName], (error, results) => {
      if (error) {
        console.error(`Error fetching ${categoryName} products:`, error);
        return res.status(500).send('Error fetching category');
      }

      res.render(viewName, {
        products: results,
        user: req.session.user
      });
    });
  };
};

const getFreshProduce = getCategoryHandler('Fresh Produce', 'freshproduce');
const getBakery = getCategoryHandler('Bakery', 'bakery');
const getDairyEggs = getCategoryHandler('Dairy & Eggs', 'dairy_eggs');
const getMeatSeafood = getCategoryHandler('Meat & Seafood', 'meat_seafood');
const getFrozenFood = getCategoryHandler('Frozen Food', 'frozenfood');
const getBeverages = getCategoryHandler('Beverages', 'beverages');

module.exports = {
  getShopping,
  getFreshProduce,
  getBakery,
  getDairyEggs,
  getMeatSeafood,
  getFrozenFood,
  getBeverages
};
