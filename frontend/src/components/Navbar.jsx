// import { Link, useLocation } from "react-router-dom";

// const  Navbar=()=> {
//   const location = useLocation();

//   const navLinkStyle = (path) =>
//     location.pathname === path
//       ? "text-blue-600 font-semibold"
//       : "text-gray-700 hover:text-blue-500";

//   return (
//     <nav className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
//         <Link to="/" className="text-xl font-bold text-indigo-600">
//           DailyThread
//         </Link>
//         <div className="flex gap-6 text-sm">
//           <Link to="/" className={navLinkStyle("/")}>Home</Link>
//           <Link to="/news" className={navLinkStyle("/news")}>News Feed</Link>
          
         
//           <Link to="/communities" className={navLinkStyle("/communities")}>Communities</Link>
//          < Link to="/create" className={navLinkStyle("/create")}>Create Article</Link>
//     <Link to="/profile-setup" className={navLinkStyle("/profile-setup")}>Profile</Link>
//         </div>
//       </div>
//     </nav>
//   );
// }
// export default Navbar;
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Or use any hamburger/close icon

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkStyle = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-500";

  const navLinks = (
    <>
      <Link to="/" className={navLinkStyle("/")} onClick={() => setMobileMenuOpen(false)}>Home</Link>
      <Link to="/news" className={navLinkStyle("/news")} onClick={() => setMobileMenuOpen(false)}>News Feed</Link>
      <Link to="/communities" className={navLinkStyle("/communities")} onClick={() => setMobileMenuOpen(false)}>Communities</Link>
      <Link to="/create" className={navLinkStyle("/create")} onClick={() => setMobileMenuOpen(false)}>Create Article</Link>
      <Link to="/profile-setup" className={navLinkStyle("/profile-setup")} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
    </>
  );

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          DailyThread
        </Link>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-sm">
          {navLinks}
        </div>
        {/* Hamburger Button */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-sm border-t">
          <div className="flex flex-col gap-4 px-4 py-3 text-base">
            {navLinks}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
