export default function TopicInfo({ title, content, icon }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-200 transition-colors relative overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-1 bg-purple-600" />
      <div className="flex items-start gap-4">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{content}</p>
        </div>
      </div>
    </div>
  );
}
