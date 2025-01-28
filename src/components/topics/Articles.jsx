import { useState } from "react";
import {
  X,
  Plus,
  AlertTriangle,
  ShieldAlert,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import ReliabilityScore from "@/components/topics/ReliabilityScore";

const generateArticles = () => {
  return Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: `News ${i + 1}`,
    excerpt: `Key findings from security analysis #${i + 1}`,
    content: `Full detailed report ${i + 1} - Lorem ipsum dolor sit amet...`,
    image: `https://picsum.photos/400/400?random=${i + 1}`,
    reliability: parseFloat((0.3 + Math.random() * 0.7).toFixed(2)), // Wider score range
    contradictions: Math.floor(Math.random() * 5),
    flags: Math.floor(Math.random() * 3),
    underReview: Math.random() < 0.2,
    adjustedScore:
      Math.random() < 0.3
        ? parseFloat((0.3 + Math.random() * 0.7).toFixed(2))
        : null,
    type: "News URL", // Default type for generated articles
    source: `https://news.example.com/article-${i + 1}`, // Default source
  }));
};

export default function Articles() {
  // Existing state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dummyArticles, setDummyArticles] = useState(generateArticles());
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    image: "",
    type: "News URL", // Default type
    source: "",
    file: null, // For PDF uploads
  });

  // Additional state for analyst requests and confirmations
  const [analystRequests, setAnalystRequests] = useState([]);
  const [showRequestConfirmation, setShowRequestConfirmation] = useState(false);

  const handleAddArticle = (e) => {
    e.preventDefault();

    // Simulate backend processing based on article type
    if (newArticle.type === "News URL") {
      // Simulate fetching article data from the URL
      const article = {
        id: dummyArticles.length + 1,
        title: `News from URL ${dummyArticles.length + 1}`,
        content: `Content fetched from ${newArticle.source}`,
        image:
          newArticle.image ||
          `https://picsum.photos/400/400?random=${dummyArticles.length + 1}`,
        excerpt: `Excerpt from ${newArticle.source}`,
        reliability: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
        contradictions: Math.floor(Math.random() * 3),
        flags: 0, // Initialize flags for new articles
        underReview: false,
        adjustedScore: null,
        type: newArticle.type,
        source: newArticle.source,
      };
      setDummyArticles([...dummyArticles, article]);
    } else if (newArticle.type === "Wikileaks PDF") {
      // Simulate parsing the uploaded PDF
      const pdfTitle = newArticle.file
        ? newArticle.file.name
        : `Wikileaks Document ${dummyArticles.length + 1}`;
      const article = {
        id: dummyArticles.length + 1,
        title: pdfTitle,
        content: `Content extracted from ${pdfTitle}`,
        image:
          newArticle.image ||
          `https://picsum.photos/400/400?random=${dummyArticles.length + 1}`,
        excerpt: `Excerpt from ${pdfTitle}`,
        reliability: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
        contradictions: Math.floor(Math.random() * 3),
        flags: 0, // Initialize flags for new articles
        underReview: false,
        adjustedScore: null,
        type: newArticle.type,
        source: newArticle.file
          ? newArticle.file.name
          : `Wikileaks Document ${dummyArticles.length + 1}`,
      };
      setDummyArticles([...dummyArticles, article]);
    }

    setShowAddForm(false);
    setNewArticle({
      title: "",
      content: "",
      image: "",
      type: "News URL",
      source: "",
      file: null,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[700px] flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Articles</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Article
        </button>
      </div>

      {/* Articles Grid */}
      <div className="flex-1 overflow-y-auto pr-3 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
          {dummyArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {article.underReview && (
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <ClipboardCheck className="h-3 w-3" />
                    <span>Under Review</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {article.title}
                </h3>
                <ReliabilityScore score={article.reliability} compact />
                <p className="text-sm text-gray-500 mt-2 flex-1">
                  {article.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Article Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 overflow-y-auto max-h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Article</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddArticle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newArticle.title}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, title: e.target.value })
                  }
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newArticle.content}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, content: e.target.value })
                  }
                  placeholder="Enter article content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newArticle.image}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, image: e.target.value })
                  }
                  placeholder="Optional: Provide an image URL"
                />
              </div>

              {/* Article Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Article Type
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newArticle.type}
                  onChange={(e) =>
                    setNewArticle({
                      ...newArticle,
                      type: e.target.value,
                      source: "",
                      file: null,
                    })
                  }
                >
                  <option value="News URL">News URL</option>
                  <option value="Wikileaks PDF">Wikileaks PDF</option>
                </select>
              </div>

              {/* Conditional Input Based on Article Type */}
              {newArticle.type === "News URL" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    News URL
                  </label>
                  <input
                    required
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newArticle.source}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, source: e.target.value })
                    }
                    placeholder="https://news.example.com/article"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Wikileaks PDF
                  </label>
                  <input
                    required
                    type="file"
                    accept="application/pdf"
                    className="w-full px-3 py-2 border rounded-lg"
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, file: e.target.files[0] })
                    }
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Article
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedArticle.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-4">
                    <ReliabilityScore score={selectedArticle.reliability} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Reliability Score:{" "}
                        {Math.round(selectedArticle.reliability * 100)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedArticle.contradictions} potential
                        contradictions found
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 flex justify-center items-center w-48 h-48 mx-auto">
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>
              </div>

              <div className="prose max-w-none text-gray-600">
                {selectedArticle.content}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Cross-Reference Analysis
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedArticle.contradictions === 0
                      ? "No significant contradictions found with other articles."
                      : `This article contains ${selectedArticle.contradictions} points that may contradict other sources. Consider cross-checking with related reports.`}
                  </p>
                </div>
              </div>

              {/* Community Quality Control Section */}
              <div className="mt-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
                <h3 className="font-medium text-violet-900 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Community Quality Control
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Citizen Flags</span>
                    <div className="badge bg-red-100 text-red-800">
                      {selectedArticle.flags} reports
                    </div>
                  </div>

                  {selectedArticle.adjustedScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Analyst Adjusted Score</span>
                      <ReliabilityScore
                        score={selectedArticle.adjustedScore}
                        compact
                      />
                    </div>
                  )}

                  {/* Conditionally render the Request Analyst Verification button */}
                  {!selectedArticle.adjustedScore && (
                    <button
                      onClick={() =>
                        setSelectedArticle((prev) => ({
                          ...prev,
                          showReviewRequest: true,
                        }))
                      }
                      className="w-full py-2 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Request Analyst Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Form Modal */}
      {selectedArticle?.showReviewRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-purple-600" />
                Request Analyst Review
              </h2>
              <button onClick={() => setSelectedArticle(null)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium mb-2">Why request a review?</h4>
                <p className="text-sm text-gray-600">
                  Our AI system flagged this article with{" "}
                  {selectedArticle.contradictions} potential contradictions and
                  a reliability score of{" "}
                  {Math.round(selectedArticle.reliability * 100)}%. By
                  requesting a review, our team of SG-certified analysts will:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                  <li>Verify sources against government databases</li>
                  <li>Cross-check with FactCheck.sg archives</li>
                  <li>Provide a human-evaluated score within 24hrs</li>
                  <li>Publish a verification certificate</li>
                </ul>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setAnalystRequests([...analystRequests, selectedArticle.id]);
                  setShowRequestConfirmation(true);
                  setSelectedArticle(null);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Email (for updates)
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason for Request
                  </label>
                  <textarea
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Specific concerns or additional context..."
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Submit for Analyst Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      {showRequestConfirmation && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 animate-fade-in-up">
          <ClipboardCheck className="h-5 w-5" />
          <span>Review request submitted! Average response time: 18hrs</span>
          <button
            onClick={() => setShowRequestConfirmation(false)}
            className="text-green-600 hover:text-green-800 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
