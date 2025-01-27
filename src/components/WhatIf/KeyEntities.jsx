import { User, Database } from "lucide-react";
export default function KeyEntities({ icon, title, items }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-200 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-purple-100 p-2 rounded-lg text-purple-600">
          {icon}
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group relative"
          >
            <div className="relative">
              <span className="bg-gray-100 p-2 rounded-full flex items-center justify-center w-10 h-10">
                {typeof item === "string" ? (
                  <Database className="h-4 w-4 text-gray-600" />
                ) : (
                  <div className="font-medium text-gray-600">
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
              </span>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {typeof item === "string" ? item : item.name}
              </p>
              {item.role && (
                <p className="text-sm text-gray-500">{item.role}</p>
              )}
            </div>
            <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
              Mentioned in articles 5 times
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
