import './App.css'
import Login from './pages/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Verify from './pages/Verify';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />           {/* Default route = Login */}
        <Route path="/register" element={<Register />} /> {/* Register page */}
        <Route path="/verify" element={<Verify/>}  />
      </Routes>
    </Router>
  );
}

export default App
