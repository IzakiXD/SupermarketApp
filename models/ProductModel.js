// models/ProductModel.js
const db = require('../db');

class ProductModel {
    static getAll(callback) {
        db.query(`SELECT * FROM product`, callback);
    }

    static getById(productId, callback) {
        db.query(`SELECT * FROM product WHERE productId = ?`, [productId], callback);
    }

    static create(productData, callback) {
        const sql = `
            INSERT INTO product (name, price, category, image, stock)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, productData, callback);
    }

    static update(productId, productData, callback) {
        const sql = `
            UPDATE product
            SET name = ?, price = ?, category = ?, image = ?, stock = ?
            WHERE productId = ?
        `;
        db.query(sql, [...productData, productId], callback);
    }

    static delete(productId, callback) {
        db.query(`DELETE FROM product WHERE productId = ?`, [productId], callback);
    }
}

module.exports = ProductModel;
