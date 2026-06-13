import { Search, X, ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useLibrary } from "@/features/seats/store";
import {
  SEAT_TYPE_LABEL, STATUS_META, STATUS_ORDER, ZONE_LABEL,
  type SeatStatus, type SeatType, type ZoneId,
} from "@/features/seats/types";
import { Button } from "@/components/ui/button";

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | "all";
  onChange: (v: T | "all") => void;
  options: { value: T; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "all")}
        className="h-9 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-8 text-[13px] font-medium text-foreground shadow-xs outline-none transition-all hover:border-primary/40 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
        aria-label={placeholder}
      >
        <option value="all">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function MapControls() {
  const filters    = useLibrary((s) => s.filters);
  const setFilter  = useLibrary((s) => s.setFilter);
  const resetFilters = useLibrary((s) => s.resetFilters);

  const active =
    filters.query !== "" ||
    filters.status !== "all" ||
    filters.zone !== "all" ||
    filters.type !== "all";

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-xs lg:flex-row lg:items-center">

      {/* search */}
      <div className="relative flex-1 lg:max-w-[260px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={filters.query}
          onChange={(e) => setFilter("query", e.target.value)}
          placeholder="Search seat (e.g. CL12)…"
          className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-[13px] outline-none transition-all placeholder:text-muted-foreground/60 hover:border-primary/40 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label="Search seat by number"
        />
        {filters.query && (
          <button
            onClick={() => setFilter("query", "")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* divider + label */}
      <div className="hidden items-center gap-2 text-[11.5px] font-semibold uppercase tracking-widest text-muted-foreground lg:flex">
        <span className="h-4 w-px bg-border" />
        <SlidersHorizontal className="size-3.5" />
        Filters
      </div>

      {/* filter selects */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-1">
        <FilterSelect
          value={filters.status}
          onChange={(v) => setFilter("status", v as SeatStatus | "all")}
          placeholder="All statuses"
          options={STATUS_ORDER.map((s) => ({
            value: s,
            label: STATUS_META[s].label,
          }))}
        />
        <FilterSelect
          value={filters.zone}
          onChange={(v) => setFilter("zone", v as ZoneId | "all")}
          placeholder="All zones"
          options={(Object.keys(ZONE_LABEL) as ZoneId[]).map((z) => ({
            value: z,
            label: ZONE_LABEL[z],
          }))}
        />
        <FilterSelect
          value={filters.type}
          onChange={(v) => setFilter("type", v as SeatType | "all")}
          placeholder="All types"
          options={(Object.keys(SEAT_TYPE_LABEL) as SeatType[]).map((tp) => ({
            value: tp,
            label: SEAT_TYPE_LABEL[tp],
          }))}
        />
      </div>

      {/* active filter badge + reset */}
      {active && (
        <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary lg:inline">
          Filtered
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetFilters}
        disabled={!active}
        className="h-9 shrink-0 gap-1.5 text-[13px] disabled:opacity-30"
      >
        <RotateCcw className="size-3.5" />
        Reset
      </Button>
    </div>
  );
}
