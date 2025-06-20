# 💰 MoneyMate API

MoneyMate is a RESTful API built with Node.js and Express.js to manage **expenses, budgets, and savings goals**. It uses MySQL for data storage and supports session-based authentication.

---

## 🚀 Features

- User authentication (via session)
- Expense CRUD operations
- Budget and savings goal management
- Dynamic status updates for savings
- JSON responses for easy integration
- Postman-ready endpoints

---

## 📦 Tech Stack

- Node.js
- Express.js
- MySQL (via mysql2)
- express-session
- dotenv

---

## 🛠️ Installation

1. **Clone the repo**

```bash
git clone https://github.com/yourusername/api-moneymate.git
cd api-moneymate
```
2. **Install Dependencies**
npm install init -y
npm install dotenv

3. **Set up environment variables**
Create a .env file in the root folder and add your configuration:

DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
SESSION_SECRET=your_secret_key

4. **Start the server!**
node index.js

🧪 API Testing with Postman
Use Postman to test all endpoints. Make sure to:

Enable cookies to persist session login

Use POST for login before accessing protected routes

Example Endpoints:
📄 Expenses
Method	URL	Body Example
GET	/expenses	(none)
POST	/expenses/add	{ "amount": 50000, "title": "Books", "categoryId": 1, "description": "College books", "quantity": 2 }
PUT	/expenses/update/:id	{ "newAmount": 60000, "title": "Textbooks", "categoryId": 1, "description": "Updated desc", "quantity": 2 }
DELETE	/expenses/delete/:id	(none)

💸 Budgets
Method	URL	Body Example
POST	/budgets/create	{ "amount": 1000000 }

🎯 Saving Goals
Method	URL	Body Example
POST	/goals/make	(none) — creates default 0 saving for current month
PUT	/goals/edit	{ "newAmount": 500000, "target_month": 12, "target_year": 2025 }
GET	/goals/get	(none)
PATCH	/goals/check	(none) — auto updates goal status

📬 Questions or Issues?
Feel free to open an issue or pull request on the repo!

🧑‍💻 Author
Made with focus by @femnixx

