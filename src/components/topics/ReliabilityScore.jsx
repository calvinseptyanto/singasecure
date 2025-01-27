const ReliabilityScore = ({ score, compact = false }) => {
  const getColor = () => {
    if (score < 0.7) return "text-red-500";
    if (score < 0.85) return "text-yellow-500";
    return "text-green-500";
  };

  return compact ? (
    <span className={`text-sm font-medium ${getColor()}`}>
      {Math.round(score * 100)}% Reliable
    </span>
  ) : (
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className={getColor()}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score)}`}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold ${getColor()}`}
        >
          {Math.round(score * 100)}%
        </span>
      </div>
    </div>
  );
};

export default ReliabilityScore;
