import { AppLayout } from "@/app/AppLayout";
import { useLibraryData } from "@/hooks/useLibraryData";
import { MapControls } from "@/components/map/MapControls";
import { MapCanvas } from "@/components/map/MapCanvas";
import { SeatSidebar } from "@/components/map/SeatSidebar";
import { MobileSeatSheet } from "@/components/map/MobileSeatSheet";
import { CompactStatusBar } from "@/components/map/CompactStatusBar";

export function LibraryMapPage() {
  useLibraryData();

  return (
    <AppLayout>
      <div className="flex flex-1 overflow-hidden">

        {/* ── MAP — fills all remaining space ── */}
        <div className="relative flex-1 overflow-hidden">
          <MapCanvas />

          {/* Controls float over the top of the map (no seats in top ~20% of SVG) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3">
            <div className="pointer-events-auto">
              <CompactStatusBar />
            </div>
            <div className="pointer-events-auto">
              <MapControls />
            </div>
          </div>
        </div>

        {/* ── Desktop sidebar — flush right edge, no extra chrome ── */}
        <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto border-l border-border bg-surface lg:flex">
          <div className="flex-1 p-4">
            <SeatSidebar />
          </div>
        </aside>

      </div>
      <MobileSeatSheet />
    </AppLayout>
  );
}
