// Topics.jsx

import { useState } from "react";
import {
  Search,
  BookText,
  ShieldAlert,
  Eye,
  BarChart,
  Target,
  Loader2, // Ensure Loader2 is imported
} from "lucide-react";
import Articles from "@/components/topics/Articles";
import Overview from "@/components/topics/Overview";
import TopicInfo from "@/components/topics/TopicInfo";
import KnowledgeGraph from "@/components/topics/KnowledgeGraph";
import PathwayFinder from "@/components/topics/PathwayFinder";
import NodeExplorer from "@/components/topics/NodeExplorer";

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [expanded, setExpanded] = useState(false);

  // New state variables for API integration
  const [overviewData, setOverviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // New state variables for Knowledge Graph
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState(null);

  const presetTopics = ["Terrorism", "Espionage", "Cybersecurity Threats"];

  // Define analyst notes for each topic
  const analystNotesData = {
    Visibility: [
      "Enhanced monitoring tools deployed across all critical infrastructure sectors.",
      "Real-time threat detection systems have reduced response times by 30%.",
    ],
    Impact: [
      "Potential financial losses estimated at $5M annually due to identified vulnerabilities.",
      "Operational disruptions could affect up to 20% of key services.",
    ],
    Prioritization: [
      "High-priority issues include unpatched software and exposed databases.",
      "Medium-priority concerns involve outdated security protocols.",
    ],
  };

  // Handler for search action
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setOverviewData(null);

    try {
      const response = await fetch("http://0.0.0.0:8020/execute-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // data should look like: { "result": "## Some markdown content..." }
      setOverviewData(data);

      // Fetch knowledge graph data based on the search query
      fetchKnowledgeGraph(searchQuery);
    } catch (err) {
      setError("Failed to fetch overview data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch knowledge graph data
  const fetchKnowledgeGraph = async (query) => {
    setGraphLoading(true);
    setGraphError(null);
    setGraphData({ nodes: [], edges: [] });

    try {
      const response = await fetch(
        "http://0.0.0.0:8020/filter-knowledge-graph",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }), // Adjust based on API requirements
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      setGraphError("Failed to fetch knowledge graph data. Please try again.");
    } finally {
      setGraphLoading(false);
    }
  };

  // Optional: Handle Enter key press in the search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handler for clicking on a popular topic
  const handlePresetTopicClick = (topic) => {
    setSelectedTopic(topic);
    setSearchQuery(topic);
    fetchKnowledgeGraph(topic); // Fetch knowledge graph data based on the preset topic
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
      {/* Search and Topics Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              placeholder="Search national security topics..."
              className="w-full pl-10 pr-4 py-4 rounded-xl text-base border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTopic(""); // Clear selected topic when user types manually
              }}
              onKeyPress={handleKeyPress} // Add key press handler
            />
          </div>
          <button
            onClick={handleSearch} // Add onClick handler
            className={`px-6 py-4 bg-purple-200 text-purple-600 rounded-xl hover:bg-purple-700 hover:text-white transition-colors flex items-center justify-center gap-2 sm:w-auto w-full ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Popular topics:
          </p>
          <div className="flex flex-wrap gap-3">
            {presetTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handlePresetTopicClick(topic)} // Updated onClick handler
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  selectedTopic === topic
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "text-purple-900 bg-white border border-purple-200 hover:bg-purple-50"
                } transition-colors`}
              >
                <BookText className="h-4 w-4" />
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview */}
      <Overview
        expanded={expanded}
        setExpanded={setExpanded}
        overviewData={overviewData} // Pass overview data
        error={error} // Pass error state
      />

      {/* Articles & Knowledge Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        <Articles />
        <KnowledgeGraph
          nodes={graphData.nodes}
          edges={graphData.edges}
          loading={graphLoading}
          error={graphError}
        />
      </div>

      <PathwayFinder />
      <NodeExplorer />

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <TopicInfo
          title="Visibility"
          content="Critical infrastructure vulnerabilities and threat vectors become visible through comprehensive analysis of current security landscapes."
          icon={<Eye className="h-6 w-6" />}
          analystNotes={analystNotesData.Visibility}
        />
        <TopicInfo
          title="Impact"
          content="Quantitative risk assessment models reveal potential operational and financial impacts on organizational assets."
          icon={<BarChart className="h-6 w-6" />}
          analystNotes={analystNotesData.Impact}
        />
        <TopicInfo
          title="Prioritization"
          content="Strategic framework for addressing vulnerabilities based on severity, exploitability, and potential damage mitigation."
          icon={<Target className="h-6 w-6" />}
          analystNotes={analystNotesData.Prioritization}
        />
      </div>
    </div>
  );
}
