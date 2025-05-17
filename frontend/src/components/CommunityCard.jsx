const CommunityCard = ({ community, onClick }) => (
  <div
    className="border p-4 rounded shadow hover:bg-blue-50 cursor-pointer"
    onClick={onClick}
  >
    <h2 className="font-bold text-lg">{community.name}</h2>
    <p className="text-gray-600">{community.description}</p>
    <div className="mt-2 text-xs text-blue-700">
      Interests: {community.interests.join(', ')}
    </div>
    <div className="mt-1 text-xs text-gray-500">
      Members: {community.members.length}
    </div>
  </div>
);
export default CommunityCard;
