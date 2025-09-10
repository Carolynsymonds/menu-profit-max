import { useEffect, useRef, useState } from "react";

/**
 * Freeform multi-entry input for dish names
 * - Type dish names
 * - Press Enter / Tab / Comma to add
 * - Paste multiple entries separated by comma / semicolon / newline
 * - Backspace removes last chip when input is empty
 * - Chips show initials + remove button
 */

function initials(text: string): string {
  const base = text?.trim() || "";
  if (!base) return "?";
  const cleaned = base.replace(/<.*?>/, "").replace(/[^A-Za-z ]/g, " ");
  const parts = cleaned.split(" ").filter(Boolean).slice(0, 2);
  if (!parts.length) return base.slice(0, 2).toUpperCase();
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

interface DishItem {
  id: string;
  name: string;
}

export function parseDishEntry(raw: string): DishItem | null {
  const text = (raw || "").trim();
  if (!text) return null;
  
  // For dishes, we just use the text as both name and id (lowercased for id)
  const id = text.toLowerCase();
  return { id, name: text };
}

interface ChipProps {
  item: DishItem;
  onRemove: () => void;
}

function Chip({ item, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1.5 text-sm text-primary">
      <span className="max-w-[12rem] truncate">
        {item.name}
      </span>
      <button
        onClick={onRemove}
        className="rounded-full p-1 text-primary/60 hover:bg-primary/20 hover:text-primary"
        aria-label={`Remove ${item.name}`}
        type="button"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

interface DishMultiInputProps {
  value?: DishItem[];
  onChange?: (dishes: DishItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

function DishMultiInput({ 
  value, 
  onChange, 
  placeholder = "Chicken Parmesan, Lentil Pasta, Caesar Salad",
  disabled = false
}: DishMultiInputProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DishItem[]>(value ?? []);
  const inputRef = useRef<HTMLInputElement>(null);

  // emit changes
  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  function addTokenFromQuery() {
    const token = parseDishEntry(query);
    if (!token) return;
    addToken(token);
  }

  function addMany(raw: string) {
    // Replace newlines with commas for easier parsing
    const normalized = raw.replace(/\n/g, ",");
    const parts = normalized
      .split(/[;,]/)
      .map((s) => parseDishEntry(s))
      .filter(Boolean) as DishItem[];
    if (!parts.length) return;
    
    setSelected((prev) => {
      const seen = new Set(prev.map((p) => p.id.toLowerCase()));
      const merged = [...prev];
      for (const p of parts) {
        const key = p.id.toLowerCase();
        if (!seen.has(key)) {
          merged.push(p);
          seen.add(key);
        }
      }
      return merged;
    });
  }

  function addToken(token: DishItem) {
    setSelected((prev) => {
      const key = token.id.toLowerCase();
      if (prev.some((p) => p.id.toLowerCase() === key)) return prev;
      return [...prev, token];
    });
    setQuery("");
    inputRef.current?.focus();
  }

  function removeToken(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const commitKeys = ["Enter", "Tab", ",", ";"]; // add on these
    if (commitKeys.includes(e.key)) {
      if (query.trim()) {
        e.preventDefault();
        addTokenFromQuery();
      }
      return;
    }
    if (e.key === "Backspace" && query === "" && selected.length) {
      const last = selected[selected.length - 1];
      removeToken(last.id);
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    e.preventDefault();
    addMany(text);
  }

  function onBlur() {
    // Commit any pending text on blur
    if (query.trim()) addTokenFromQuery();
  }

  return (
    <div className="w-full">
      <div className="min-h-[41px] w-full rounded-xl border border-gray-300 bg-card/70 px-3 py-2 pl-10 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all">
        {/* Display existing dishes as chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selected.map((dish) => (
              <Chip key={dish.id} item={dish} onRemove={() => removeToken(dish.id)} />
            ))}
          </div>
        )}

        {/* Input field */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={onBlur}
          placeholder={selected.length === 0 ? placeholder : 'Add another dish...'}
          disabled={disabled}
          className="w-full bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
        />
      </div>

      {/* Helper hint when typing */}
      {query.trim() && (
        <div className="mt-2 w-full rounded-lg border border-gray-200 bg-card p-3 text-sm text-muted-foreground shadow-sm">
          Press <kbd className="rounded border px-1.5 py-0.5 bg-muted">Enter</kbd> to add <span className="font-medium text-foreground">{query}</span> · Paste multiple with comma / semicolon / newline.
        </div>
      )}
    </div>
  );
}

export default DishMultiInput;