import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import HomePage from "./pages/HomePage";
import NewsFeedPage from "./pages/NewsFeedPage";
import CreateArticlePage from "./pages/CreateArticlePage";
import UserArticlesPage from "./pages/UserArticlesPage";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import SignInForm from "./components/SignInForm";
import CommunityPage from "./pages/CommunityPage";
import Navbar from "./components/Navbar";
import CommunityDetailPage from './pages/CommunityDetailPage';
import { Toaster } from "sonner";
import LoadingSpinner from './components/LoadingSpinner';
import { useUser } from "./Context/UserContext";
import SearchUsersPage from "./pages/SearchUserPage";


axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
  const { user, loading } = useUser();


if (loading) return <LoadingSpinner />;
if (user === undefined) return <div className="p-4"><LoadingSpinner /> Loading user...</div>;

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
             <Route path="/users" element={<SearchUsersPage currentUserId={user?._id} />} />
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
              <Route path="/communities" element={<CommunityPage />} />
  <Route
    path="/communities/:id"
    element={<CommunityDetailPage currentUserId={user?._id} />}
  />
            <Route path="/profile/:id" element={<PublicProfilePage />} /> 
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
