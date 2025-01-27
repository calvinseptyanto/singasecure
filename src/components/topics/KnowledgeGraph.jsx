import { useState, useEffect, useRef } from "react";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.css";

const categories = [
  { name: "Technology", color: "#6366f1" },
  { name: "Organization", color: "#10b981" },
  { name: "Person", color: "#f59e0b" },
  { name: "Event", color: "#ef4444" },
  { name: "Location", color: "#8b5cf6" },
  { name: "Product", color: "#3b82f6" },
  { name: "Concept", color: "#f97316" },
];

const generateDummyData = () => {
  const groupToColor = Object.fromEntries(
    categories.map(({ name, color }) => [name, color])
  );

  const nodes = [];
  const edges = [];

  // Generate sample nodes
  categories.forEach((category, index) => {
    nodes.push({
      id: index + 1,
      label: category.name,
      group: category.name,
      color: category.color,
      font: { color: "white" },
    });
  });

  // Additional sample entities with group-based colors
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

  // Sample relationships with improved edge styling
  edges.push(
    {
      from: 1,
      to: 8,
      label: "includes",
      color: { color: "#94a3b8", highlight: "#64748b" },
    },
    {
      from: 8,
      to: 9,
      label: "prevents",
      color: { color: "#94a3b8", highlight: "#64748b" },
    },
    {
      from: 8,
      to: 11,
      label: "developed-by",
      color: { color: "#94a3b8", highlight: "#64748b" },
    },
    {
      from: 11,
      to: 10,
      label: "employs",
      color: { color: "#94a3b8", highlight: "#64748b" },
    },
    {
      from: 10,
      to: 9,
      label: "investigates",
      color: { color: "#94a3b8", highlight: "#64748b" },
    }
  );

  return { nodes, edges };
};

export default function KnowledgeGraph() {
  const networkRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(
    categories.map((c) => c.name)
  );

  useEffect(() => {
    const data = generateDummyData();
    const options = {
      nodes: {
        shape: "dot",
        scaling: { min: 20, max: 30 },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        arrows: "to",
        smooth: { type: "cubicBezier" },
        color: {
          color: "#94a3b8",
          highlight: "#64748b",
          hover: "#64748b",
        },
        font: { size: 12, color: "#475569" },
        chosen: {
          edge: (values) => {
            values.color = "#475569";
            return values;
          },
        },
      },
      physics: {
        stabilization: true,
        barnesHut: { gravitationalConstant: -2000 },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
    };

    networkRef.current = new Network(
      document.getElementById("network-container"),
      data,
      options
    );

    networkRef.current.on("click", (params) => {
      if (params.nodes.length > 0) {
        handleNodeClick(params.nodes[0]);
      }
    });

    return () => networkRef.current?.destroy();
  }, []);

  const getCategoryColor = (groupName) => {
    return categories.find((c) => c.name === groupName)?.color || "#94a3b8";
  };

  const handleNodeClick = (nodeId) => {
    const allNodes = networkRef.current.body.data.nodes.get();
    const allEdges = networkRef.current.body.data.edges.get();

    const connectedEdges = networkRef.current.getConnectedEdges(nodeId);
    const connectedNodes = new Set(
      connectedEdges.flatMap((edgeId) => {
        const edge = allEdges.find((e) => e.id === edgeId);
        return [edge.from, edge.to];
      })
    );

    // Update node appearances
    allNodes.forEach((node) => {
      const isRelated = node.id === nodeId || connectedNodes.has(node.id);
      networkRef.current.body.data.nodes.update({
        ...node,
        color: {
          ...node.color,
          opacity: isRelated ? 1 : 0.3,
          border: isRelated ? "#000" : "rgba(0,0,0,0.3)",
        },
      });
    });

    // Update edge appearances
    allEdges.forEach((edge) => {
      const isRelated = connectedEdges.includes(edge.id);
      networkRef.current.body.data.edges.update({
        ...edge,
        color: {
          ...edge.color,
          opacity: isRelated ? 1 : 0.2,
        },
      });
    });

    // Set relationships for popup
    const node = allNodes.find((n) => n.id === nodeId);
    const relations = connectedEdges.map((edgeId) => {
      const edge = allEdges.find((e) => e.id === edgeId);
      const targetNode = allNodes.find(
        (n) => n.id === (edge.from === nodeId ? edge.to : edge.from)
      );
      return {
        direction: edge.from === nodeId ? "out" : "in",
        label: edge.label,
        target: targetNode.label,
        color: getCategoryColor(targetNode.group), // Use category-based color
      };
    });

    setSelectedNode(node);
    setRelationships(relations);
    setShowPopup(true);
  };

  const closePopup = () => {
    const allNodes = networkRef.current.body.data.nodes.get();
    allNodes.forEach((node) => {
      networkRef.current.body.data.nodes.update({
        ...node,
        color: { ...node.color, opacity: 1, border: "#000" },
      });
    });

    const allEdges = networkRef.current.body.data.edges.get();
    allEdges.forEach((edge) => {
      networkRef.current.body.data.edges.update({
        ...edge,
        color: { ...edge.color, opacity: 1 },
      });
    });

    setShowPopup(false);
    setSelectedNode(null);
  };

  const toggleFilter = (category) => {
    const newFilters = selectedFilters.includes(category)
      ? selectedFilters.filter((c) => c !== category)
      : [...selectedFilters, category];

    setSelectedFilters(newFilters);

    const allNodes = networkRef.current.body.data.nodes.get();
    allNodes.forEach((node) => {
      const visible = newFilters.includes(node.group);
      networkRef.current.body.data.nodes.update({
        ...node,
        hidden: !visible,
      });
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[700px] flex flex-col">
      {/* Filters Section with Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Knowledge Graph Explorer
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="w-48 max-h-40 overflow-y-auto border rounded-lg p-2 bg-white shadow-sm">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => toggleFilter(category.name)}
              className={`flex items-center gap-2 w-full p-1.5 rounded-md transition-colors ${
                selectedFilters.includes(category.name)
                  ? "bg-purple-50 border border-purple-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
              {selectedFilters.includes(category.name) && (
                <svg className="w-4 h-4 ml-auto text-purple-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Network Container */}
      <div
        id="network-container"
        className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-200 shadow-inner"
        style={{ maxHeight: "500px" }}
      />

      {/* Enhanced Popup */}
      {showPopup && selectedNode && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative z-[10000] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full shadow-sm"
                  style={{
                    backgroundColor: getCategoryColor(selectedNode.group),
                  }}
                />
                <h3 className="text-xl font-semibold">
                  {selectedNode.label}
                  <span className="block text-sm text-gray-500 mt-1">
                    {selectedNode.group}
                  </span>
                </h3>
              </div>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {relationships.map((rel, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-1.5 text-gray-500">
                    {rel.direction === "out" ? (
                      <>
                        <span className="font-bold">→</span>
                        <span className="font-medium text-purple-600">
                          {rel.label}
                        </span>
                        <span className="ont-bold">→</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">←</span>
                        <span className="font-medium text-purple-600">
                          {rel.label}
                        </span>
                        <span className="font-bold">←</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                      style={{ backgroundColor: rel.color }}
                    />
                    <span className="font-medium text-gray-700">
                      {rel.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
