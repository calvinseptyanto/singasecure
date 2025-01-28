import { useState } from "react";
import { AlertCircle, Loader2, MessageSquare } from "lucide-react";

export default function LLMResponse({ content }) {
  const [selectedText, setSelectedText] = useState("");
  const [showClarificationBtn, setShowClarificationBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleTextSelect = () => {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      setShowClarificationBtn(false);
      return;
    }
    setSelectedText(selection);
    setShowClarificationBtn(true);
    setShowResponse(false);
  };

  const handleClarify = async () => {
    setIsLoading(true);
    setShowClarificationBtn(false);

    // Simulate LLM API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setShowResponse(true);
  };

  const handleClose = () => {
    setShowClarificationBtn(false);
    setShowResponse(false);
    window.getSelection().empty();
  };

  return (
    <div className="relative bg-purple-50 p-6 rounded-xl border border-purple-200">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-purple-600 text-white p-2 rounded-lg">
          <AlertCircle className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold">Response</h3>
      </div>

      {/* Highlightable Content */}
      <div onMouseUp={handleTextSelect}>
        <p className="text-gray-700 leading-relaxed">{content}</p>
      </div>

      {/* Clarification Button */}
      {showClarificationBtn && (
        <button
          onClick={handleClarify}
          className="mt-2 flex items-center gap-2 text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-md hover:bg-purple-200 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Explain selected text
        </button>
      )}

      {/* Mock LLM Response */}
      {showResponse && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Explanation for: <span className="italic">"{selectedText}"</span>
            </h4>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Close
            </button>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {/* Put your actual explanation or mock text here */}
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      )}
    </div>
  );
}
