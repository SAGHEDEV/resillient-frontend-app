import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder="Search tasks by title or description..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-10 text-xs sm:text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search query"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
