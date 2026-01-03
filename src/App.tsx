import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import {
  Home,
  AdminDashboard,
  CourseManagement,
  TripManagement,
  TripHome,
  ScoreEntry,
  Leaderboard,
  Purse,
} from './pages';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();

  if (!currentUser?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, currentTrip } = useStore();

  if (!currentUser || !currentTrip) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedAdminRoute>
              <CourseManagement />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <ProtectedAdminRoute>
              <TripManagement />
            </ProtectedAdminRoute>
          }
        />

        {/* User trip routes */}
        <Route
          path="/trip"
          element={
            <ProtectedUserRoute>
              <TripHome />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/trip/scores"
          element={
            <ProtectedUserRoute>
              <ScoreEntry />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/trip/leaderboard"
          element={
            <ProtectedUserRoute>
              <Leaderboard />
            </ProtectedUserRoute>
          }
        />
        <Route
          path="/trip/purse"
          element={
            <ProtectedUserRoute>
              <Purse />
            </ProtectedUserRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
