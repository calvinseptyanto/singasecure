import { Database, Tag, ArrowUpRight } from "lucide-react";

export default function KeyEntities({ icon, title, items }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-100 transition-colors group/card">
      <div className="flex items-center gap-3 mb-5">
        <span className="bg-purple-100/80 p-2 rounded-lg text-purple-600 backdrop-blur-sm">
          {icon}
        </span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => {
          const displayName =
            typeof item === "string" ? item : item.name || item.facet;
          const initials =
            displayName && !item.facet
              ? displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : null;

          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-colors group/item relative"
            >
              {/* Icon Container */}
              <div className="relative flex-shrink-0">
                {item.facet ? (
                  <span className="bg-blue-100/80 p-2 rounded-full flex items-center justify-center w-10 h-10 backdrop-blur-sm">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </span>
                ) : (
                  <div className="relative">
                    <span className="bg-gray-100/80 p-2 rounded-full flex items-center justify-center w-10 h-10 backdrop-blur-sm">
                      {typeof item === "string" ? (
                        <Database className="h-4 w-4 text-gray-600" />
                      ) : (
                        <span className="font-medium text-gray-600 text-sm">
                          {initials}
                        </span>
                      )}
                    </span>
                    {!item.facet && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white" />
                    )}
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {displayName}
                </p>
                {item.role && (
                  <p className="text-sm text-gray-500/90 truncate">
                    {item.role}
                  </p>
                )}
              </div>

              {/* Mention Count */}
              <div className="flex items-center gap-1.5 text-sm text-purple-600/90 font-medium pl-2">
                <span className="whitespace-nowrap">
                  {typeof item !== "string" && item.mention_count
                    ? `Mentioned ${item.mention_count}x`
                    : "Mentioned 5x"}
                </span>
                <ArrowUpRight className="h-4 w-4 text-purple-500/80 group-hover/item:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
