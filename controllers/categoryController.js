const pool = require('../db');

const makeCategories = async (req,res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();

        const defaultCategories = [
            {name: "Food"},
            {name: "Transport"},
            {name: "Entertainment"},
            {name: "Utilities"},
            {name: "Health"},
        ];

        for (const type of defaultCategories) {
            await connection.execute(
                "INSERT INTO categories (user_id, name) VALUES (?, ?)", [req.session.user.id, type.name]
            );
        };
        res.status(201).json({message: "Initial cateogies successfully created."});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Error in creating initial categories."});
    }
};

const getCategories = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;
    
    try {
        connection = await pool.getConnection();
        const [categories] = await connection.execute(
            "SELECT * FROM categories WHERE user_id = ?", [req.session.user.id]
        );
        return res.status(200).json({message: "Successfully retrieved categories.", categories: categories});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error. Failed to retrieve categories"});
    }
};

const addCategories = async (req, res) => {
    const {name} = req.body;
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    if (!name) {
        return res.status(400).json({message: "Semua input field harus diisi."});
    }
    if (name.trim().length < 3 || name.trim().length > 50) {
        return res.status(400).json({message: "Name cannot be less than 3 and more than 50 characters long."});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.execute(
            "INSERT INTO categories (user_id, name) VALUES (?, ?)", [req.session.user.id, name]
        );
        return res.status(201).json({message: "Category created successfully."});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error. Failed to add category to the database"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const editCategories = async (req,res) => {
    const {categoryId, newName} = req.body;
    
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    if (newName.trim().length < 3 || newName.trim().length > 50) {
            return res.status(400).json({message: "Name cannot be less than 3 and more than 50 characters long."});
        }
    if (!newName) {
    res.status(400).json({message: "Semua input field harus diisi."});
    }
    let connection;

    try {
        // check if category exists
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            "UPDATE categories SET name = ? WHERE id = ? AND user_id = ?", [newName, categoryId, req.session.user.id]
        );
        if (rows.affectedRows === 0) {
            return res.status(404).json({message: "Category not found"});
        }
        res.status(200).json({message: "Category name updated."});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to update category"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const deleteCategories = async (req,res) => {
    const {categoryId} = req.body;

    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "DELETE FROM categories WHERE id = ? AND user_id = ?", [categoryId, req.session.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Category not found."});
        }
        res.status(200).json({message: "Category successfully deleted from the database."});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to delete category from the database"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getExpenseCount = async (req, res) => {
    const {categoryId} = req.params;

    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();

        // check if category exists
        const [validCategory] =  await connection.execute(
            "SELECT id FROM categories WHERE id = ? AND user_id = ?", [categoryId, req.session.user.id]
        );
        if (validCategory.length === 0) {
            return res.status(404).json({message: "Category not found"});
        }
        
        // count expense in the category
        const [count] = await connection.execute(
            "SELECT COUNT(*) as count FROM expenses WHERE category_id = ? AND user_id = ?", [categoryId, req.session.user.id]
        );

        const countResult = count[0]?. count || 0;
        return res.status(200).json({countResult});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error. Failed to count expenses in category"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getExpenseSum = async(req,res) => {
    const {categoryId} = req.params;
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [check] = await connection.execute(
            "SELECT id FROM categories WHERE id = ? AND user_id = ?", [categoryId, req.session.user.id]
        );

        if (check.length === 0) {
            return res.status(404).json({message: "Category not found."});
        }

        const [sumResult] = await connection.execute(
            "SELECT SUM(amount) as total FROM expenses WHERE category_id = ? AND user_id = ?", [categoryId, req.session.user.id]
        );
    
        const total = sumResult[0]?.total || 0;
        res.status(200).json({total: total});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error. Failed to get total expense in category."});
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getIdByCategory = async (req, res) => {
    const {name} = req.params;
    if (!req.session.user) {
        return res.status(401).json({message: "Unauthorized. Please log in"});
    }
    let connection;

    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "SELECT id FROM categories WHERE name = ? AND user_id = ?", [name, req.session.user.id]
        );
        if (result.length === 0) {
            return res.send(404).json({message: "Category not found"});
        }
        return res.status(200).json({id: result[0].id});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Internal Server Error. Cannot get category"});
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {makeCategories, addCategories, editCategories, deleteCategories, getCategories, getExpenseCount, getExpenseSum, getIdByCategory};