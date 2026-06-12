interface TabHeaderSearchProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
}

export function TabHeaderSearch({
  value,
  onChange,
  placeholder = "Search...",
}: TabHeaderSearchProps): JSX.Element {
  return (
    <label className="tab-header-search">
      <span className="sr-only">Search tab items</span>
      <input
        type="search"
        className="tab-header-search-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
