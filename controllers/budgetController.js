const { get } = require('mongoose');
const pool = require('../db');

const createBudget = async (req,res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();

        // prevent duplicate budget
        const [check] = await connection.execute(
            "SELECT id FROM budgets WHERE user_id = ?", [req.session.user.id]
        );
        if (check.length > 0) {
            return res.status(200).json({message: "Budget has money"});
        }
        await connection.execute(
            "INSERT INTO budgets (user_id, amount) VALUES (?, ?)", [req.session.user.id, 0]
        );
        return res.status(201).json({message: "Budget created!"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Please try again"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const addBudget = async (req, res) => {
    const {amount} = req.body;
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        await pool.execute(
        "UPDATE budgets SET amount = amount + ? WHERE user_id = ?", [amount, req.session.user.id]
        );
        res.status(200).json({message: "Successfully updated budget."});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to update budget"});
        console.log("Please try again");
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getBudget = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    } 
    let connection;
    
    try {
        connection = await pool.getConnection();
        const [amount] = await connection.execute(
            "SELECT * FROM budgets WHERE user_id = ?", [req.session.user.id]
        );
        if (amount.length === 0) {
            return res.status(404).json({message: "Budget empty or not found."})
        }
        res.status(200).json({amount: amount});
    } catch (err) {
    console.error(err);
    res.status(500).json({message: "Internal Server Error. Please try again"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const subtractBudget = async (req ,res) => {
    const {amount} = req.body;
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            "SELECT amount FROM budgets WHERE user_id = ?", [req.session.user.id]
        );
        
        if (!rows.length || rows[0].amount < amount) {
            return res.status(400).json({message: "Not enough amount to reduce."});
        }
        await connection.execute(
            "UPDATE budgets SET amount = amount - ? WHERE user_id = ?", [amount, req.session.user.id]
        );
        return res.status(200).json({message: "Budget updated accordingly."})
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to subtract amount from budget"});
        console.log("Please try again");
    } finally{
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {createBudget, addBudget, getBudget, subtractBudget};