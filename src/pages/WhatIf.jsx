import { useState } from "react";
import { Search, User, Crosshair, Clock } from "lucide-react";
import LLMResponse from "@/components/WhatIf/LLMResponse";
import TimelineChart from "@/components/WhatIf/TimelineChart";
import KeyEntities from "@/components/WhatIf/KeyEntities";
import OutlookPanel from "@/components/WhatIf/OutlookPanel";
import UniqueInfoPanel from "@/components/WhatIf/UniqueInfoPanel";

export default function WhatIf() {
  const [query, setQuery] = useState("");
  const [mockResponse] = useState({
    summary: `Analysis suggests a 68% probability of increased cyber attacks on critical infrastructure through 2025. Recent incidents show...`,
    timeline: [
      { date: "2024-03-15", title: "Grid Vulnerability Report", count: 12 },
      { date: "2024-04-02", title: "AI Defense Framework", count: 8 },
      {
        date: "2024-05-20",
        title: "Quantum Encryption Breakthrough",
        count: 15,
      },
    ],
    people: [
      { name: "Dr. Alice Chen", role: "Cybersecurity Director" },
      { name: "John Malkovich", role: "Critical Infrastructure Advisor" },
    ],
    facets: ["AI-Powered Attacks", "Grid Vulnerability", "Quantum Encryption"],
    outlook: "Potential for 40% increase in state-sponsored attacks...",
    uniqueInfo:
      "Emerging pattern of drone-based grid mapping preceding attacks...",
  });

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
          <button className="px-6 py-4 bg-purple-200 text-purple-600 rounded-xl hover:bg-purple-700 hover:text-white transition-colors flex items-center justify-center gap-2 sm:w-auto w-full">
            <span>Analyze</span>
          </button>
        </div>

        <LLMResponse content={mockResponse.summary} />
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Incident Timeline
        </h2>
        <TimelineChart data={mockResponse.timeline} />
      </div>

      {/* Key People & Facets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KeyEntities
          icon={<User className="h-5 w-5" />}
          title="Key Personnel"
          items={mockResponse.people}
        />
        <KeyEntities
          icon={<Crosshair className="h-5 w-5" />}
          title="Critical Facets"
          items={mockResponse.facets}
        />
      </div>

      {/* Outlook & Unique Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OutlookPanel content={mockResponse.outlook} />
        <UniqueInfoPanel content={mockResponse.uniqueInfo} />
      </div>
    </div>
  );
}
