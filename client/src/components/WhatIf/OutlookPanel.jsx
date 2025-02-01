import { ShieldAlert } from "lucide-react";

export default function OutlookPanel({ content }) {
  const { description, threat_score } = content;

  // Color calculations based on 1-10 score
  const threatColor =
    threat_score >= 7 ? "red" : threat_score >= 4 ? "orange" : "green";
  const threatPercentage = Math.min(Math.max(threat_score, 0), 10) * 10;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group hover:border-blue-100 transition-colors">
      {/* Fixed Header Section */}
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 relative">
          <span
            className={`
            ${
              threatColor === "red"
                ? "bg-red-100"
                : threatColor === "orange"
                ? "bg-orange-100"
                : "bg-green-100"
            } 
            p-2.5 rounded-lg 
            ${
              threatColor === "red"
                ? "text-red-600"
                : threatColor === "orange"
                ? "text-orange-600"
                : "text-green-600"
            }
            inline-flex items-center justify-center
          `}
          >
            <ShieldAlert className="h-6 w-6" />
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">
              Regulatory Outlook Analysis
            </h3>
            <span
              className={`px-2.5 py-1 bg-${threatColor}-50 text-${threatColor}-700 text-xs font-medium rounded-full`}
            >
              Threat Score: {threat_score}/10
            </span>
          </div>

          <div className="mt-3 space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>

            {/* Threat Level Meter */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-gray-600">Risk Level</span>
                <span className={`text-${threatColor}-600`}>
                  {threatPercentage}% Severity
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${threatColor}-500 transition-all duration-500 ease-out`}
                  style={{ width: `${threatPercentage}%` }}
                />
              </div>
            </div>

            {/* Advisory Section */}
            <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <span className="font-semibold">Recommended Action: </span>
                <span>
                  Implement enhanced compliance protocols and monitor regulatory
                  updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-white text-xs font-medium text-gray-600 rounded-full border border-gray-200">
            Sector: Social Media
          </span>
          <span className="px-2.5 py-1 bg-white text-xs font-medium text-blue-600 rounded-full border border-blue-200">
            Priority: High
          </span>
          <span className="px-2.5 py-1 bg-white text-xs font-medium text-purple-600 rounded-full border border-purple-200">
            Review Cycle: Quarterly
          </span>
        </div>
      </div>
    </div>
  );
}
