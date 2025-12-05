// models/OrderModel.js
const db = require('../db');

class OrderModel {
    static createOrder(userId, callback) {
        const sql = `
            INSERT INTO orders (iduser, created_at)
            VALUES (?, NOW())
        `;
        db.query(sql, [userId], callback);
    }

    static getOrdersByUser(userId, callback) {
        const sql = `
            SELECT * FROM orders 
            WHERE iduser = ?
            ORDER BY created_at DESC
        `;
        db.query(sql, [userId], callback);
    }

    static getAllOrders(callback) {
        const sql = `
            SELECT o.*, u.name,
                   (SELECT COUNT(*) FROM order_items WHERE orderid = o.orderid) AS total_items
            FROM orders o
            JOIN user u ON o.iduser = u.iduser
            ORDER BY o.orderid DESC
        `;
        db.query(sql, callback);
    }
}

module.exports = OrderModel;
