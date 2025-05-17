const CommunitySearchBar = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Search communities by name, description, or interest..."
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full border p-2 rounded"
  />
);
export default CommunitySearchBar;
