const express = require("express");
const cors = require("cors");
require("dotenv").config()
const mongoose = require("mongoose");
const Products = require('./Products');
require('dotenv').config()
const bcrypt = require("bcrypt");
const stripe = require("stripe")(process.env.KEY)
const Users = require('./Users')

const app = express();
const port = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(cors());


const connection_url =process.env.mongodb
mongoose.connect(connection_url, {
  useNewUrlParser: true
})
.then(()=>{console.log("mongoDb connected")})
.catch((error)=>{console.log(error.message)})

// API
app.get("/", (req, res) => res.status(200).send("hello"));


//ADD PRODUCT
app.post("/products/add", (req, res) => {
    const productDetail = req.body;
  
    console.log("Product Detail >>>>", productDetail);
  
    Products.create(productDetail)
    .then((result) => {
        res.status(201).send(result)
    })
    .catch((err) =>{
        res.status(500).send(err.message)
    })

})

//GET DATA
app.get("/products/get", async (req, res) => {
    try {
      const products = await Products.find();
      res.status(200).json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json(err.message)
    }
});
  



// API for SIGNUP



app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Hash the password
    const encryptedPassword = await bcrypt.hash(password, 8);

    // Check if the user with the given email already exists
    const userExist = await Users.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "The email is already in use!" });
    }

    // Create a new user
    const newUser = await Users.create({
      email,
      password: encryptedPassword,
      fullName,
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// API for LOGIN



app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const userDetail = await Users.findOne({ email });

    // Check if the user exists
    if (!userDetail) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, userDetail.password);

    if (isPasswordValid) {
      // Password is valid, send user details
      res.status(200).json(userDetail);
    } else {
      // Invalid password
      res.status(401).json({ error: "Invalid password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// API for PAYMENT

app.post("/payment/create", async (req, res) => {
    const total = req.body.amount;
    console.log("Payment Request recieved for this ruppess", total);
  
    // const payment = await stripe.paymentIntents.create({
    //   amount: total,
    //   currency: "inr",
    // });
  
    // res.status(201).send({
    //   clientSecret: payment.client_secret,
    // });
});

app.listen(port, function(){
    console.log("port is running on "+ port)
})