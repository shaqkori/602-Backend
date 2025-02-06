import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  // Fetch data from backend
  const fetchData = async () => {
    try {
      const response = await fetch('/data');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Add new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newItem }),
      });
      setNewItem('');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Simple Database App</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter new item"
        />
        <button type="submit">Add Item</button>
      </form>

      <h2>Items List</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.content}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;