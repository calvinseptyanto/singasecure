import { useState } from "react";
import {
  Search,
  BookText,
  ShieldAlert,
  Eye,
  BarChart,
  Target,
  Loader2,
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

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [topicOverview, setTopicOverview] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  // Global loading and error states
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphError, setGraphError] = useState(null);

  // Analyst notes data remains the same
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

  // Preset topics
  const presetTopics = ["Terrorism", "Espionage", "Cybersecurity Threats"];

  // Handler for search action
  const handleSearch = async () => {
    setPageLoading(true);
    setError(null);
    setGraphError(null);
    setOverviewData(null);
    setTopicOverview(null);
    setGraphData({ nodes: [], edges: [] });

    try {
      // Create all fetch promises
      const overviewPromise = fetch("http://0.0.0.0:8020/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const topicOverviewPromise = fetch(
        "http://0.0.0.0:8021/api/topic-overview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        }
      );

      const graphPromise = fetch("http://0.0.0.0:8020/filter-knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      // Wait for all fetch requests to complete
      const [overviewResponse, topicOverviewResponse, graphResponse] =
        await Promise.all([
          overviewPromise,
          topicOverviewPromise,
          graphPromise,
        ]);

      // Check for errors in the responses
      if (!overviewResponse.ok)
        throw new Error(
          `Overview Error: ${overviewResponse.status} ${overviewResponse.statusText}`
        );
      if (!topicOverviewResponse.ok)
        throw new Error(
          `Topic Overview Error: ${topicOverviewResponse.status} ${topicOverviewResponse.statusText}`
        );
      if (!graphResponse.ok)
        throw new Error(
          `Graph Error: ${graphResponse.status} ${graphResponse.statusText}`
        );

      // Parse the JSON responses
      const overviewJson = await overviewResponse.json();
      const topicOverviewJson = await topicOverviewResponse.json();
      const graphJson = await graphResponse.json();

      // Update state with fetched data
      setOverviewData(overviewJson);
      setTopicOverview(topicOverviewJson);
      setGraphData(graphJson);
    } catch (err) {
      setError("Failed to fetch overview or topic details. Please try again.");
      setGraphError("Failed to fetch knowledge graph data. Please try again.");
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  // Optional: Handle Enter key press in the search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handler for clicking on a preset topic
  const handlePresetTopicClick = (topic) => {
    setSelectedTopic(topic);
    setSearchQuery(topic);
  };

  return (
    <div className="relative">
      {/* Main Content */}
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
                  setSelectedTopic("");
                }}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              onClick={handleSearch}
              className={`px-6 py-4 bg-purple-200 text-purple-600 rounded-xl hover:bg-purple-700 hover:text-white transition-colors flex items-center justify-center gap-2 sm:w-auto w-full ${
                pageLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={pageLoading}
            >
              {pageLoading ? (
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
                  onClick={() => handlePresetTopicClick(topic)}
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

        {/* Overview Section */}
        <Overview
          expanded={expanded}
          setExpanded={setExpanded}
          overviewData={overviewData}
          error={error}
        />

        {/* Articles & Knowledge Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
          <Articles />
          <KnowledgeGraph
            edges={graphData.edges}
            loading={false}
            error={graphError}
          />
        </div>

        <div className="mb-6">
          <PathwayFinder />
        </div>
        <NodeExplorer />

        {/* TopicInfo Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <TopicInfo
            title="Visibility"
            content={
              topicOverview
                ? topicOverview.visibility
                : "No topic overview data available for Visibility at this time."
            }
            icon={<Eye className="h-6 w-6" />}
            analystNotes={analystNotesData.Visibility}
          />
          <TopicInfo
            title="Impact"
            content={
              topicOverview
                ? topicOverview.impact
                : "No topic overview data available for Impact at this time."
            }
            icon={<BarChart className="h-6 w-6" />}
            analystNotes={analystNotesData.Impact}
          />
          <TopicInfo
            title="Prioritization"
            content={
              topicOverview
                ? topicOverview.prioritization
                : "No topic overview data available for Prioritization at this time."
            }
            icon={<Target className="h-6 w-6" />}
            analystNotes={analystNotesData.Prioritization}
          />
        </div>
      </div>

      {/* Semi-Transparent Loading Overlay */}
      {pageLoading && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      )}
    </div>
  );
}
