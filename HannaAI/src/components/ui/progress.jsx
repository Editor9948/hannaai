import React from "react";

export function Progress({ value = 0, className = "", ...props }) {
  // Clamp value between 0 and 100
  const percent = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="bg-primary h-2 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default Progress;