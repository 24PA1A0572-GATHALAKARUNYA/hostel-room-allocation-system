export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}
