import React, { forwardRef } from 'react'

// Minimal ScrollArea that provides a viewport div compatible with the selector
export const ScrollArea = forwardRef(function ScrollArea(
  { className = '', children, style, ...props },
  ref
) {
  return (
    <div className={className} style={{ position: 'relative', ...style }} {...props}>
      <div
        ref={ref}
        data-radix-scroll-area-viewport
        style={{ overflowY: 'auto', maxHeight: '100%' }}
        className="h-full w-full"
      >
        {children}
      </div>
    </div>
  )
})

export default ScrollArea
