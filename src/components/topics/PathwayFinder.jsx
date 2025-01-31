import { useState } from "react";

export default function PathwayFinder() {
  const [nodeFrom, setNodeFrom] = useState("");
  const [nodeTo, setNodeTo] = useState("");
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();
    name === "nodeFrom" ? setNodeFrom(upperValue) : setNodeTo(upperValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nodeFrom.trim() || !nodeTo.trim()) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setPaths([]);

    try {
      const response = await fetch(
        "http://0.0.0.0:8020/get-path-between-nodes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            node_from: nodeFrom.trim(),
            node_to: nodeTo.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      if (data.paths?.length > 0) {
        setPaths(data.paths);
      } else {
        setError("No pathways found between these nodes");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch pathways");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pathway Finder</h2>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="nodeFrom"
            value={nodeFrom}
            onChange={handleInputChange}
            placeholder="Enter start node"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <input
            type="text"
            name="nodeTo"
            value={nodeTo}
            onChange={handleInputChange}
            placeholder="Enter end node"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 font-semibold text-white rounded-lg transition-colors
            ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
        >
          {loading ? "Finding Pathways..." : "Find Pathways"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Pathways Display */}
      <div className="h-[300px] overflow-y-auto space-y-6 mb-6">
        {paths.slice(0, 5).map((path, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg animate-fade-in"
          >
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              Pathway {index + 1}
            </h3>

            <div className="flex flex-col space-y-4">
              {path.path_nodes.map((node, i) => (
                <div key={i} className="relative pl-4">
                  {/* Node */}
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full absolute left-0" />
                    <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-sm font-medium">
                      {node}
                    </span>
                  </div>

                  {/* Edge (show only between nodes) */}
                  {i < path.path_nodes.length - 1 && (
                    <div className="ml-4 mt-2 mb-1">
                      <div className="relative pl-4">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {path.path_labels[i]?.replace(/"/g, "")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-purple-600 mb-3">
          Pathway Analysis Summary
        </h3>
        {loading ? (
          <div className="flex items-center">
            <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-gray-600 text-sm">Loading summary...</span>
          </div>
        ) : (
          <p className="text-gray-600 text-sm leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
        )}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
