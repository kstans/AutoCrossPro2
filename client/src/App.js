// src/App.js
import './App.css';
import VehicleList from './components/VehicleList'; // Import the component

function App() {
  return (
    <div className="App">
      <h1>Inventory</h1>
      <VehicleList /> {/* Display the component */}
    </div>
  );
}

export default App;