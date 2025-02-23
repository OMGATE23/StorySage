import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import Layout from "./Layout";
import MakeStory from "./components/MakeStory";
import Clone from "./components/Clone";
import Video from "./components/Video";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <></>;
  }
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MakeStory />} />
          <Route path="clone" element={<Clone />} />
          <Route path="video" element={<Video />} />
        </Route>

        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </Router>
  );
}
