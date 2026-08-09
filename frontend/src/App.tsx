import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AgentDashboard from "./pages/AgentDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import RegisterFarmer from "./pages/RegisterFarmer";
import Farmers from "./pages/Farmers";
import FarmerProfile from "./pages/FarmerProfile";

import RegisterFarm from "./pages/RegisterFarm";
import FarmProfile from "./pages/FarmProfile";
import Farms from "./pages/Farms";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Landing Page */}

        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />


        {/* Authentication */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Agent Dashboard */}

        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />


        {/* Farmers List */}

        <Route
          path="/agent/farmers"
          element={
            <ProtectedRoute>
              <Farmers />
            </ProtectedRoute>
          }
        />


        {/* Register Farmer */}

        <Route
          path="/agent/farmers/register"
          element={
            <ProtectedRoute>
              <RegisterFarmer />
            </ProtectedRoute>
          }
        />


        {/* Farmer Profile */}

        <Route
          path="/agent/farmers/:id"
          element={
            <ProtectedRoute>
              <FarmerProfile />
            </ProtectedRoute>
          }
        />


        {/* Register Farm */}

        <Route
          path="/farms/register"
          element={
            <ProtectedRoute>
              <RegisterFarm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farms/:id"
          element={
            <ProtectedRoute>
              <FarmProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/farms"
          element={
            <ProtectedRoute>
              <Farms />
            </ProtectedRoute>
  }
/>



        {/* Farmer Dashboard */}

        <Route
          path="/farmer"
          element={
            <ProtectedRoute>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />


        {/* Admin Dashboard */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;