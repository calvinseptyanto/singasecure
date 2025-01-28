import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";

export default function TopicInfo({ title, content, icon }) {
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-200 transition-colors relative overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      )}

      <div className="absolute left-0 top-0 h-full w-1 bg-purple-600" />
      <div className="flex items-start gap-4">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
          {icon}
        </div>
        <div className="relative flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

          {/* OnMouseUp to capture selected text */}
          <div onMouseUp={handleTextSelect} className="selectable-content">
            <p className="text-gray-600">{content}</p>
          </div>

          {/* Clarification Button */}
          {showClarificationBtn && (
            <button
              onClick={handleClarify}
              className="flex items-center gap-2 text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-md hover:bg-purple-200 transition-colors mt-2"
            >
              <MessageSquare className="h-4 w-4" />
              Explain selected text
            </button>
          )}

          {/* Simulated LLM Response */}
          {showResponse && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Explanation for:{" "}
                  <span className="italic">"{selectedText}"</span>
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  Close
                </button>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {/* Mock Explanation */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
