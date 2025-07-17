// api/server.js
const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./dbConfig');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// NEW ENDPOINT: To get all unique statuses for the dropdown
app.get('/api/statuses', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT DISTINCT StatusPrefix1 FROM UsedInventory WHERE StatusPrefix1 IS NOT NULL ORDER BY StatusPrefix1');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


// UPDATED ENDPOINT: To get vehicles
app.get('/api/vehicles', async (req, res) => {
  const { stockNumber, vin, statusPrefix } = req.query;

  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    // UPDATED QUERY: Added StatusPrefix1 to the SELECT statement
    let query = `
      SELECT ID, STOCK_NUMBER,STATUS,MAKE,MODEL,YEAR,[NEW], ListPrice, StatusPrefix1 
      FROM UsedInventory
    `;
    
    const whereClauses = [];

    if (statusPrefix) {
      whereClauses.push(`StatusPrefix1 = @StatusPrefix`);
      request.input('StatusPrefix', sql.Int, statusPrefix);
    }
    if (stockNumber) {
      whereClauses.push(`Stock_Number LIKE @StockNumber`);
      request.input('StockNumber', sql.NVarChar, `%${stockNumber}%`);
    }
    if (vin) {
      whereClauses.push(`VIN LIKE @VIN`);
      request.input('VIN', sql.NVarChar, `%${vin}%`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// GET a single vehicle by its ID
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params; // Read the ID from the URL parameter
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM UsedInventory WHERE ID = @ID');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]); // Return the single vehicle object
    } else {
      res.status(404).send({ message: 'Vehicle not found' });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API Server is running on http://localhost:${PORT}`);
});                                                                                             