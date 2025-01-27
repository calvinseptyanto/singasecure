import { TrendingUp } from "lucide-react";
export default function OutlookPanel({ content }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group hover:border-green-200 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:bg-green-200 transition-colors">
          <TrendingUp className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Projected Outlook</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
              High Confidence
            </span>
            <span className="text-sm text-gray-500">82% Threat Score</span>
          </div>
        </div>
      </div>
      <div className="p-4 bg-green-50 rounded-lg border border-green-200 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 opacity-10">
          <TrendingUp className="h-24 w-24 text-green-600" />
        </div>
        <p className="text-gray-700 leading-relaxed relative z-10">{content}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-green-600 animate-pulse" />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>Current Risk</span>
              <span>+42% YoY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
