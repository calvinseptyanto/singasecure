import { AlertCircle } from "lucide-react";
export default function LLMResponse({ content }) {
  return (
    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-purple-600 text-white p-2 rounded-lg">
          <AlertCircle className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold">Response</h3>
      </div>
      <p className="text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}
