const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // Check if user already exists
  if (!isValid(username)) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  // Register the new user
  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered. You can now login."
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Create a promise to simulate async retrieval
  let getBooksPromise = new Promise((resolve, reject) => {
    if (books) {
        resolve(books); // resolve with the books object
    } else {
        reject("No books available");
    }
});

// Use then/catch callbacks
getBooksPromise
    .then((booksData) => {
        res.status(200).send(JSON.stringify(booksData, null, 4));
    })
    .catch((error) => {
        res.status(500).json({ message: error });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        let book = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject("Book not found");
            }
        });

        res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        res.status(404).json({ message: error });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase(); // make search case-insensitive

    // Create a Promise to simulate async book retrieval
    let getBooksByAuthor = new Promise((resolve, reject) => {
        const allBooks = Object.values(books); // array of book objects
        const filteredBooks = allBooks.filter(book => book.author.toLowerCase() === author);

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject("No books found with this author");
        }
    });

    // Handle promise
    getBooksByAuthor
        .then((booksData) => {
            res.status(200).send(JSON.stringify(booksData, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    let result = [];
  
    // Iterate through all books
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase() === title) {
        result.push(books[key]);
      }
    });
  
    if (result.length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      return res.status(200).json(book.reviews || {});
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
