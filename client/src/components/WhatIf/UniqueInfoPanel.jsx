import { AlertCircle } from "lucide-react";

export default function UniqueInfoPanel({ uniqueInfo }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group hover:border-yellow-200 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600 group-hover:bg-yellow-200 transition-colors">
          <AlertCircle className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Unique Intelligence</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
              Requires Verification
            </span>
            <span className="text-sm text-gray-500">3 Independent Sources</span>
          </div>
        </div>
      </div>
      <div className="relative p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="absolute top-2 right-2 text-yellow-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        {Array.isArray(uniqueInfo) ? (
          <ul className="list-disc pl-5 text-gray-700 leading-relaxed pr-6">
            {uniqueInfo.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 leading-relaxed pr-6">{uniqueInfo}</p>
        )}
        <div className="mt-4 pt-3 border-t border-yellow-100">
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-white text-xs font-medium text-red-600 rounded-full border border-red-200">
              Uncorroborated
            </span>
            <span className="px-2 py-1 bg-white text-xs font-medium text-violet-600 rounded-full border border-violet-200">
              New Pattern
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
