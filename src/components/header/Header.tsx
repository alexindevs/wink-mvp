import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ShoppingCart } from "lucide-react";

export function Header ({ toggleShoppingList }: {toggleShoppingList: () => void}) {
    return (
        <nav>
            <div className="w-fit h-fit mx-auto my-8">
                <h1 className="text-xl md:text-2xl font-bold inline">WhatsInMyKitchen</h1>
            </div>
          <ThemeToggle />
          <button
      onClick={toggleShoppingList}
      className="absolute top-9 right-6 z-50 text-foreground hover:opacity-80 transition"
      aria-label="Toggle theme"
    >
      <ShoppingCart className="h-7 w-7" />

    </button>
        </nav>
    )
}