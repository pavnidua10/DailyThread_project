import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const PublicProfilePage = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/profiles/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-500 mt-2">
            The user you are looking for does not exist.
          </p>
        </div>
      </div>
    );

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-md border-4 border-white bg-blue-100 flex items-center justify-center">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">
              {user.name}
            </h1>

            <p className="text-gray-500 mt-1">{user.email}</p>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {user.bio || "This user hasn’t added a bio yet."}
            </p>

            {/* Followers / Following */}
            <div className="flex justify-center md:justify-start gap-10 mt-6">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">
                  {user.followers?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">
                  {user.following?.length || 0}
                </p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-gray-100" />

        {/* Placeholder Section for Future Content */}
        <div className="text-center text-gray-400">
          <p>User activity will appear here.</p>
        </div>

      </div>
    </div>
  );
};

export default PublicProfilePage;
