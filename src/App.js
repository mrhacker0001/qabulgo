import './App.css';
import Main from './Main';
import Navbar from './Navbar/Navbar';
import ProtectedRoute from "./Admin/ProtectedRoute";
import AdminServicesPage from "./Admin/AdminServicesPage";
import AdminBookingsPage from "./Admin/AdminBookingsPage";
import AdminLoginPage from "./Admin/AdminLoginPage";
import { Routes, Route } from "react-router-dom"; // Buni ham qo‘shish kerak

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/admin-login" element={<AdminLoginPage />} />

        <Route path="/admin-services" element={
          <ProtectedRoute>
            <AdminServicesPage />
          </ProtectedRoute>
        } />

        <Route path="/admin-bookings" element={
          <ProtectedRoute>
            <AdminBookingsPage />
          </ProtectedRoute>
        } />
      </Routes>

      <Main />
    </div>
  );
}

export default App;
