// Topics.jsx
import { useState } from "react";
import {
  Search,
  BookText,
  ShieldAlert,
  Eye,
  BarChart,
  Target,
} from "lucide-react";
import Articles from "@/components/topics/Articles";
import Overview from "@/components/topics/Overview";
import TopicInfo from "@/components/topics/TopicInfo";
import KnowledgeGraph from "@/components/topics/KnowledgeGraph";

// Import your new component
import PathwayFinder from "@/components/topics/PathwayFinder";

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [expanded, setExpanded] = useState(false);

  const presetTopics = ["Terrorism", "Espionage", "Cybersecurity Threats"];

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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="px-6 py-4 bg-purple-200 text-purple-600 rounded-xl hover:bg-purple-700 hover:text-white transition-colors flex items-center justify-center gap-2 sm:w-auto w-full">
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">Search</span>
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
                onClick={() => setSelectedTopic(topic)}
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
      <Overview expanded={expanded} setExpanded={setExpanded} />

      {/* Articles & Knowledge Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
        <Articles />
        <KnowledgeGraph />
      </div>

      {/* 
        Insert PathwayFinder here, 
        just above the "Info Boxes" as requested 
      */}
      <PathwayFinder />

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <TopicInfo
          title="Visibility"
          content="Critical infrastructure vulnerabilities and threat vectors become visible through comprehensive analysis of current security landscapes."
          icon={<Eye className="h-6 w-6" />}
        />
        <TopicInfo
          title="Impact"
          content="Quantitative risk assessment models reveal potential operational and financial impacts on organizational assets."
          icon={<BarChart className="h-6 w-6" />}
        />
        <TopicInfo
          title="Prioritization"
          content="Strategic framework for addressing vulnerabilities based on severity, exploitability, and potential damage mitigation."
          icon={<Target className="h-6 w-6" />}
        />
      </div>
    </div>
  );
}
