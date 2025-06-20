const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

// middleware
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
}));

require('./db');
const pool = require('./db');

const authRoute = require('./routes/auth/auth');
const budgetRoute = require('./routes/budget/budget');
const categoryRoute = require('./routes/category/category');
const expenseRoute = require('./routes/expense/expense');
const savingGoals = require('./routes/goals/saving_goals');

// routes
app.use('/api/auth', authRoute);
app.use('/api/budget', budgetRoute);
app.use('/api/category', categoryRoute);
app.use('/api/expense', expenseRoute);
app.use('/api/saving_goals', savingGoals);

// error handling middleware
app.use((req, res, next) =>{
    res.status(404).json({message: "API route not found"});
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: "Internal Server Error", error: err.message});
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("API running at port:8000");
})