import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import logo from '../logo/Logo.png';

const SignInForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || (isSignUp && !name)) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const res = await axios.post('/auth/register', { name, email, password });
        toast.success('Account created!');
        setUser(res.data);
        navigate('/news');
      } else {
        const res = await axios.post('/auth/login', { email, password });
        toast.success('Sign in successful!');
        setUser(res.data);
        navigate('/news');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center p-8 gap-8">
        {/* Logo Section */}
        <div className="flex-1 flex flex-col items-center mb-6 md:mb-0">
          <img
            src={logo}
            alt="Logo"
            className="w-55 h-55 object-contain mb-2"
            draggable={false}
          />
          <span className="text-lg font-bold text-blue-700">Welcome!</span>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 w-full max-w-md space-y-6"
          aria-label={isSignUp ? "Sign Up Form" : "Sign In Form"}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>

          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
