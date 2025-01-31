import { useEffect, useRef, useState } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network";
import "vis-network/styles/vis-network.css";

// Helper function for title case conversion
const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

// Utility function to sanitize descriptions
const sanitizeDescription = (desc) => {
  if (!desc) return "";
  // Replace <SEP> with a period and space to separate sentences
  let sanitized = desc.replace(/<SEP>/g, ". ");
  // Remove any remaining unwanted characters, preserving essential punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,-]/g, "").trim();
  // Ensure that sentences end with a period
  if (sanitized && !sanitized.endsWith(".")) {
    sanitized += ".";
  }
  return sanitized;
};

const KnowledgeGraph = ({ edges, loading, error }) => {
  const visJsRef = useRef(null);
  const networkRef = useRef(null); // To hold the network instance
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [availableGroups, setAvailableGroups] = useState(new Set());
  const [connectedNodes, setConnectedNodes] = useState([]);
  const [derivedNodes, setDerivedNodes] = useState([]);
  const [maxNodes, setMaxNodes] = useState(Infinity); // Default to show all nodes

  // Vibrant color generator for nodes
  const getGroupColor = (groupName) => {
    const hash = Array.from(groupName).reduce(
      (acc, char) => char.charCodeAt(0) + acc,
      0
    );
    const hue = hash % 360;
    return {
      background: `hsl(${hue}, 70%, 92%)`,
      border: `hsl(${hue}, 70%, 50%)`,
      text: `hsl(${hue}, 70%, 30%)`,
      highlight: {
        background: `hsl(${hue}, 70%, 85%)`,
        border: `hsl(${hue}, 70%, 45%)`,
      },
    };
  };

  // Derive unique nodes from edges
  useEffect(() => {
    const nodeMap = new Map();

    edges.forEach((edge) => {
      // Process 'from' node
      const fromLabel = toTitleCase(edge.from_label[0]);
      if (!nodeMap.has(fromLabel)) {
        nodeMap.set(fromLabel, {
          label: fromLabel,
          group: edge.from_group.replace(/"/g, ""),
          description: sanitizeDescription(edge.from_description),
        });
      }

      // Process 'to' node
      const toLabel = toTitleCase(edge.to_label[0]);
      if (!nodeMap.has(toLabel)) {
        nodeMap.set(toLabel, {
          label: toLabel,
          group: edge.to_group.replace(/"/g, ""),
          description: sanitizeDescription(edge.to_description),
        });
      }
    });

    const uniqueNodes = Array.from(nodeMap.values());

    // Limit the number of nodes based on maxNodes
    const limitedNodes =
      maxNodes === Infinity ? uniqueNodes : uniqueNodes.slice(0, maxNodes);
    setDerivedNodes(limitedNodes);

    // Initialize available and selected groups
    const groups = new Set(limitedNodes.map((node) => node.group));
    setAvailableGroups(groups);
    setSelectedGroups(groups);
  }, [edges, maxNodes]);

  // Whenever we select a node, gather its directly connected neighbors & relationships
  useEffect(() => {
    if (selectedItem?.type === "node") {
      const directConnections = edges
        .filter((edge) => {
          const fromNode = toTitleCase(edge.from_label[0]);
          const toNode = toTitleCase(edge.to_label[0]);
          return fromNode === selectedItem.id || toNode === selectedItem.id;
        })
        .map((edge) => {
          const fromNode = toTitleCase(edge.from_label[0]);
          const toNode = toTitleCase(edge.to_label[0]);
          // Determine direction relative to the selected node
          const isFromSelected = fromNode === selectedItem.id;
          return {
            direction: isFromSelected ? "→" : "←",
            connectedNode: isFromSelected ? toNode : fromNode,
            relationship: toTitleCase(edge.label.replace(/"/g, "")),
            description:
              sanitizeDescription(edge.relationship_description) || "",
          };
        });

      setConnectedNodes(directConnections);
    } else {
      setConnectedNodes([]);
    }
  }, [selectedItem, edges]);

  // Initialize and update the vis-network
  useEffect(() => {
    if (!visJsRef.current || derivedNodes.length === 0) return;

    // Filter and format nodes based on selected groups
    const filteredNodes = derivedNodes.filter((node) =>
      selectedGroups.has(node.group)
    );

    const formattedNodes = new DataSet(
      filteredNodes.map((node) => ({
        id: node.label, // Use formatted label as ID
        label: node.label,
        group: node.group,
        title: node.description,
        description: node.description,
        color: getGroupColor(node.group),
      }))
    );

    // Format edges with title case and connect using node labels
    const formattedEdges = new DataSet(
      edges.map((edge, index) => {
        const fromNode = toTitleCase(edge.from_label[0]);
        const toNode = toTitleCase(edge.to_label[0]);
        const isSelected = selectedItem?.id === index;
        return {
          id: index,
          from: fromNode,
          to: toNode,
          label: toTitleCase(edge.label.replace(/"/g, "")),
          title: sanitizeDescription(edge.relationship_description),
          relationship_description: sanitizeDescription(
            edge.relationship_description
          ),
          arrows: "to",
          smooth: { type: "cubicBezier" },
          color: isSelected ? "#4f46e5" : "#e0e7ff",
          width: isSelected ? 2.5 : 1.2,
          hoverColor: "#6366f1",
          font: {
            color: isSelected ? "#1e1b4b" : "#64748b",
            size: 12,
            strokeWidth: 0,
          },
        };
      })
    );

    // Network configuration
    const container = visJsRef.current;

    // If network instance already exists, update its data
    if (networkRef.current) {
      networkRef.current.setData({
        nodes: formattedNodes,
        edges: formattedEdges,
      });
    } else {
      // Initialize the network for the first time
      networkRef.current = new Network(
        container,
        {
          nodes: formattedNodes,
          edges: formattedEdges,
        },
        {
          nodes: {
            shape: "dot",
            size: 26,
            font: {
              size: 14,
              face: "Inter",
              color: "#1e293b",
              strokeWidth: 0,
            },
            borderWidth: 2,
            shadow: true,
            scaling: { min: 20, max: 32 },
          },
          edges: {
            selectionWidth: 3,
            hoverWidth: 2.5,
            shadow: {
              enabled: true,
              color: "rgba(0,0,0,0.1)",
              size: 5,
            },
          },
          physics: {
            stabilization: true,
            barnesHut: {
              gravitationalConstant: -1500,
              springLength: 180,
              avoidOverlap: 0.6,
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 150,
            navigationButtons: true, // Added navigation buttons for better control
            keyboard: true, // Enable keyboard controls
          },
        }
      );

      // Event listener for clicks
      networkRef.current.on("click", (params) => {
        if (params.nodes.length > 0) {
          const node = formattedNodes.get(params.nodes[0]);
          setSelectedItem({ ...node, type: "node" });
        } else if (params.edges.length > 0) {
          const edge = formattedEdges.get(params.edges[0]);
          setSelectedItem({ ...edge, type: "edge" });
        }
        setIsModalOpen(true);
      });
    }

    // Cleanup function to remove event listeners if needed
    return () => {
      // No cleanup needed since we're maintaining the network instance
    };
  }, [derivedNodes, edges, selectedGroups, getGroupColor, selectedItem]);

  // Toggle group selection
  const toggleGroup = (group) => {
    setSelectedGroups(
      (prev) =>
        new Set(
          prev.has(group)
            ? [...prev].filter((g) => g !== group)
            : [...prev, group]
        )
    );
  };

  // Handle maxNodes change
  const handleMaxNodesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setMaxNodes(Infinity); // Show all if invalid input
    } else {
      setMaxNodes(value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[800px] flex flex-col relative font-[var(--modern-font)]">
      {/* Header Section */}
      <div className="flex flex-col items-start mb-5">
        <h2 className="text-2xl font-semibold text-gray-900 font-custom mb-3">
          Knowledge Graph Explorer
        </h2>

        {/* Max Nodes Control */}
        <div className="flex items-center gap-2 mb-4 w-full sm:w-auto">
          <label
            htmlFor="maxNodes"
            className="text-sm font-medium text-gray-700"
          >
            Max Nodes:
          </label>
          <input
            type="number"
            id="maxNodes"
            value={maxNodes === Infinity ? "" : maxNodes}
            onChange={handleMaxNodesChange}
            placeholder="All"
            className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Group Filter: Horizontal Scrollable List */}
        <div className="w-full overflow-x-auto">
          <div className="flex gap-2">
            {[...availableGroups].map((group) => {
              const colors = getGroupColor(group);
              return (
                <button
                  key={group}
                  onClick={() => toggleGroup(group)}
                  style={{
                    background: selectedGroups.has(group)
                      ? `linear-gradient(145deg, ${colors.background}, ${colors.highlight.background})`
                      : "#f8fafc",
                    color: selectedGroups.has(group) ? colors.text : "#64748b",
                    borderColor: selectedGroups.has(group)
                      ? colors.border
                      : "#e2e8f0",
                  }}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all 
                    items-center gap-2 ${
                      selectedGroups.has(group)
                        ? "border-2 shadow-sm hover:shadow-md"
                        : "border hover:bg-gray-50"
                    }`}
                >
                  {group}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary-500 border-t-transparent"></div>
        </div>
      )}
      {error && (
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
      )}

      {/* Graph Container */}
      <div
        ref={visJsRef}
        className="flex-1 rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
      />

      {/* Modal with Details + Neighbors/Relationships */}
      {isModalOpen && selectedItem && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative mx-4 border border-gray-100 font-custom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedItem.label}
                {selectedItem.type === "edge" && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Relationship)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* --- DETAILS --- */}
              {selectedItem.group && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Type:
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                    style={{
                      backgroundColor: getGroupColor(selectedItem.group)
                        .background,
                      color: getGroupColor(selectedItem.group).text,
                    }}
                  >
                    {selectedItem.group}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-900 mb-3">
                  Key Details
                </h4>
                <div className="space-y-3">
                  {selectedItem.description ? (
                    selectedItem.description
                      .split(". ")
                      .filter((desc) => desc !== "")
                      .map((desc, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 mt-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0" />
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {desc.endsWith(".") ? desc : `${desc}.`}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-sm italic pl-5">
                      {selectedItem.relationship_description}
                    </p>
                  )}
                </div>
              </div>

              {/* --- SHOW ONE-HOP NEIGHBORS & RELATIONSHIPS --- */}
              {selectedItem.type === "node" && connectedNodes.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">
                    Neighbors &amp; Relationships
                  </h4>
                  <div className="grid gap-2.5">
                    {connectedNodes.map((connection, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {selectedItem.label}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {connection.direction}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {connection.connectedNode}
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                              {connection.relationship}
                            </span>
                            {connection.description && (
                              <p className="text-gray-600 text-sm mt-1.5">
                                {connection.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
