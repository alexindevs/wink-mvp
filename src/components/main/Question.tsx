'use client'
import { Button } from '@/components/ui/button'

export function Question({
  ingredients,
  setIngredients,
  onSubmit,
  loading,
  error,
}: {
  ingredients: string
  setIngredients: (v: string) => void
  onSubmit: () => void
  loading: boolean
  error?: string
}) {
  return (
    <section className="text-center">
      <form
        className="flex flex-col w-[80%] mx-auto justify-center space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          What&apos;s in your kitchen?
        </h1>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Greens, beans, potatoes, tomatoes..."
          className="bg-input placeholder-muted rounded-2xl md:rounded-3xl p-4"
        />
        {error && (
          <p className="text-red-500 text-sm font-medium -mt-4">{error}</p>
        )}
        <Button className="w-fit mx-auto" type="submit" disabled={loading || !ingredients.trim()}>
          {loading ? 'Thinking...' : 'What can I make?'}
        </Button>
      </form>
    </section>
  )
}
