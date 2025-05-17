import { Link, useLocation } from "react-router-dom";

const  Navbar=()=> {
  const location = useLocation();

  const navLinkStyle = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-500";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          DailyThread
        </Link>
        <div className="flex gap-6 text-sm">
          <Link to="/" className={navLinkStyle("/")}>Home</Link>
          <Link to="/news" className={navLinkStyle("/news")}>News Feed</Link>
          
         
          <Link to="/communities" className={navLinkStyle("/communities")}>Communities</Link>
         < Link to="/create" className={navLinkStyle("/create")}>Create Article</Link>
    <Link to="/profile-setup" className={navLinkStyle("/profile-setup")}>Profile</Link>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;