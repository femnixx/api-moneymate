const pool = require('../db');

const addExpense = async (req,res) => {
    const {amount, categoryId, title, description, quantity} = req.body;

    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    if (!amount || !categoryId || !description || !quantity || !title) {
        return res.status(400).json({message: "Please input all fields"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.execute(
            "INSERT INTO expenses (user_id, amount, category_id, title, description, quantity) VALUES (?, ?, ?, ?, ?, ?)", 
            [req.session.user.id, amount, categoryId, title, description, quantity]
        );
        res.status(201).json({message: "Expense successfully added."});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error. Failed to add expense to the database"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const deleteExpense = async (req,res) => {
    const {expenseId} = req.params;

    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "DELETE FROM expenses WHERE id = ? AND user_id = ?", [expenseId, req.session.user.id]
        );
        
        // check if expense exist in the first place
        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Expense does not exist."});
        }
        res.status(200).json({message: "Successfully deleted expense from the database"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Error in deleting expense from the database"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const updateExpense = async (req, res) => {
    const {expenseId} = req.params;
    const {newAmount, categoryId, title, description, quantity} = req.body;
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "UPDATE expenses SET amount = ?, title = ?, description = ?, quantity = ?, category_id = ? WHERE id = ? AND user_id = ?",
            [newAmount, title, description, quantity, categoryId, expenseId, req.session.user.id]
        );
        
        // check if expense exists
        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Expense not found."});
        }
        res.status(200).json({message: "Expense item successfully updated in the database"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to update expenses"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getExpense = async (req,res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [expenseList] = await connection.execute(
            "SELECT * FROM expenses WHERE user_id = ?", [req.session.user.id]
        );
        res.status(200).json({message:"Expenses successfully retrieved", expenses: expenseList});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to retrieve expenses from the database"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getExpenseSum = async (req,res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "SELECT SUM(amount) as total FROM expenses WHERE user_id = ?", [req.session.user.id]
        );
        const total = result[0].total || 0;
        res.status(200).json({message: "Sum retrieved succesfully.", total: total});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Cannot get total expense"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {addExpense, deleteExpense, updateExpense, getExpense, getExpenseSum};