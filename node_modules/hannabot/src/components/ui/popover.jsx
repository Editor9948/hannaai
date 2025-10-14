import React, { useState, useRef, useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";

// PopoverTrigger: wraps the element that opens the popover
export const PopoverTrigger = forwardRef(function PopoverTrigger({ children, onClick }, ref) {
  return React.cloneElement(children, {
    ref,
    onClick: (e) => {
      if (children.props.onClick) children.props.onClick(e);
      if (onClick) onClick(e);
    },
  });
});

// PopoverContent: the content of the popover, rendered in a portal
export function PopoverContent({ children, open, anchorRef, onClose, className = "" }) {
  const contentRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  // Positioning: simple absolute below the anchor
  const anchorRect = anchorRef.current?.getBoundingClientRect();
  const style = anchorRect
    ? {
        position: "absolute",
        top: anchorRect.bottom + window.scrollY + 8,
        left: anchorRect.left + window.scrollX,
        zIndex: 9999,
      }
    : {};

  return createPortal(
    <div
      ref={contentRef}
      style={style}
      className={`bg-white border rounded shadow-lg p-4 min-w-[200px] ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}

// Popover: manages open/close state and renders trigger/content
export function Popover({ children }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef();

  // Expect children as [<PopoverTrigger>, <PopoverContent>]
  const trigger = React.Children.toArray(children).find(
    (child) => child.type === PopoverTrigger
  );
  const content = React.Children.toArray(children).find(
    (child) => child.type === PopoverContent
  );

  return (
    <>
      {trigger &&
        React.cloneElement(trigger, {
          ref: anchorRef,
          onClick: () => setOpen((v) => !v),
        })}
      {content &&
        React.cloneElement(content, {
          open,
          anchorRef,
          onClose: () => setOpen(false),
        })}
    </>
  );
}