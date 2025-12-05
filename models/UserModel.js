// models/UserModel.js
const db = require('../db');

class UserModel {
    static findByEmail(email, callback) {
        const sql = `SELECT * FROM user WHERE email = ?`;
        db.query(sql, [email], callback);
    }

    static findById(id, callback) {
        const sql = `SELECT * FROM user WHERE iduser = ?`;
        db.query(sql, [id], callback);
    }

    static createUser(userData, callback) {
        const sql = `
            INSERT INTO user (name, email, number, password_hash, gender, dob, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, userData, callback);
    }
}

module.exports = UserModel;
