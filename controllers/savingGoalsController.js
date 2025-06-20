const pool = require('../db');

const makeSavingGoal = async (req,res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        
        // duplicate checker
        const[check] = await connection.execute(
            "SELECT id FROM saving_goals WHERE user_id = ?", [req.session.user.id]
        );
        if (check.length > 0) {
            return res.send(400).json({message: "Savings already loaded."});
        }
        const current_month = new Date().getMonth()+ 1;
        const current_year = new Date().getFullYear();
        const zero = 0;

        await connection.execute(
            "INSERT INTO saving_goals (user_id, amount, target_month, target_year) VALUES (?, ?, ?, ?)",
            [req.session.user.id, zero, current_month, current_year]
        );
        res.status(200).json({message: "Initial goal successfully made."});
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal Server Error. Could not make initial saving goal");
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const editSavingGoal = async (req, res) => {
    const {newAmount, target_month, target_year} = req.body;
    
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    if (!newAmount || !target_month || !target_year) {
        return res.status(400).json({message: "All input fields have to be filled."});
    }
    let connection;

    try {
        connection = await pool.getConnection();

        await connection.execute(
            "UPDATE saving_goals SET amount = ?, target_month = ?, target_year = ? WHERE user_id = ?",
            [newAmount, target_month, target_year, req.session.user.id]
        );
        res.status(200).json({message: "Saving goal successfully updated"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to edit saving goal"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getSavingGoal = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "SELECT * FROM saving_goals WHERE user_id = ?", [req.session.user.id]
        );
        res.status(200).json({result: result, message: "Succesfully retrieved saving goals."})
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Could not get saving goal"});
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

const checkAndUpdateSavingGoal = async (req,res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();

        // get current goal
        const [currentGoal] = await connection.execute(
            "SELECT id, amount, target_month, target_year FROM saving_goals WHERE user_id = ?", [req.session.user.id]
        );
        // get current budget
        const [currentBudget] = await connection.execute(
            "SELECT amount FROM budgets WHERE user_id = ?", [req.session.user.id]
        );

        if (!currentGoal || !currentBudget) {
            return res.status(404).json({message: "No data found regarding current goal and/or budget"});
        }
        const goals = currentGoal[0];
        const budgets = currentBudget[0];

        const today = new Date();
        const current_month = new Date().getMonth() + 1;
        const current_year = today.getFullYear();

        // determine status
        let status = "NOT ACHIEVED";
        if (current_year < goals.target_year || (current_year == goals.target_year && current_month < goals.target_month)) {
            status = "ON PROGRESS";
        } else {
            if (budgets.amount > goals.amount) {
                status = "BONUS";
            } else if (budgets.amount === goals.amount) {
                status = "ACHIEVED";
            }
        }

        // update status in the database
        await connection.execute(
            "UPDATE saving_goals SET status = ? WHERE id = ?", [status, req.session.user.id]
        );
        return res.status(200).json({message: "Successfully updated saving goals"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error. Failed to update saving goals"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {makeSavingGoal, editSavingGoal, getSavingGoal, checkAndUpdateSavingGoal};