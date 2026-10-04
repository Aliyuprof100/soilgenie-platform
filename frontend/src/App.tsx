import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Authentication / Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboards
import AgentDashboard from "./pages/AgentDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Farmers
import RegisterFarmer from "./pages/RegisterFarmer";
import Farmers from "./pages/Farmers";
import FarmerProfile from "./pages/FarmerProfile";

// Farms
import RegisterFarm from "./pages/RegisterFarm";
import FarmProfile from "./pages/FarmProfile";
import Farms from "./pages/Farms";

// Soil
import RegisterSoilSample from "./pages/RegisterSoilSample";
import SoilSamples from "./pages/SoilSamples";
import SoilSampleDetails from "./pages/SoilSampleDetails";
import RegisterSoilTest from "./pages/RegisterSoilTest";
import SoilTestDetails from "./pages/SoilTestDetails";
import EnterSoilTestResults from "./pages/EnterSoilTestResults";

// Reports
import Reports from "./pages/Reports";
import FarmerSoilReport from "./pages/FarmerSoilReport";

// Notifications
import Notifications from "./pages/Notifications";

// weather
import Weather from "./pages/Weather";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================================================
            LANDING PAGE
        ============================================================ */}

        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />


        {/* ============================================================
            AUTHENTICATION
        ============================================================ */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ============================================================
            AGENT DASHBOARD
        ============================================================ */}

        <Route
          path="/agent"
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />


        {/* ============================================================
            FARMERS
        ============================================================ */}

        <Route
          path="/agent/farmers"
          element={
            <ProtectedRoute>
              <Farmers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/farmers/register"
          element={
            <ProtectedRoute>
              <RegisterFarmer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/farmers/:id"
          element={
            <ProtectedRoute>
              <FarmerProfile />
            </ProtectedRoute>
          }
        />

        <Route
  path="/agent/weather"
  element={
    <ProtectedRoute>
      <Weather />
    </ProtectedRoute>
  }
/>


        {/* ============================================================
            FARMS
        ============================================================ */}

        <Route
          path="/agent/farms"
          element={
            <ProtectedRoute>
              <Farms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/farms/register"
          element={
            <ProtectedRoute>
              <RegisterFarm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/farms/:id"
          element={
            <ProtectedRoute>
              <FarmProfile />
            </ProtectedRoute>
          }
        />


        {/* ============================================================
            SOIL MANAGEMENT
        ============================================================ */}

        <Route
          path="/agent/soil/samples"
          element={
            <ProtectedRoute>
              <SoilSamples />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/soil/samples/register"
          element={
            <ProtectedRoute>
              <RegisterSoilSample />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/soil/samples/:id"
          element={
            <ProtectedRoute>
              <SoilSampleDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/soil/tests/register"
          element={
            <ProtectedRoute>
              <RegisterSoilTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/soil/tests/:id"
          element={
            <ProtectedRoute>
              <SoilTestDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/soil/tests/:id/results"
          element={
            <ProtectedRoute>
              <EnterSoilTestResults />
            </ProtectedRoute>
          }
        />


        {/* ============================================================
            REPORTS
        ============================================================ */}

        <Route
          path="/agent/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/reports/soil/:id"
          element={
            <ProtectedRoute>
              <FarmerSoilReport />
            </ProtectedRoute>
          }
        />

        <Route
  path="/farmer/reports/soil/:id"
  element={
    <ProtectedRoute>
      <FarmerSoilReport />
    </ProtectedRoute>
  }
/>


        {/* ============================================================
            NOTIFICATIONS
        ============================================================ */}

        <Route
          path="/agent/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />


        {/* ============================================================
            FARMER DASHBOARD
        ============================================================ */}

        <Route
          path="/farmer"
          element={
            <ProtectedRoute>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ============================================================
            ADMIN DASHBOARD
        ============================================================ */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* ============================================================
            FALLBACK / 404
        ============================================================ */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
              <div className="text-center">

                <h1 className="text-4xl font-bold text-slate-900">
                  404
                </h1>

                <p className="mt-3 text-slate-600">
                  The page you are looking for does not exist.
                </p>

                <Link
                  to="/agent"
                  className="mt-6 inline-block rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
                >
                  Back to Dashboard
                </Link>

              </div>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}


export default App;