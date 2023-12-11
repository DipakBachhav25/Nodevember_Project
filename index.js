const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected succesfully");
  })
  .catch((err) => {
    console.log("Error occured while Database connection", err);
  })


const blogSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageURL: String
});

// Hint: Create User Schema here
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
})

const Blog = new mongoose.model("Blog", blogSchema);

// Hint: Create User Model here
const User = new mongoose.model("User", userSchema);

app.get('/', (req, res) => {
  res.render('login', {successMessage: ""})
})

app.get('/index', (req, res) => {

  Blog.find({})
    .then((posts) => {
      res.render('index', { blogPosts: posts })
    })
    .catch((err) => {
      console.log("Error getting data", err);
      res.redirect("index");
    });
});


app.get('/compose', (req, res) => {
  res.render('compose')
})

app.post('/compose', (req, res) => {
  const title = req.body.title;
  const image = req.body.imageUrl;
  const description = req.body.description;

  const newBlog = new Blog({
    imageURL: image,
    title: title,
    description: description,
  })

  newBlog.save()
    .then(() => {
      console.log("New Blog Posted");
    })
    .catch((err) => {
      console.log("Error posting New Blog");
    });

  res.redirect('/index');
})

// Task 1: Implement the dynamic routing to display a single blog post
app.get('/post/:id', (req, res) => {
  const reqID = req.params.id;

  Blog.findOne({ _id: reqID })
    .then((post) => {
      if (post) {
        res.render('post', { blogPost: post });
      } else {
        console.log("Post Not Found");
        res.render('index');
      }
    })
    .catch((err) => {
      console.log("Error finding post", err);
      res.render('index');
    });
});

// Task 2: Implement the delete operation with MongoDB
app.get('/post/delete/:id', (req, res) => {
  const idToDelete = req.params.id;

  Blog.findOneAndDelete({ _id: idToDelete })
    .then((deletedPost) => {
      if (deletedPost) {
        console.log("Post deleted:", deletedPost);
        res.redirect('/index');
      } else {
        console.log("Post Not Found");
        res.redirect('/index');
      }
    })
    .catch((err) => {
      console.log("Error deleting post", err);
      res.redirect('/index');
    });
});


// TODO: Task 3 to implement login and sign up.
// signup routes
app.get("/signup", (req, res) => {
  res.render('signup', {errorMessage: ""})
});

app.post("/signup", (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  newUser.save()
    .then(() => {
      console.log("New User Created");
      // Pass success message to the view
      res.render('login', { successMessage: "User successfully created. Please log in." });
    })
    .catch((err) => {
      console.log("Error Creating New User");
      // Handle errors and pass an error message if needed
      res.render('signup', { errorMessage: "Error creating user. Please try again." });
    });
});


// login routes

app.post("/login", (req, res) => {
  const reqEmail = req.body.email;
  const reqPassword = req.body.password;

  User.findOne({ email: reqEmail })
    .then((user) => {
      if (user) {
        if (user.password == reqPassword) {
          Blog.find({})
            .then((posts) => {
              res.render('index', { blogPosts: posts });
            })
            .catch((err) => {
              console.log("Error getting blog posts", err);
              res.render('index', { blogPosts: posts });
            });
        } else {
          res.render('login', { successMessage: "Invalid email or password." });
          console.log("Password is incorrect");
          res.render('login');
        }
      } else {
        res.render('login', { successMessage: "User not exist" })
        console.log("User Not Found");
        res.render('login');
      }
    })
    .catch((err) => {
      console.log("Error finding user", err);
      res.render('login');
    });
});


app.get('/about', (req, res) => {
  res.render('about');
})

app.get('/contact', (req, res) => {
  res.render('contact');
})



// port 3000 or deployment port provided by Render.com
const port = 3000 || process.env.PORT;

app.listen(port, () => {
  console.log("Server Listening on port " + port);
});