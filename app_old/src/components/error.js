import React from 'react';

export default function Error({ message = null }) {
  return <p className="text-red-300 font-bold text-center mb-3 reserve-space">{message}</p>
}