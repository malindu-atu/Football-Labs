/**
 * StudentFilter — reusable filter bar for student lists.
 * Props:
 *   search, onSearch       — text search string
 *   ageFilter, onAge       — age group filter
 *   locationFilter, onLocation — location_id filter
 *   locations              — array of {id, name} location objects
 *   resultCount            — optional number to show "X students"
 */
import { input } from "./UI";

const AGE_GROUPS = ["U6","U7","U8","U9","U10","U11","U12","U13","U14","U15","U16"];

export default function StudentFilter({
  search = "", onSearch,
  ageFilter = "", onAge,
  locationFilter = "", onLocation,
  locations = [],
  resultCount,
  children,   // optional extra controls (e.g. "Mark all paid" button)
}) {
  const hasFilter = search || ageFilter || locationFilter;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[150px] max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          style={input}
          className="w-full rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none"
          placeholder="Search student…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Age group */}
      <select
        style={{ ...input, backgroundImage: "none" }}
        className="rounded-lg px-3 py-2 text-sm focus:outline-none"
        value={ageFilter}
        onChange={e => onAge(e.target.value)}
      >
        <option value="" style={{ backgroundColor: "#0D1F3C" }}>All Ages</option>
        {AGE_GROUPS.map(g => (
          <option key={g} value={g} style={{ backgroundColor: "#0D1F3C" }}>{g}</option>
        ))}
      </select>

      {/* Location */}
      {locations.length > 0 && (
        <select
          style={{ ...input, backgroundImage: "none" }}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none"
          value={locationFilter}
          onChange={e => onLocation(e.target.value)}
        >
          <option value="" style={{ backgroundColor: "#0D1F3C" }}>All Locations</option>
          {locations.map(l => (
            <option key={l.id} value={l.id} style={{ backgroundColor: "#0D1F3C" }}>{l.name}</option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {hasFilter && (
        <button
          onClick={() => { onSearch(""); onAge(""); onLocation(""); }}
          style={{ color: "#9CA3AF", border: "1px solid rgba(255,255,255,0.08)" }}
          className="px-3 py-2 rounded-lg text-xs hover:text-white transition-all whitespace-nowrap"
        >
          ✕ Clear
        </button>
      )}

      {/* Result count */}
      {resultCount !== undefined && (
        <span className="text-gray-500 text-xs ml-1">
          {resultCount} student{resultCount !== 1 ? "s" : ""}
        </span>
      )}

      {/* Extra controls slot */}
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}