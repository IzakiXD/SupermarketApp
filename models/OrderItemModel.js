// models/OrderItemModel.js
const db = require('../db');

class OrderItemModel {
    static addItem(orderId, productId, quantity, callback) {
        const sql = `
            INSERT INTO order_items (orderid, productid, quantity)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [orderId, productId, quantity], callback);
    }

    static getItems(orderId, callback) {
        const sql = `
            SELECT oi.*, p.name AS productName, p.price
            FROM order_items oi
            JOIN product p ON oi.productid = p.productId
            WHERE oi.orderid = ?
        `;
        db.query(sql, [orderId], callback);
    }
}

module.exports = OrderItemModel;
