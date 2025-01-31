import { useState } from "react";
import { FileText, Newspaper, X, Plus, Link, FileUp } from "lucide-react";
import newsExcerpts from "@/assets/Dataset/news_excerpts_parsed.json";
import wikileaksDocs from "@/assets/Dataset/wikileaks_parsed.json";

// Example fixed scores for demonstration purposes
const fixedScores = {
  news: [85.3, 90.5, 78.2, 92.1, 88.0, 81.4, 95.6, 83.9, 89.7, 87.5],
  pdf: [80.2, 86.4, 75.0, 91.3, 84.5, 77.8, 93.2, 82.6, 88.9, 85.1],
};

const Articles = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Assign fixed scores instead of randomizing
  const processedNews = newsExcerpts.map((article, index) => ({
    ...article,
    type: "news",
    score: fixedScores.news[index % fixedScores.news.length],
    conflicts: Math.floor(Math.random() * 3) + 1,
  }));

  const processedWikileaks = wikileaksDocs.map((article, index) => ({
    ...article,
    type: "pdf",
    score: fixedScores.pdf[index % fixedScores.pdf.length],
    conflicts: Math.floor(Math.random() * 2) + 1,
  }));

  const allArticles = [...processedNews, ...processedWikileaks];

  const getConflictExplanation = (article) => {
    if (article.type === "news") {
      return `Found ${article.conflicts} conflict${
        article.conflicts > 1 ? "s" : ""
      } with ${article.conflicts} other news source${
        article.conflicts > 1 ? "s" : ""
      } and ${Math.floor(Math.random() * 2)} Wikileaks documents`;
    }
    return `Found ${article.conflicts} inconsistency${
      article.conflicts > 1 ? "ies" : "y"
    } with publicly available records and ${Math.floor(
      Math.random() * 3
    )} news reports`;
  };

  // Function to determine color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Function to truncate hostname to first 15 characters
  const truncateHostname = (hostname) => {
    if (hostname.length > 11) {
      return `${hostname.slice(0, 11)}...`;
    }
    return hostname;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[800px] flex flex-col relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Add Article +
        </button>
      </div>

      {/* Enhanced Grid with Adjusted Columns */}
      <div className="flex-1 grid grid-cols-3 gap-5 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200">
        {allArticles.map((article, index) => (
          <div
            key={index}
            onClick={() => setSelectedArticle(article)}
            className="group rounded-xl p-4 hover:ring-1 cursor-pointer bg-white shadow-sm hover:shadow-md transition-all ring-gray-100 flex flex-col justify-between min-h-[120px]"
          >
            {/* Top Section */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  article.type === "news"
                    ? "bg-violet-100 text-violet-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {article.type === "news" ? (
                  <Newspaper className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {article.type === "news"
                    ? `News ${index + 1}`
                    : article["PDF Path"]}
                </h3>
                <div
                  className="text-sm text-gray-500 max-w-[15ch] truncate"
                  title={
                    article.type === "news"
                      ? new URL(article.Link).hostname
                      : undefined
                  }
                >
                  {article.type === "news"
                    ? truncateHostname(new URL(article.Link).hostname)
                    : "Classified"}
                </div>
              </div>
            </div>

            {/* Bottom Score Section */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all ${getScoreColor(
                      article.score
                    )}`}
                    style={{ width: `${article.score}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    article.score >= 90
                      ? "text-green-600"
                      : article.score >= 75
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {article.score}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <h2 className="text-xl font-bold mb-6">Add New Article</h2>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Add News Article */}
              <div className="border rounded p-4 text-center hover:bg-gray-50 cursor-pointer">
                <Link className="w-6 h-6 mx-auto mb-2" />
                <p className="mb-2">Add News Article</p>
                <input
                  type="text"
                  placeholder="Enter URL"
                  className="mt-2 w-full p-2 border rounded"
                />
              </div>

              {/* Drag & Drop PDF */}
              <div
                className={`border-2 rounded p-4 text-center cursor-pointer ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-dashed border-gray-300"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  // Handle file drop here
                }}
              >
                <FileUp className="w-6 h-6 mx-auto mb-2" />
                <p>Drag & Drop PDF</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Article Details Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-purple-50 shadow-2xl relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-3">
                  {selectedArticle.type === "news" ? (
                    <Newspaper className="w-8 h-8 text-violet-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-red-400" />
                  )}
                  {selectedArticle.type === "news"
                    ? "News Article"
                    : "Classified Document"}
                </h2>
                <p className="text-purple-500 ml-11">
                  {selectedArticle.type === "news"
                    ? `From ${new URL(selectedArticle.Link).hostname}`
                    : "Sensitive Government Document"}
                </p>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 hover:bg-purple-50 rounded-full text-purple-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-600 mb-1">
                      Reliability Score
                    </p>
                    <p className="text-3xl font-bold text-purple-800">
                      {selectedArticle.score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 mb-1">
                      Identified Conflicts
                    </p>
                    <div className="text-purple-700 text-sm">
                      {getConflictExplanation(selectedArticle)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-purple-700 mb-2">
                  Source URL
                </p>
                <a
                  href={selectedArticle.Link || selectedArticle["PDF Path"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline break-all text-sm"
                >
                  {selectedArticle.Link || selectedArticle["PDF Path"]}
                </a>
              </div>

              <div>
                <p className="text-sm font-medium text-purple-700 mb-2">
                  Full Content
                </p>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap border-t border-purple-50 pt-4 text-sm">
                  {selectedArticle.Text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;
