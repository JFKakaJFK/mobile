import React from 'react';

export default function Button({ children, ...props }) {
  return <button {...props} className={`${props.className || ''} text-dark-blue text-xs font-bold uppercase bg-baby-blue rounded-full py-3 px-10 hover:shadow transition-shadow`}>{children}</button>
}