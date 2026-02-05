const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
 return !users.some(user => user.username.toLowerCase() === username.toLowerCase());
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(
        user => user.username.toLowerCase() === username.toLowerCase() && user.password === password
    );
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
   const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // 2. Authenticate user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // 3. Create JWT token
    const accessToken = jwt.sign(
        { username },               // payload
        "fingerprint_customer",     // secret must match session middleware
        { expiresIn: "1h" }         // token expiry
    );

    // 4. Store token and username in session
    req.session.authorization = {
        accessToken,
        username
    };

    // 5. Respond with success
    return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;  // get review from query parameter

  // Check if review is provided
  if (!review) {
      return res.status(400).json({ message: "Review query parameter is required" });
  }

  // Check if user is logged in
  if (!req.session.authorization || !req.session.authorization.username) {
      return res.status(403).json({ message: "User not logged in" });
  }

  const username = req.session.authorization.username;

  // Check if the book exists
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
      books[isbn].reviews = {};
  }

  // Add or update the review for this user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
      message: `Review successfully added/updated by ${username}`,
      reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if user is logged in
    if (!req.session.authorization || !req.session.authorization.username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const username = req.session.authorization.username;

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review by this user not found" });
    }

    // Delete the review for this user
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Review by ${username} deleted successfully`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
