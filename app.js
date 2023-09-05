// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:3001';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());

// Define User and Product schemas
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  purchased_products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  rating: Number,
  number_of_stocks: Number,
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// CRUD APIs for Users
// 1. Create a User
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Could not create user.' });
  }
});

// 2. Read all Users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve users.' });
  }
});

// 3. Read a User by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve user.' });
  }
});

// 4. Update a User by ID
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Could not update user.' });
  }
});

// 5. Delete a User by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Could not delete user.' });
  }
});

// CRUD APIs for Products (similar to Users)

// Endpoint to attach a product to a user when purchased
app.post('/users/:userId/purchased_products/:productId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const product = await Product.findById(req.params.productId);

    if (!user || !product) {
      res.status(404).json({ error: 'User or product not found.' });
      return;
    }

    user.purchased_products.push(product);
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Could not attach product to user.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
