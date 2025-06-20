const bcrypt = require('bcrypt');
const pool = require('../db');

const register = async (req, res) => {
    let connection;
    
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({message: 'Semua field input harus diisi'});
        }
        connection = await pool.getConnection();

        // check if user exists before
        const [userExist] = await connection.execute(
            "SELECT id FROM users WHERE email = ?", [email]
        );
        if (userExist.length > 0) {
            return res.status(409).json({message: 'Email telah ter-registrasi sebelumnya.'})
        }

        // password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // user insert
        const [newUser] = await connection.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, hashedPassword]
        );

        // new session 
        req.session.user = {
            id: newUser.insertId, username, email
        };
        return res.status(201).json({message: 'Registrasi baru terbuat', user: req.session.user});
    } catch (err) {
        console.log('Error registrasi terdeteksi.');
        console.error('Error: ', err);
        return res.status(500).json({message: "Server error"});
    } finally {
        if (connection) connection.release();
    }
};

const login = async (req, res) => {
    let connection; 

    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: 'Semua field input harus diisi.'})
        }
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            "SELECT * FROM users WHERE EMAIL = ?", 
            [email]
        );
        if (rows.length == 0) {
            return res.status(401).json({message: 'Email tidak terdapat di database.'});
        }

        const user = rows[0];
        const passwordMatching = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatching) {
            return res.status(401).json({message: "Passowrd anda tidak benar."});
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        return res.status(200).json({
            message: "Login berhasil dengan user: ",
            user: req.session.user
        });
    } catch (err) {
        console.error("Login error: ", err);
        return res.status(500).json({message: "Internal Server Error"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const logout = async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error saat logout: ", err);
            return res.status(500).json({message: "Logout gagal."})
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({message: "Logout berhasil."});
    });
};

const getUser = async (req, res) => {
    if (req.session.user && req.session) {
        return res.status(200).json({user: req.session.user})
    } else {
        return res.status(404).json({message: 'Error, user session habis atau user belum login.'})
    }
};

module.exports = {login, register, logout, getUser};