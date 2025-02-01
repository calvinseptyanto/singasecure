import {
  Network,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
  NotebookText,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Overview({
  expanded,
  setExpanded,
  overviewData,
  error,
}) {
  const [selectedText, setSelectedText] = useState("");
  const [showClarificationBtn, setShowClarificationBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [threatScore] = useState(() => Math.floor(Math.random() * 3) + 7);

  const handleTextSelect = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text) {
      setShowClarificationBtn(false);
      return;
    }

    setSelectedText(text);
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

  const analystNotes = [
    "Increased phishing attempts targeting gov.sg domains observed since March 2024",
    "Sector 3A infrastructure shows vulnerabilities to SCADA exploits - priority 1",
    "APT group CoralRift suspected in recent healthcare data breaches",
  ];

  useEffect(() => {
    if (!expanded) handleClose();
  }, [expanded]);

  const contentSections = overviewData?.result.split(/\n## /);
  const firstSection = contentSections?.[0];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Threat Overview
            </h2>
          </div>

          {showClarificationBtn && (
            <button
              onClick={handleClarify}
              className="flex items-center gap-2 text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-md hover:bg-purple-200 transition-colors ml-2"
            >
              <MessageSquare className="h-4 w-4" />
              Explain selected text
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
          >
            {expanded ? "Collapse" : "Expand"}
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Analyst's Notes Section */}
      {expanded && (
        <div className="mt-4 mb-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
          <div className="flex items-start gap-3 mb-3">
            <NotebookText className="h-5 w-5 text-violet-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                ISD Analyst Assessment
              </h3>
              <ul className="space-y-3">
                {analystNotes.map((note, index) => (
                  <li
                    key={index}
                    className="text-gray-700 text-sm leading-relaxed flex gap-2"
                  >
                    <span className="text-violet-600">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Display API Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {overviewData && (
        <div className="mb-4 flex items-center gap-0 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-sm w-fit overflow-hidden">
          <div className="flex items-center gap-2 bg-red-700/20 px-4 py-2 backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5 text-red-100 shrink-0" />
            <span className="text-sm font-bold uppercase tracking-wide text-red-50">
              High Risk
            </span>
          </div>
          <div className="px-4 py-2 bg-white/10">
            <span className="text-2xl font-black text-red-50">
              {threatScore}
            </span>
            <span className="text-sm text-red-100 ml-1">/10</span>
          </div>
        </div>
      )}

      {/* If we have overviewData, show the returned markdown. Otherwise, show a placeholder text */}
      {overviewData ? (
        <div
          className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200"
          onMouseUp={handleTextSelect}
        >
          {expanded ? (
            <ReactMarkdown
              className="prose max-w-none text-gray-700 space-y-6"
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-bold text-gray-900 py-3 border-b border-gray-200 bg-gray-50 px-4 -mx-4 my-4 
        first:border-t-0 relative
        before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-purple-200"
                    {...props}
                  />
                ),
                h4: ({ node, ...props }) => (
                  <h4
                    className="text-base font-semibold text-gray-800 mt-6 mb-3"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-gray-700 leading-relaxed mb-4 pl-4"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc pl-8 space-y-2 mb-6 border-l-2 border-purple-100"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="pl-2 marker:text-purple-400" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-gray-900" {...props} />
                ),
              }}
            >
              {overviewData.result}
            </ReactMarkdown>
          ) : (
            <div className="line-clamp-[8]">
              <ReactMarkdown
                className="prose max-w-none text-gray-700"
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-lg font-bold text-gray-900 py-3 border-b border-gray-200 bg-gray-50 px-4 -mx-4 mt-0 mb-4 
            before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-purple-200"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="text-gray-700 leading-relaxed mb-4 pl-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc pl-8 space-y-2 mb-4 border-l-2 border-purple-100"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="pl-2 marker:text-purple-400" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong
                      className="font-semibold text-gray-900"
                      {...props}
                    />
                  ),
                }}
              >
                {firstSection}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ) : (
        <div
          onMouseUp={handleTextSelect}
          className={`selectable-content text-gray-600 ${
            expanded ? "" : "line-clamp-3"
          } transition-all`}
        >
          <p
            className={`text-gray-600 ${
              expanded ? "" : "line-clamp-3"
            } transition-all`}
          >
            {/* Placeholder text when no data is returned yet */}
            Nothing to display yet. Try searching for a topic or clicking one of
            the popular topics above.
          </p>
        </div>
      )}

      {/* Simulated LLM Response for "Explain selected text" */}
      {showResponse && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Explanation for:{" "}
              <span className="font-normal italic">"{selectedText}"</span>
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Close
            </button>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {/* Example text from an LLM or placeholder */}
            This is where the large language model explanation for “
            {selectedText}” would appear.
          </p>
        </div>
      )}
    </div>
  );
}
