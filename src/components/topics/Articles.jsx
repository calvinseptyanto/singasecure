import { useState } from "react";
import { X, Plus } from "lucide-react";
import ReliabilityScore from "@/components/topics/ReliabilityScore";

const generateArticles = () => {
  return Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: `News ${i + 1}`,
    excerpt: `Key findings from security analysis #${i + 1}`,
    content: `Full detailed report ${i + 1} - Lorem ipsum dolor sit amet...`,
    image: `https://picsum.photos/400/400?random=${i + 1}`,
    reliability: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
    contradictions: Math.floor(Math.random() * 3),
  }));
};

export default function Articles() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dummyArticles, setDummyArticles] = useState(generateArticles());
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    image: "",
  });

  const handleAddArticle = (e) => {
    e.preventDefault();
    const article = {
      id: dummyArticles.length + 1,
      ...newArticle,
      excerpt: newArticle.content.substring(0, 100) + "...",
      reliability: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
      contradictions: Math.floor(Math.random() * 3),
    };
    setDummyArticles([...dummyArticles, article]);
    setShowAddForm(false);
    setNewArticle({ title: "", content: "", image: "" });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[700px] flex flex-col">
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

      <div className="flex-1 overflow-y-auto pr-3 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
          {dummyArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-2">
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
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newArticle.image}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, image: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
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
                      ? "No significant contradictions found with other articles"
                      : `This article contains ${selectedArticle.contradictions} points that may contradict other sources. Consider cross-checking with related reports.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
