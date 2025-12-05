// models/CategoryModel.js
const db = require('../db');

class CategoryModel {
    static getByCategory(categoryName, callback) {
        const sql = `
            SELECT * FROM product
            WHERE category = ?
        `;
        db.query(sql, [categoryName], callback);
    }

    static getAllCategories(callback) {
        db.query(`SELECT DISTINCT category FROM product`, callback);
    }
}

module.exports = CategoryModel;
