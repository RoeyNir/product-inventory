// Import mongoose for database access
const mongoose = require('mongoose');

// Import Node.js file system module
const fs = require('fs');

// Define a schema for a product
const productSchema = new mongoose.Schema({
    _id: String,
    name: String,
    price: String,
    newPrice: Number,
    image: String,
    supplier: String,
    editable: String,
    discount: String
});
  
// Create a model from the schema
const Product = mongoose.model('Product', productSchema);

// Connect to the local MongoDB database
mongoose.connect('mongodb://localhost:27017/productDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    // Connection successful
    console.log('Connected to MongoDB database');
    // Read the JSON file containing product data
    const jsonFilePath = 'Items.json'; // Path to the JSON file
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8'); // Read the file synchronously
    const products = JSON.parse(jsonData); // Parse the JSON data
    try {
        // Iterate over each product in the JSON data
        await Product.insertMany(products);
        console.log('Products imported successfully'); // Log success message
    } catch (error) {
        console.error('Error during import:', error); // Log the error message
    } finally {
        mongoose.connection.close(); // Close the connection after import
        console.log('Import process completed'); // Log completion message
    }
});
  