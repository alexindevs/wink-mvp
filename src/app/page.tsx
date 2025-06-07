'use client'

import { Question } from '@/components/main/Question';
import { Header } from '../components/header/Header';
import { useState } from 'react';
import { MealSuggestion, Suggestions } from '@/components/output/Suggestions';
import { MealModal } from '@/components/output/MealModal';
import { ShoppingListModal } from '@/components/output/ShoppingList';

export default function Home() {
  const [ingredients, setIngredients] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealSuggestion | null>(null)
  const [shoppingItems, setShoppingItems] = useState<Set<string>>(new Set())
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [showShoppingList, setShowShoppingList] = useState(false)

  const getSuggestion = async () => {
    if (!ingredients) return
    setLoading(true)
  
    const now = new Date()
    const hour = now.getHours()
  
    const timeOfDay =
      hour < 5 ? 'Night (early hours)' :
      hour < 12 ? 'Morning' :
      hour < 17 ? 'Afternoon' :
      'Evening'
  
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  
    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: ingredients,
        time: `${timeOfDay} (${hour}:00)`,
        day: weekday,
      }),
    })
  
    const data = await res.json()
    setSuggestions(data.result)
    setLoading(false)
  }

  const addToShoppingList = (items: string[]) => {
    setShoppingItems(prev => new Set([...prev, ...items]))
    setShowShoppingList(true)
  }
  
  const toggleChecked = (item: string) => {
    setCheckedItems(prev => {
      const copy = new Set(prev)
      if (copy.has(item)) copy.delete(item)
      else copy.add(item)
      return copy
    })
  }
  
  const clearChecked = () => {
    setShoppingItems(prev => {
      const updated = new Set([...prev].filter(item => !checkedItems.has(item)))
      return updated
    })
    setCheckedItems(new Set())
  }
  
  const copyShoppingList = () => {
    const list = [...shoppingItems].join('\n')
    navigator.clipboard.writeText(list)
    setShowShoppingList(false)
  }
  


  return (
    <>
      <Header toggleShoppingList={() => setShowShoppingList(true)}/>
      <Question
        ingredients={ingredients}
        setIngredients={setIngredients}
        onSubmit={getSuggestion}
        loading={loading}
      />
      {suggestions.length > 0 && (
        <Suggestions
        suggestions={suggestions}
        onSelect={(meal) => setSelectedMeal(meal)}
      />
      )}
      {selectedMeal && (
        <MealModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} onAddToList={() => addToShoppingList(selectedMeal.missingIngredients)} />
      )}
      {showShoppingList && (
  <ShoppingListModal
    items={[...shoppingItems]}
    checkedItems={checkedItems}
    onToggle={toggleChecked}
    onClearChecked={clearChecked}
    onCopyList={copyShoppingList}
    onClose={() => setShowShoppingList(false)}
  />
)}
    </>
  )
}