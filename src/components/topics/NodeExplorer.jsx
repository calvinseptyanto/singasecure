import { useState } from "react";

const NodeExplorer = () => {
  const [inputNode, setInputNode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!inputNode) return;
    setLoading(true);
    try {
      const response = await fetch("http://0.0.0.0:8020/retrieve-subgraph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node_start: inputNode.toUpperCase(),
          depth: 0,
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      setData(result);
      setError("");
    } catch (err) {
      setError("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Node Explorer</h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={inputNode}
          onChange={(e) => setInputNode(e.target.value.toUpperCase())}
          placeholder="Enter node name"
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-6">
        {/* Nodes Section */}
        <div className="h-[300px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Nodes</h3>
          {data?.nodes.map((node, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-purple-600">{node.label}</p>
              <p className="text-sm text-gray-600 mb-2">{node.group}</p>
              <div className="text-sm text-gray-700 space-y-2">
                {node.description.split("<SEP>").map((desc, i) => (
                  <p key={i}>• {desc.replace(/"/g, "").trim()}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Edges Section */}
        <div className="h-[300px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Edges</h3>
          {data?.edges.map((edge, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-medium text-purple-600">
                  {edge.from_label}
                </span>
                <span className="text-gray-500">→</span>
                <span className="font-medium text-purple-600">
                  {edge.to_label}
                </span>
              </div>
              <span className="inline-block px-2 py-2 text-xs bg-purple-100 text-purple-800 rounded">
                {edge.label.replace(/"/g, "")}
              </span>
              <p className="text-sm text-gray-600">
                {edge.relationship_description.replace(/"/g, "")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodeExplorer;
