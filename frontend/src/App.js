import './App.css';
import React, { useState, useEffect } from 'react';
function App() {

  const [products, setProducts] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchBarcode, setSearchBarcode] = useState('');
  const [searchSupplier, setSearchSupplier] = useState('');
  const [showAllForm, setShowAllForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    _id: '',
    name: '',
    price: '',
    newPrice: 0,
    image: '',
    supplier: '',
    editable: 'yes',
    discount: ''
  });
  const [showEditForm, setShowEditForm] = useState(false);
  


  useEffect(() => {
    // Fetch products from the server
    const fetchProducts = async () => {
      let url = 'http://localhost:3000/products/search?';

      // Append search parameters to the URL if they exist
      if (searchName) url += `name=${searchName}&`;
      if (searchBarcode) url += `_id=${searchBarcode}&`;
      if (searchSupplier) url += `supplier=${searchSupplier}`;
      console.log(url) // Log the URL for debugging

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);

        // Sort products based on the presence of images
        // If a product has an image, it will be sorted to the top
        setProducts(
          [...data].sort((a, b) => {
          if (a.image && !b.image) return -1;
          if (!a.image && b.image) return 1;
          return 0;
        }));

      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
  
  fetchProducts();
  }, [searchName, searchBarcode, searchSupplier]);

  // Inputs for global price update
  const [allPercentage, setAllPercentage] = useState(0);

  // Inputs for supplier-based price update
  const [supplier, setSupplier] = useState('');
  const [supplierPercentage, setSupplierPercentage] = useState(0);

  // Inputs for individual product price update
  const [editingProductId, setEditingProductId] = useState(null);
  const [editPercentage, setEditPercentage] = useState(0);


  // Function to handle price update for a specific supplier
  const handleSupplierUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3000/products/update-by-supplier', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier,
          percentage: supplierPercentage,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const updatedProducts = await response.json();
      setProducts(
        [...updatedProducts].sort((a, b) => {
          if (a.image && !b.image) return -1;
          if (!a.image && b.image) return 1;
          return 0;
        })
      );
  
      console.log('Updated products:', updatedProducts);

      // Reset the editing state
      setSupplier('');
      setSupplierPercentage(0);
      setShowSupplierForm(false);

    } catch (error) {
      console.error('Error updating prices by supplier:', error);
    }
  };

  // Function to handle price update for all products
  const handleAllUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3000/products/update-all', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          percentage: allPercentage,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const updatedProducts = await response.json();
      setProducts(
        [...updatedProducts].sort((a, b) => {
          if (a.image && !b.image) return -1;
          if (!a.image && b.image) return 1;
          return 0;
        })
      );
  
      console.log('Updated products:', updatedProducts);

      // Reset the editing state
      setAllPercentage(0);
      setShowAllForm(false);

    } catch (error) {
      console.error('Error updating all products:', error);
    }
  };
  
  // Function to handle price update for a specific product
  const handleSingleUpdate = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          percentage: editPercentage,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const updatedProduct = await response.json();

      // Update the local state with the new price
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === productId ? updatedProduct : p))
      );
      
      console.log('Updated product:', updatedProduct);

      // Reset the editing state
      setEditingProductId(null);
      setEditPercentage(0);

    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Function to handle adding a new product
  const handleAddProduct = async () => {
    try {
      const response = await fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const addedProduct = await response.json();
      setProducts((prevProducts) => [...prevProducts, addedProduct]);
      console.log('Added product:', addedProduct);

      // Reset the new product state
      setNewProduct({
        _id: '',
        name: '',
        price: '',
        newPrice: 0,
        image: '',
        supplier: '',
        editable: 'yes',
        discount: ''
      });

      setShowEditForm(false); // Hide the add product form

    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      setProducts((prevProducts) => prevProducts.filter((p) => p._id !== productId));
      console.log('Deleted product with ID:', productId);

    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="App" dir="rtl">
      <h1>רשימת מוצרים</h1>
      <button onClick={() => setShowEditForm(true)}>הוסף מוצר</button>

      {showEditForm && (
        <div>
          <h2>הוספת מוצר חדש</h2>
          <input type="text" placeholder="ברקוד" onChange={e => setNewProduct({ ...newProduct, _id: e.target.value })} />
          <input type="text" placeholder="שם מוצר" onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input type="text" placeholder="מחיר" onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input type="text" placeholder="תמונה (URL)" onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
          <input type="text" placeholder="ספק" onChange={e => setNewProduct({ ...newProduct, supplier: e.target.value })} />
          <button onClick={handleAddProduct}>הוסף</button>
          <button onClick={() => setShowEditForm(false)}>ביטול</button>
        </div>
      )}
      <button onClick={() => setShowAllForm(true)}>שינוי מחיר לכלל המוצרים</button>
      <button onClick={() => setShowSupplierForm(true)}>שינוי מחיר מוצרים לפי ספק</button>
      {showAllForm && (
        <div>
          <input
            type="number"
            placeholder="אחוז שינוי"
            value={allPercentage}
            onChange={(e) => setAllPercentage(Number(e.target.value))}
          />
          <button onClick={handleAllUpdate}>עדכן את כל המוצרים</button>
        </div>
      )}

      {showSupplierForm && (
        <div>
          <input
            type="text"
            placeholder="שם ספק"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
          <input
            type="number"
            placeholder="אחוז שינוי"
            value={supplierPercentage}
            onChange={(e) => setSupplierPercentage(Number(e.target.value))}
          />
          <button onClick={handleSupplierUpdate}>עדכן לפי ספק</button>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="חיפוש לפי שם"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="חיפוש לפי ברקוד"
          value={searchBarcode}
          onChange={e => setSearchBarcode(e.target.value)}
        />
        <input
          type="text"
          placeholder="חיפוש לפי ספק"
          value={searchSupplier}
          onChange={e => setSearchSupplier(e.target.value)}
        />
      </div>

      <table>
        <thead>
        <tr>
          <th>תמונה</th>
          <th>ברקוד</th>
          <th>שם</th>
          <th>מחיר</th>
          <th>מחיר חדש</th>
          <th>ספק</th>
          <th>פעולות</th>
        </tr>
        </thead>
        <tbody>
        {products.map(p => (
        <tr key={p._id}>
          <td>{p.image ? <img src={p.image} alt={p.name} width="40" /> : '-'}</td>
          <td>{p._id}</td>
          <td>{p.name}</td>
          <td>
            {editingProductId === p._id ? (
            <div>
              <input
                type="number"
                placeholder="אחוז שינוי"
                value={editPercentage}
                onChange={(e) => setEditPercentage(Number(e.target.value))}
              />
              <button onClick={() => handleSingleUpdate(p._id)}>עדכן</button>
              <button onClick={() => {
                console.log('ביטול נלחץ');
                setEditingProductId(null);
              }}>ביטול</button>
            </div>
            ) : (
            <span
              style={{ cursor: 'pointer', color: 'blue' }}
              onClick={() => setEditingProductId(p._id)}
            >
              {p.price} ₪
            </span>
            )}
          </td>

          <td>{p.newPrice > 0 ? `${p.newPrice} ₪` : ''}</td>
          <td>{p.supplier}</td>
          <td>
            <button title="מחק" onClick={() => handleDeleteProduct(p._id)}>🗑️</button>
          </td>

        </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
