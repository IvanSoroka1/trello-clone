import './App.css'
import Login from './pages/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Dashboard  from './pages/Dashboard';
import Board from './pages/Board/Board';
import EnterEmail from './pages/Account Recovery/EnterEmail';
import ResetPassword from './pages/Account Recovery/ResetPassword';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />           {/* Default route = Login */}
        <Route path="/register" element={<Register />} /> {/* Register page */}
        <Route path="/verify" element={<Verify/>}  />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board/:id" element={<Board/>} />
        <Route path="/forgot-password" element={<EnterEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App
