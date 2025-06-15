
import React, { useEffect, useState } from "react";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";
import { useUser } from "../Context/UserContext"; 
import LoadingSpinner from "../components/LoadingSpinner";
const categories = [
  { label: "All", value: "" },
  { label: "Politics", value: "politics" },
  { label: "Sports", value: "sports" },
  { label: "Tech", value: "technology" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Education", value: "education" },
  { label: "Health", value: "health" },
];

const regions = [
  { label: "India", value: "in" },
  { label: "International", value: "us" },
];

const states = [
  "Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru",
  "Uttar Pradesh", "Gujarat", "Punjab", "Kerala", "Rajasthan"
];

const suggestedTopics = [
  "Ukraine", "Climate Change", "Artificial Intelligence", "Elections",
  "US Economy", "Global Health", "European Union", "Space Exploration",
  "Renewable Energy", "Social Media Trends"
];

const moodPrompts = [
  { label: "Show me light news", value: "feel good positive" },
  { label: "Show creative articles", value: "art creativity design innovation" },
  { label: "Show motivational news", value: "inspiring success youth achievements" },
  { label: "Show quirky stuff", value: "weird unusual fun quirky lifestyle" },
  { label: "Show mental health stories", value: "mental health awareness therapy well-being" },
];

const TAB_HEADLINES = "headlines";
const TAB_ARTICLES = "articles";
const TAB_REGIONAL = "regional";
const TAB_TOPICS = "topics";

const NewsFeedPage = () => {
  const [activeTab, setActiveTab] = useState(TAB_HEADLINES);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("in");
  const [selectedState, setSelectedState] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUser(); 
  const currentUserId = user?._id; 


  const getRegionParam = (stateName) => {
    if (!stateName) return "";
    return `${stateName.toLowerCase().replace(/\s+/g, "-")}-india`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "/articles/headlines";
      let params = { pageSize: 12 };

      if (activeTab === TAB_HEADLINES) {
        params.country = selectedRegion;
        if (selectedCategory) params.category = selectedCategory;
        if (searchKeyword) params.q = searchKeyword;
      } else if (activeTab === TAB_ARTICLES) {
        endpoint = "/articles/relevant";
        params.country = selectedRegion;
        if (selectedCategory) params.category = selectedCategory;
        if (searchKeyword) params.q = searchKeyword;
      } else if (activeTab === TAB_REGIONAL && selectedState) {
        params.country = "in";
        params.region = getRegionParam(selectedState);
        if (searchKeyword) params.q = searchKeyword;
      } else if (activeTab === TAB_TOPICS && selectedTopic) {
        params.country = selectedRegion;
        params.q = selectedTopic;
      }

      const { data } = await axios.get(endpoint, { params });
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
   
  }, [selectedCategory, selectedRegion, selectedState, selectedTopic, searchKeyword, activeTab]);

 
  const renderArticles = () => {
   if (loading) return <LoadingSpinner />;

    if (!articles.length) return <p>No articles found.</p>;

    return (
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <ArticleCard
            key={article._id || article.url || idx}
            article={article}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">News Feed</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 flex-wrap">
        {[TAB_HEADLINES, TAB_ARTICLES, TAB_REGIONAL, TAB_TOPICS].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSearchKeyword("");
              setSelectedTopic("");
              setSelectedState("");
              setActiveTab(tab);
            }}
            className={`px-4 py-2 rounded ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

     
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by keyword or city (e.g., Bengaluru)"
          className="border rounded px-3 py-2 w-full md:w-1/3"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      
      <div className="flex gap-2 flex-wrap mb-4">
        {moodPrompts.map((mood) => (
          <button
            key={mood.label}
            onClick={() => {
              setSearchKeyword(mood.value);
              setActiveTab(TAB_ARTICLES);
            }}
            className="text-sm bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-full"
          >
            {mood.label}
          </button>
        ))}
      </div>

     
      {activeTab === TAB_ARTICLES && (
        <div className="flex gap-4 mb-6">
          <select
            className="border rounded px-3 py-2"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map((region) => (
              <option key={region.value} value={region.value}>{region.label}</option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Filters for Regional News */}
      {activeTab === TAB_REGIONAL && (
        <div className="mb-6">
          <select
            className="border rounded px-3 py-2"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      )}

      {/* Filters for Suggested Topics */}
      {activeTab === TAB_TOPICS && (
        <div className="mb-6">
          <select
            className="border rounded px-3 py-2"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">Select Topic</option>
            {suggestedTopics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
      )}

      {renderArticles()}
    </div>
  );
};

export default NewsFeedPage;
