import {
  Network,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
  NotebookText, // New icon for analyst notes
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Overview({ expanded, setExpanded }) {
  const [selectedText, setSelectedText] = useState("");
  const [showClarificationBtn, setShowClarificationBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleTextSelect = (e) => {
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

      {/* Analysts' Notes Section */}
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

      {/* Simulated LLM Response */}
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
      )}
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
          Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti sit sed
          tempus vehicula massa dis ad. Eros ut egestas faucibus; nulla nunc
          iaculis. Vivamus adipiscing aptent ridiculus dignissim urna elit
          ullamcorper dis. Cubilia dolor blandit feugiat quis quam suscipit
          interdum praesent. Ex aliquet vel ridiculus malesuada metus
          condimentum netus. Dictum tincidunt turpis mattis non mollis neque
          finibus luctus mauris. Vel quisque libero eros vivamus ac habitant
          odio. Eu lectus vestibulum feugiat blandit cubilia litora nam aenean.
          Vestibulum consequat ornare ut iaculis; fermentum blandit. Elit leo
          elit elit, posuere aenean dapibus. Integer aliquet euismod turpis
          tristique morbi mollis malesuada faucibus tempus. Faucibus sapien
          imperdiet ligula conubia mi cras scelerisque porttitor maecenas.
          Mattis ex libero amet lorem elit risus non a. Sapien dapibus quis
          pellentesque turpis ridiculus suscipit. Cras curae fusce efficitur
          parturient laoreet vel; netus nostra vel. Euismod vestibulum eget non
          velit habitasse euismod; dignissim varius. Dolor sociosqu conubia dui
          fermentum velit at potenti egestas dolor? Faucibus ac at commodo per
          maecenas nec. Justo ornare maecenas vestibulum sapien maecenas a
          dignissim diam sem. Eu eget nullam odio cursus dui habitant. Dignissim
          mauris hac leo magna orci at tristique congue. Fusce cubilia felis
          integer libero bibendum vitae. Dictum cubilia nisl lectus viverra
          placerat potenti sapien. Ullamcorper rutrum venenatis nullam a
          parturient. Senectus nascetur varius ultricies maecenas lobortis
          viverra parturient curabitur. Metus ultrices in diam etiam a,
          phasellus consectetur vulputate. Conubia laoreet libero mi porta
          conubia dui malesuada consectetur. Orci habitasse justo vitae, enim
          efficitur laoreet. Duis per interdum massa varius iaculis hendrerit
          orci. Litora fusce primis pretium lorem lacus mi, cursus aenean.
          Vehicula fames finibus suspendisse porta nulla, sagittis rhoncus ac.
          Congue ultrices vehicula quis primis porttitor mi. Phasellus porttitor
          molestie habitant aliquet posuere tortor ad at. Netus mattis ultrices
          primis rhoncus etiam in netus duis mi. Vestibulum vel quisque rhoncus
          lectus leo; vehicula tristique. Vel bibendum ullamcorper praesent,
          euismod sagittis luctus parturient mattis. Pellentesque sodales ipsum
          malesuada accumsan consequat mattis. Euismod fusce primis pharetra
          vestibulum proin convallis. Nullam urna tempor nostra accumsan porta
          commodo euismod velit. Sed finibus nisi lacus per; metus tempor vitae
          consectetur.
        </p>
      </div>
    </div>
  );
}
