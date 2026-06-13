import { AppLayout } from "@/app/AppLayout";
import { useLibraryData } from "@/hooks/useLibraryData";
import { TopStatusBar } from "@/components/map/TopStatusBar";
import { MapControls } from "@/components/map/MapControls";
import { MapCanvas } from "@/components/map/MapCanvas";
import { SeatSidebar } from "@/components/map/SeatSidebar";
import { MobileSeatSheet } from "@/components/map/MobileSeatSheet";

export function LibraryMapPage() {
  useLibraryData();

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
        <TopStatusBar />
        <MapControls />

        <div className="flex flex-1 gap-4 overflow-hidden">
          <div className="relative flex-1 overflow-hidden">
            <MapCanvas />
          </div>

          {/* desktop rail */}
          <aside className="hidden w-[340px] shrink-0 rounded-2xl border border-border bg-surface p-4 shadow-xs lg:block">
            <SeatSidebar />
          </aside>
        </div>
      </div>

      <MobileSeatSheet />
    </AppLayout>
  );
}
