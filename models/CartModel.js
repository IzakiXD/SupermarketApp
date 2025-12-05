// models/CartModel.js
const db = require('../db');

class CartModel {
    static getCart(userId, callback) {
        const sql = `
            SELECT c.*, p.name AS productName, p.price, p.image
            FROM cart c
            JOIN product p ON c.productid = p.productId
            WHERE c.iduser = ?
        `;
        db.query(sql, [userId], callback);
    }

    static addItem(userId, productId, quantity, callback) {
        const sql = `
            INSERT INTO cart (iduser, productid, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        db.query(sql, [userId, productId, quantity], callback);
    }

    static updateItem(userId, productId, quantity, callback) {
        const sql = `
            UPDATE cart SET quantity = ?
            WHERE iduser = ? AND productid = ?
        `;
        db.query(sql, [quantity, userId, productId], callback);
    }

    static removeItem(userId, productId, callback) {
        db.query(
            `DELETE FROM cart WHERE iduser = ? AND productid = ?`,
            [userId, productId],
            callback
        );
    }

    static clearCart(userId, callback) {
        db.query(`DELETE FROM cart WHERE iduser = ?`, [userId], callback);
    }
}

module.exports = CartModel;
