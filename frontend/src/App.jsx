import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import HomePage from "./pages/HomePage";
import NewsFeedPage from "./pages/NewsFeedPage";
import CreateArticlePage from "./pages/CreateArticlePage";
import UserArticlesPage from "./pages/UserArticlesPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import SignInForm from "./components/SignInForm";
import CommunityPage from "./pages/CommunityPage";
import Navbar from "./components/Navbar";
import CommunityDetailPage from './pages/CommunityDetailPage';
import { Toaster } from "sonner";

import { useUser } from "./Context/UserContext";



axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const { user, loading } = useUser();

  
  if (loading) return <div>Loading...</div>;
  if (user === undefined) {
    return <div className="p-4">Loading user...</div>;
  }

  return (
    <div>
      {user && <Navbar />}

      <main className="p-4">
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to="/signin" replace />}
          />
          <Route
            path="/signin"
            element={!user ? <SignInForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/news"
            element={user ? <NewsFeedPage /> : <Navigate to="/signin" replace />}
          />
          <Route
            path="/create"
            element={user ? <CreateArticlePage /> : <Navigate to="/signin" replace />}
          />
          <Route
            path="/my-articles"
            element={user ? <UserArticlesPage /> : <Navigate to="/signin" replace />}
          />
          <Route
            path="/profile-setup"
            element={user ? <ProfileSetupPage /> : <Navigate to="/signin" replace />}
          />
              <Route path="/communities/:id" element={user ? <CommunityDetailPage currentUserId={user._id} />: <Navigate to="/signin" replace />} />
           <Route path="/communities" element={user ? <CommunityPage currentUserId={user._id} />: <Navigate to="/signin" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
