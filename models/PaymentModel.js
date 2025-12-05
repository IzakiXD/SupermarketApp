// models/PaymentModel.js
const db = require('../db');

class PaymentModel {
    static createPayment(userId, amount, callback) {
        const sql = `
            INSERT INTO payment (iduser, amount, paymentdate, method, status)
            VALUES (?, ?, NOW(), NULL, 'Pending')
        `;
        db.query(sql, [userId, amount], callback);
    }

    static updatePayment(paymentId, method, status, callback) {
        const sql = `
            UPDATE payment 
            SET method = ?, status = ?
            WHERE paymentID = ?
        `;
        db.query(sql, [method, status, paymentId], callback);
    }

    static findById(paymentId, callback) {
        const sql = `
            SELECT p.*, u.name
            FROM payment p
            JOIN user u ON p.iduser = u.iduser
            WHERE paymentID = ?
        `;
        db.query(sql, [paymentId], callback);
    }

    static getAll(callback) {
        const sql = `
            SELECT p.*, u.name
            FROM payment p
            JOIN user u ON p.iduser = u.iduser
            ORDER BY paymentID DESC
        `;
        db.query(sql, callback);
    }
}

module.exports = PaymentModel;
