import { BrowserRouter, Routes, Route } from "react-router-dom";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import Orders from "./pages/Orders";
import OrdersHistory from "./pages/OrdersHistory";
import AdminRoute from "./components/admin/AdminRoute";
import AdminPanel from "./pages/admin/AdminPanel";

// Shop
import Home from "./pages/Home";
import CustomerLogin from "./pages/CustomerLogin";
//import Register from "./pages/Register";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer */}
        <Route path="/" element={<Home />} />
        {/* <Route path="/" element={<AdminLogin />} /> */}
        <Route path="/login" element={<CustomerLogin />} />
        {/* <Route path="/register" element={<Register />} /> */}

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders-history" element={<OrdersHistory />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={ <AdminRoute><AdminPanel /></AdminRoute> }
        
 /> 

      </Routes>
    </BrowserRouter>
  );
}