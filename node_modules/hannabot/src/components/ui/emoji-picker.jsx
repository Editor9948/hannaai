import React from "react";

// A basic emoji list. You can expand this as needed.
const emojis = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😎", "😢", "😭", "😡", "👍", "👏", "🙏", "🔥", "💯", "🎉", "🚀", "❤️", "😅", "🤔"
];

export function EmojiPicker({ onEmojiSelect }) {
  return (
    <div className="grid grid-cols-8 gap-2 p-2">
      {emojis.map((emoji, idx) => (
        <button
          key={idx}
          type="button"
          className="text-2xl hover:bg-gray-100 rounded transition"
          onClick={() => onEmojiSelect && onEmojiSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}