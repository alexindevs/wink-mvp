'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { MealSuggestion } from './Suggestions'

export function MealModal({
    meal,
    onClose,
    onAddToList,
  }: {
    meal: MealSuggestion
    onClose: () => void
    onAddToList: () => void
  }) {
  return (
    <div className="relative flex items-center justify-center">
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/70" onClick={onClose}></div>
      <div
      className="bg-background rounded-t-lg sm:rounded-lg w-full sm:max-w-xl p-6 absolute bottom-full max-h-[90vh] overflow-y-auto
      animate-slide-up sm:animate-fade-in"
    >
        <button
          className="absolute top-4 right-4 text-muted"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-2">{meal.name}</h2>
        <p className="text-muted mb-4">{meal.description}</p>

        {meal.picture && (
          <div className="relative w-full h-48 rounded overflow-hidden mb-4">
            <Image
              src={meal.picture}
              alt={meal.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <h3 className="font-semibold mb-2">Ingredients</h3>
        <ul className="space-y-1 mb-4">
          {meal.ingredients.map((item) => (
            <li
              key={item}
              className={`text-sm ${
                meal.missingIngredients.includes(item)
                  ? 'line-through text-muted'
                  : 'text-foreground'
              }`}
            >
              {item}
            </li>
          ))}
        </ul>

        <h3 className="font-semibold mb-2">Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
          {meal.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
        <div className="flex justify-between">
        <button
          className="cursor-pointer mt-6 py-2 px-4 bg-input text-foreground font-semibold rounded-2xl"
          onClick={() => {
            const fullText = `Meal: ${meal.name}\n\nDescription: ${meal.description}\n\nIngredients:\n${meal.ingredients.map(i => `- ${i}`).join('\n')}\n\nSteps:\n${meal.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
            navigator.clipboard.writeText(fullText)
            onClose()
          }}
        >
          Copy Recipe
        </button>
        <button
          className="cursor-pointer mt-6 py-2 px-4 bg-accent text-foreground font-semibold rounded-2xl"
          onClick={() => {
            onAddToList()
            onClose()
          }}
        >
          Add missing to list
        </button>
        </div>
        
      </div>
    </div>
  )
}
