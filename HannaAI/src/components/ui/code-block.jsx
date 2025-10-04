import React, { useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css"; // You can use another Prism theme if you like

// Load language support as needed
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup"; // for HTML
import "prismjs/components/prism-css";

export function CodeBlock({ code, language = "javascript", editable = false, onSave, initialCode }) {
  const [editMode, setEditMode] = useState(false);
  const [currentCode, setCurrentCode] = useState(initialCode || code || "");

  // Highlight code using Prism
  const highlighted = Prism.highlight(currentCode, Prism.languages[language] || Prism.languages.javascript, language);

  if (editable) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 mb-2">
        {editMode ? (
          <div>
            <textarea
              className="w-full h-40 bg-gray-800 text-white font-mono rounded p-2 mb-2"
              value={currentCode}
              onChange={e => setCurrentCode(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-primary text-white rounded"
                onClick={() => {
                  setEditMode(false);
                  if (onSave) onSave(currentCode);
                }}
              >
                Save
              </button>
              <button
                className="px-3 py-1 bg-gray-600 text-white rounded"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <pre className="overflow-x-auto">
              <code
                className={`language-${language}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
            <button
              className="mt-2 px-3 py-1 bg-primary text-white rounded"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    );
  }

  // Read-only mode
  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-2">
      <pre className="overflow-x-auto">
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{
            __html: Prism.highlight(code || "", Prism.languages[language] || Prism.languages.javascript, language),
          }}
        />
      </pre>
    </div>
  );
}