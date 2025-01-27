import { useState } from "react";

function generateDummyData() {
  const categories = [
    { name: "Technology", color: "#6366f1" },
    { name: "Organization", color: "#10b981" },
    { name: "Person", color: "#f59e0b" },
    { name: "Event", color: "#ef4444" },
    { name: "Location", color: "#8b5cf6" },
    { name: "Product", color: "#3b82f6" },
    { name: "Concept", color: "#f97316" },
  ];

  const groupToColor = Object.fromEntries(
    categories.map(({ name, color }) => [name, color])
  );

  const nodes = [];
  const edges = [];

  // Generate sample nodes for categories
  categories.forEach((category, index) => {
    nodes.push({
      id: index + 1,
      label: category.name,
      group: category.name,
      color: category.color,
    });
  });

  // Additional sample entities
  const entities = [
    {
      id: 8,
      label: "AI Security",
      group: "Technology",
      color: groupToColor.Technology,
    },
    { id: 9, label: "Cyber Attack", group: "Event", color: groupToColor.Event },
    { id: 10, label: "John Doe", group: "Person", color: groupToColor.Person },
    {
      id: 11,
      label: "Security Org",
      group: "Organization",
      color: groupToColor.Organization,
    },
  ];
  nodes.push(...entities);

  // Sample relationships
  edges.push(
    { from: 1, to: 8, label: "includes" },
    { from: 8, to: 9, label: "prevents" },
    { from: 8, to: 11, label: "developed-by" },
    { from: 11, to: 10, label: "employs" },
    { from: 10, to: 9, label: "investigates" }
  );

  return { nodes, edges };
}

/**
 * Simple BFS to find the shortest path (unweighted) between two node IDs.
 * @param {Array} edges - Array of edges [{ from, to, label }, ...]
 * @param {number} startId
 * @param {number} endId
 * @returns {number[]} - List of node IDs in the path, or empty array if none
 */
function findShortestPath(edges, startId, endId) {
  // Build DIRECTED adjacency list
  const adjacencyList = {};
  edges.forEach((edge) => {
    if (!adjacencyList[edge.from]) adjacencyList[edge.from] = [];
    adjacencyList[edge.from].push(edge.to); // Only add forward direction
  });

  // BFS implementation remains the same but now handles directed edges
  const visited = new Set();
  const queue = [[startId]];

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === endId) return path;

    if (!visited.has(node)) {
      visited.add(node);
      const neighbors = adjacencyList[node] || [];
      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      });
    }
  }

  return [];
}

export default function PathwayFinder() {
  const { nodes, edges } = generateDummyData();
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");
  const [path, setPath] = useState([]);
  const [error, setError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false); // Add this line

  const groupedNodes = nodes.reduce((acc, node) => {
    if (!acc[node.group]) acc[node.group] = [];
    acc[node.group].push(node);
    return acc;
  }, {});

  const nodeIdToNode = nodes.reduce((map, n) => {
    map[n.id] = n;
    return map;
  }, {});

  const handleFindPath = () => {
    // Clear previous states
    setError("");
    setSearchPerformed(false);

    if (!fromNode || !toNode) {
      setError("Please select both nodes");
      return;
    }

    if (fromNode === toNode) {
      setError("From and To nodes must be different");
      return;
    }

    const shortestPath = findShortestPath(edges, +fromNode, +toNode);
    setPath(shortestPath);
    setSearchPerformed(true);
  };

  const getEdgeLabel = (fromId, toId) => {
    const edge = edges.find((e) => e.from === fromId && e.to === toId);
    return edge?.label || "connected to";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pathway Finder</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Node
          </label>
          <select
            className="w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-purple-500"
            value={fromNode}
            onChange={(e) => setFromNode(e.target.value)}
          >
            <option value="">Select a node</option>
            {Object.entries(groupedNodes).map(([group, groupNodes]) => (
              <optgroup key={group} label={group}>
                {groupNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Node
          </label>
          <select
            className="w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-purple-500"
            value={toNode}
            onChange={(e) => setToNode(e.target.value)}
          >
            <option value="">Select a node</option>
            {Object.entries(groupedNodes).map(([group, groupNodes]) => (
              <optgroup key={group} label={group}>
                {groupNodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleFindPath}
        className="w-full sm:w-auto px-6 py-2 bg-purple-200 hover:bg-purple-700 text-purple-600 hover:text-white rounded-md transition-colors font-medium"
      >
        Find Path
      </button>

      {error && <div className="mt-3 text-red-600 font-medium">⚠️ {error}</div>}

      {searchPerformed && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          {path.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Found Path
              </h3>
              <div className="flex items-center flex-wrap gap-2">
                {path.map((nodeId, idx) => {
                  const node = nodeIdToNode[nodeId];
                  const isLast = idx === path.length - 1;

                  return (
                    <div key={nodeId} className="flex items-center">
                      <span
                        style={{ backgroundColor: node.color }}
                        className="px-3 py-1 text-white rounded-full text-sm shadow-sm"
                      >
                        {node.label}
                      </span>
                      {!isLast && (
                        <>
                          <span className="mx-2 text-gray-500 text-sm italic">
                            {getEdgeLabel(nodeId, path[idx + 1])}
                          </span>
                          <span className="mr-2 text-gray-400">→</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Summary Section */}
              <div className="mt-4 bg-white p-4 rounded-md border border-gray-200">
                <h3 className="text-md font-semibold mb-2">Summary</h3>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
                  convallis quam ac enim sollicitudin, sed varius purus
                  porttitor.
                </p>
              </div>
            </>
          ) : (
            <div className="text-gray-600 italic">
              No path found between selected nodes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
