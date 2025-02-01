import { useState } from "react";
import { Search, User, Crosshair, Clock } from "lucide-react";
import LLMResponse from "@/components/WhatIf/LLMResponse";
import TimelineChart from "@/components/WhatIf/TimelineChart";
import KeyEntities from "@/components/WhatIf/KeyEntities";
import OutlookPanel from "@/components/WhatIf/OutlookPanel";
import UniqueInfoPanel from "@/components/WhatIf/UniqueInfoPanel";

export default function WhatIf() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://0.0.0.0:8021/api/whatif", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching what-if analysis:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl space-y-8">
      {/* Query Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              placeholder="Ask a national security what-if question..."
              className="w-full pl-10 pr-4 py-4 rounded-xl text-base border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-4 bg-purple-200 text-purple-600 rounded-xl hover:bg-purple-700 hover:text-white transition-colors flex items-center justify-center gap-2 sm:w-auto w-full"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Render the summary once available */}
        {result && <LLMResponse content={result.summary} />}
      </div>

      {/* Render additional panels if a result exists */}
      {result && (
        <>
          {/* Timeline */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Incident Timeline
            </h2>
            <TimelineChart data={result.timeline} />
          </div>

          {/* Key People & Facets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeyEntities
              icon={<User className="h-5 w-5" />}
              title="Key Personnel"
              items={result.people}
            />
            <KeyEntities
              icon={<Crosshair className="h-5 w-5" />}
              title="Critical Facets"
              items={result.facets}
            />
          </div>

          {/* Outlook & Unique Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OutlookPanel content={result.outlook} />
            <UniqueInfoPanel
              uniqueInfo={
                Array.isArray(result.uniqueInfo)
                  ? result.uniqueInfo
                  : [result.uniqueInfo]
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
