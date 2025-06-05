import React, { useEffect, useRef } from 'react';

function AnimatedLabel({ text, visible }) {
  const labelRef = useRef(null);

  useEffect(() => {
    if (!labelRef.current) return;
    
    // Immediately show/hide without animation if needed
    if (visible) {
      labelRef.current.style.display = 'block';
      labelRef.current.classList.add('visible');
      labelRef.current.classList.remove('hidden');
    } else {
      labelRef.current.classList.add('hidden');
      labelRef.current.classList.remove('visible');
      // Optional: Hide completely after animation
      setTimeout(() => {
        if (labelRef.current && !visible) {
          labelRef.current.style.display = 'none';
        }
      }, 300); // Match this with CSS transition time
    }
  }, [visible]);

  return (
    <div 
      ref={labelRef}
      className="bubble-label hidden"
      style={{ display: 'none' }} // Start hidden
    >
      {text}
    </div>
  );
}
export default AnimatedLabel;