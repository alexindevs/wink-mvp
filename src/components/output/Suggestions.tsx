'use client'

import Image from 'next/image'

export interface MealSuggestion {
  name: string
  description: string
  ingredients: string[]
  missingIngredients: string[]
  steps: string[]
  picture: string
}

export function Suggestions({
  suggestions,
  onSelect,
}: {
  suggestions: MealSuggestion[]
  onSelect: (meal: MealSuggestion) => void
}) {
  return (
    <section className="p-4">
      <h2 className="font-bold text-2xl my-4">Meal Suggestions</h2>
      <div className="flex flex-col space-y-6">
        {suggestions.map((suggestion) => (
          <div
          key={suggestion.name}
          onClick={() => onSelect(suggestion)}
          className="cursor-pointer flex items-start gap-4 border-b border-border pb-4 hover:bg-muted/40 transition rounded-lg p-2"
        >
            <div className="flex-grow">
              <p className="text-muted text-sm">
                Missing: {suggestion.missingIngredients.length}{' '}
                {suggestion.missingIngredients.length === 1 ? 'item' : 'items'}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {suggestion.name}
              </p>
              <p className="text-muted text-sm">{suggestion.description}</p>
            </div>

            {suggestion.picture && (
              <div className="min-w-[96px] max-w-[96px] h-[96px] relative rounded overflow-hidden">
                <Image
                  src={suggestion.picture}
                  alt={suggestion.name}
                  fill
                  className="object-cover rounded"
                  sizes="96px"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
