const express = require('express'); // Import express for creating a web server 
const mongoose = require('mongoose'); // Import mongoose for database access
const cors = require('cors'); // Import cors for handling cross-origin requests
const listEndpoints = require('express-list-endpoints'); // Import express-list-endpoints for listing all endpoints

const app = express(); // Create an instance of express
const PORT = 3000; // Define the port number for the server

app.use(cors()); // Use cors middleware to allow cross-origin requests
app.use(express.json()); // Use express.json middleware to parse JSON request bodies

mongoose.connect('mongodb://localhost:27017/productDB', { // Connect to the local MongoDB database
    useNewUrlParser: true, // Use the new URL parser
    useUnifiedTopology: true // Use the new topology engine
}).then(() => { // When the connection is successful
    console.log('Connected to MongoDB database'); // Log success message
}).catch((error) => { // If there is an error during connection
    console.error('Error connecting to MongoDB:', error); // Log the error message
}); // Log the error message

// Define a schema for a product
const productSchema = new mongoose.Schema({ // Create a schema for the product collection
    _id: String, // Define the _id field as a string
    name: String, // Define the name field as a string
    price: String, // Define the price field as a string
    newPrice: Number, // Define the newPrice field as a number
    image: String, // Define the image field as a string
    supplier: String, // Define the supplier field as a string
    editable: String, // Define the editable field as a string
    discount: String // Define the discount field as a string
});

// Create a model from the schema
const Product = mongoose.model('Product', productSchema); 
  

// Products route to handle requests for a price change by supplier
app.patch('/products/update-by-supplier', async (req, res) => {
    console.log('🔥 update-by-supplier route activated');
    const productSupplier = req.body.supplier; // Get the product supplier from the request parameters
    const percentage = req.body.percentage; // Get the percentage from the request body
    console.log('Price Change Percentage:', percentage); // Log the percentage value
    try {
        const products = await Product.find({supplier: productSupplier}); // Find all products in the database
        for (const product of products) { // Loop through each product
            product.newPrice = parseFloat((parseFloat(product.price) * (1 + percentage / 100)).toFixed(2)); // Update the new price
            console.log('Updated Product:', product); // Log the updated product
            await product.save(); // Save the updated product to the database
        }
        res.json(products); // Send the products as a JSON response
    } catch (error) {
        console.error('Error fetching product:', error); // Log the error message
        res.status(500).json({ error: 'Internal server error' }); // Send a 500 error response
    }
});

// Products route to handle requests for a price change for all products
app.patch('/products/update-all', async (req, res) => {
    console.log('🔥 update-all route activated');
    const percentage = req.body.percentage; // Get the percentage from the request body
    console.log('Price Change Percentage:', percentage); // Log the percentage value
    try {
        const products = await Product.find({}); // Find all products in the database
        for (const product of products) { // Loop through each product
            product.newPrice = parseFloat((parseFloat(product.price) * (1 + percentage / 100)).toFixed(2)); // Update the new price
            console.log('Updated Product:', product); // Log the updated product
            await product.save(); // Save the updated product to the database
        }
        res.json(products); // Send the products as a JSON response
    } catch (error) {
        console.error('Error fetching product:', error); // Log the error message
        res.status(500).json({ error: 'Internal server error' }); // Send a 500 error response
    }
});

// Products route to handle requests for a price change by product ID
app.patch('/products/:id', async (req, res) => {
    console.log('🔥 update route activated');
    const { id } = req.params;
    const { percentage } = req.body;
  
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        
        product.newPrice = parseFloat(
            (parseFloat(product.price) * (1 + percentage / 100)).toFixed(2)
        );
  
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

// Products route to handle GET requests for a specific product by name
app.get('/products/search', async (req, res) => {
    console.log('Query:', req.query);
    const filter = {};
    if (req.query.name) {
        filter.name = { $regex: req.query.name, $options: 'i' }; // Create a regex filter for case-insensitive search
        console.log(filter); // Log the filter object
    }
    if (req.query._id) {
        filter._id = { $regex: req.query._id, $options: 'i' }; // Create a regex filter for case-insensitive search
        console.log(filter); // Log the filter object
    }
    if (req.query.supplier) {
        filter.supplier = { $regex: req.query.supplier, $options: 'i' }; // Create a regex filter for case-insensitive search
        console.log(filter); // Log the filter object
    }

    try {
        const results = Object.keys(filter).length > 0
            ? await Product.find(filter)  // Find products matching the filter criteria
            : await Product.find({});    // Find all products if no filter is provided

        res.json(results);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Products route to handle POST requests for adding a new product
app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body); // Create a new product instance from the request body
    try {
        await newProduct.save(); // Save the new product to the database
        res.status(201).json(newProduct); // Send a 201 response with the new product
    } catch (error) {
        console.error('Error adding product:', error); // Log the error message
        res.status(500).json({ error: 'Internal server error' }); // Send a 500 error response
    }
}); // Send a 500 error response

// Products route to handle DELETE requests for deleting a product by ID
app.delete('/products/:id', async (req, res) => {
    const productId = req.params.id; // Get the product ID from the request parameters
    try {
        const deletedProduct = await Product.findByIdAndDelete(productId); // Delete the product by ID
        if (!deletedProduct) { // If no product is found
            return res.status(404).json({ error: 'Product not found' }); // Send a 404 error response
        }
        res.json(deletedProduct); // Send the deleted product as a JSON response
    } catch (error) {
        console.error('Error deleting product:', error); // Log the error message
        res.status(500).json({ error: 'Internal server error' }); // Send a 500 error response
    }
}); // Send a 500 error response


// Start the server and listen on the specified port
app.listen(PORT, () => { // Start the server and listen on the specified port
    console.log(`Server is running on http://localhost:${PORT}`); // Log the server URL
}); // Log the server URL
  