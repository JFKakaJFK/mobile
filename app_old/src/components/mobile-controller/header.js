import React from 'react'

export default function Header({ left, right, children }) {
  return (
    <header className="flex justify-between items-center py-2 px-4" style={{ height: 72 }}>
      <span className="overflow-hidden flex justify-center items-center" style={{ width: 48, height: 48 }}>{left}</span>
      <h2 className="font-bold text-baby-blue uppercase">{children}</h2>
      <span className="overflow-hidden flex justify-center items-center" style={{ width: 48, height: 48 }}>{right}</span>
    </header>
  )
}