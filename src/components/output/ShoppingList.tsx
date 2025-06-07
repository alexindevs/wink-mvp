'use client'

import { X } from 'lucide-react'

export function ShoppingListModal({
  items,
  checkedItems,
  onToggle,
  onCopyList,
  onClearChecked,
  onClose,
}: {
  items: string[]
  checkedItems: Set<string>
  onToggle: (item: string) => void
  onClearChecked: () => void
  onCopyList: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
      <div className="bg-background w-full h-screen md:h-[90vh] max-w-md p-6 overflow-y-auto md:rounded-t-lg sm:rounded-lg animate-slide-up relative">
        <button className="absolute top-4 right-4 text-muted" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center">Shopping List</h2>

        <ul className="space-y-4 mb-8">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <input
                id={item}
                type="checkbox"
                checked={checkedItems.has(item)}
                onChange={() => onToggle(item)}
                className="accent-accent bg-accent text-accent-foreground w-5 h-5 rounded"
              />
              <label htmlFor={item} className="text-foreground text-sm capitalize">
                {item}
              </label>
            </li>
          ))}
        </ul>

        <div className="flex justify-between">
          <button
            className="bg-input text-foreground font-semibold px-4 py-2 rounded-xl"
            onClick={onClearChecked}
          >
            Clear Checked
          </button>
          <button
            className="bg-accent text-foreground font-semibold px-4 py-2 rounded-xl"
            onClick={onCopyList}
          >
            Copy List
          </button>
        </div>
      </div>
    </div>
  )
}
