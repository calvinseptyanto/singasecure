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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
