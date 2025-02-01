import { useState } from "react";
import KnowledgeGraph from "./KnowledgeGraph";

const NodeExplorer = () => {
  const [inputNode, setInputNode] = useState("");
  const [depth, setDepth] = useState(1); // Slider value starts at 1 for clarity
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
        // Subtract 1 from the slider value before sending the request
        body: JSON.stringify({
          node_start: inputNode.toUpperCase(),
          depth: depth - 1,
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

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
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
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Depth Slider */}
        <div className="flex items-center gap-4">
          <label htmlFor="depth" className="text-gray-700">
            Depth:
          </label>
          <input
            type="range"
            id="depth"
            min="1"
            max="5"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <span className="text-gray-700">{depth}</span>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Render KnowledgeGraph once data is available */}
      {data ? (
        <KnowledgeGraph edges={data.edges} loading={loading} error={error} />
      ) : (
        <p className="text-gray-600">
          Please search for a node to display the graph.
        </p>
      )}
    </div>
  );
};

export default NodeExplorer;
