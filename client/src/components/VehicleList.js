// src/components/VehicleList.js
import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Typography, Alert, Dialog, DialogTitle, DialogContent, IconButton, Grid, Tab
} from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [stockNumberSearch, setStockNumberSearch] = useState('');
  const [vinSearch, setVinSearch] = useState('');
  const [statusSearch, setStatusSearch] = useState('6');
  const [currentTab, setCurrentTab] = useState('1');

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/statuses')
      .then(res => res.json())
      .then(data => setStatuses(data))
      .catch(err => console.error("Failed to fetch statuses:", err));
  }, []);
  
  const fetchVehicles = (params = {}) => {
    setLoading(true);
    const searchParams = new URLSearchParams(params);
    const url = `http://localhost:3001/api/vehicles?${searchParams.toString()}`;
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok'))
      .then(data => { setVehicles(data); setLoading(false); })
      .catch(error => { setError(error.message || error); setLoading(false); });
  };

  useEffect(() => {
    fetchVehicles({ statusPrefix: '6' });
  }, []);

  const handleSearch = () => {
    fetchVehicles({
      stockNumber: stockNumberSearch,
      vin: vinSearch,
      statusPrefix: statusSearch
    });
  };

  const handleRowClick = (id) => {
    fetch(`http://localhost:3001/api/vehicles/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch vehicle details'))
      .then(data => {
        setSelectedVehicle(data);
        setIsModalOpen(true);
        setCurrentTab('1');
      })
      .catch(err => setError(err.message));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  if (error) return <Alert severity="error" onClose={() => setError(null)}>Error: {error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vehicle Inventory ({loading ? '...' : vehicles.length} Records)
      </Typography>

      <Box component={Paper} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField label="Stock #" variant="outlined" size="small" value={stockNumberSearch} onChange={e => setStockNumberSearch(e.target.value)} />
        <TextField label="VIN" variant="outlined" size="small" value={vinSearch} onChange={e => setVinSearch(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusSearch} label="Status" onChange={e => setStatusSearch(e.target.value)}>
            <MenuItem value=""><em>All Statuses</em></MenuItem>
            {statuses.map(status => <MenuItem key={status.StatusPrefix1} value={status.StatusPrefix1}>{status.StatusPrefix1}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Stock#</TableCell>
                <TableCell>Make</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>New/Used</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map(vehicle => (
                <TableRow 
                  key={vehicle.ID} 
                  hover 
                  onClick={() => handleRowClick(vehicle.ID)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{vehicle.STOCK_NUMBER}</TableCell>
                  <TableCell>{vehicle.MAKE}</TableCell>
                  <TableCell>{vehicle.MODEL}</TableCell>
                  <TableCell>{vehicle.YEAR}</TableCell>
                  <TableCell>{vehicle.StatusPrefix1}</TableCell>
                  <TableCell>{vehicle.NEW ? 'New' : 'Used'}</TableCell>
                  <TableCell>{vehicle.ListPrice ? `$${vehicle.ListPrice.toLocaleString()}` : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* --- The Dialog Wrapper Was Missing --- */}
      {/* The opening <Dialog> tag goes here */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">

        <DialogTitle
          sx={{
            m: 0, p: 2,
            backgroundColor: selectedVehicle?.StatusPrefix1 === '6' ? 'success.light' : 'inherit',
            color: selectedVehicle?.StatusPrefix1 === '6' ? 'success.contrastText' : 'inherit',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , pr:5 }}>
            <Typography variant="h6" component="div">
              {selectedVehicle ? `Stock #: ${selectedVehicle.STOCK_NUMBER}` : 'Vehicle Details'}
            </Typography>
            <Typography variant="h6" component="div">
              {selectedVehicle?.STATUS}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          {selectedVehicle ? (
            <Box>
              <Box sx={{ p: 2, backgroundColor: '#f4f6f8' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}><Typography><strong>Stock #:</strong> {selectedVehicle.STOCK_NUMBER}</Typography></Grid>
                  <Grid item xs={12} sm={8}><Typography><strong>VIN:</strong> {selectedVehicle.VIN}</Typography></Grid>
                  <Grid item xs={12} sm={4}><Typography><strong>Year:</strong> {selectedVehicle.YEAR}</Typography></Grid>
                  <Grid item xs={12} sm={4}><Typography><strong>Make:</strong> {selectedVehicle.MAKE}</Typography></Grid>
                  <Grid item xs={12} sm={4}><Typography><strong>Model:</strong> {selectedVehicle.MODEL}</Typography></Grid>
                </Grid>
              </Box>

              <TabContext value={currentTab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="vehicle detail tabs">
                    <Tab label="Vehicle Info" value="1" />
                    <Tab label="Color Info" value="2" />
                    <Tab label="FTP VAuto" value="3" />
                    <Tab label="FTP Autosoft" value="4" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <Grid container spacing={2}>
                    <Grid item xs={6}><Typography><strong>Price:</strong> {selectedVehicle.ListPrice ? `$${selectedVehicle.ListPrice.toLocaleString()}` : 'N/A'}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Odometer:</strong> {selectedVehicle.ODOMETER ? selectedVehicle.ODOMETER.toLocaleString() : 'N/A'}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Condition:</strong> {selectedVehicle.CONDITION}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Drivetrain:</strong> {selectedVehicle.DRIVETRAIN}</Typography></Grid>
                  </Grid>
                </TabPanel>
                <TabPanel value="2">
                  <Grid container spacing={2}>
                    <Grid item xs={6}><Typography><strong>Color:</strong> {selectedVehicle.COLOR}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>Interior:</strong> {selectedVehicle.INTERIOR}</Typography></Grid>
                  </Grid>
                </TabPanel>
                <TabPanel value="3">
                  <Typography>FTP VAuto content goes here.</Typography>
                </TabPanel>
                <TabPanel value="4">
                  <Typography>FTP Autosoft content goes here.</Typography>
                </TabPanel>
              </TabContext>
            </Box>
          ) : (
            <Typography sx={{ p: 2 }}>No vehicle data to display.</Typography>
          )}
        </DialogContent>

      </Dialog> {/* The closing tag now correctly matches the opening one */}
    </Box>
  );
}

export default VehicleList;