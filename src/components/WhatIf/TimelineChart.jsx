export default function TimelineChart({ data }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-5 top-0 w-px h-full bg-gradient-to-b from-gray-200 via-gray-200/50 to-transparent" />

      {data.map((item, index) => (
        <div key={index} className="relative mb-8 pl-8 group">
          <div className="absolute left-0 top-2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow transition-transform group-hover:scale-125" />

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm transition-shadow group-hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className="block text-sm text-gray-500 mt-1">
                  {item.date}
                </span>
              </div>
              <span className="px-2 py-1 bg-purple-50 text-purple-600 text-sm rounded-full">
                {item.count} Articles
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${Math.min(item.count * 5, 100)}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {item.count}x Coverage
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
