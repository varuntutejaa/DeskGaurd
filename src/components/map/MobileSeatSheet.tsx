import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLibrary } from "@/features/seats/store";
import { SeatSidebar } from "./SeatSidebar";

export function MobileSeatSheet() {
  const selectedId = useLibrary((s) => s.selectedId);
  const mySeatId = useLibrary((s) => s.mySeatId);
  const select = useLibrary((s) => s.select);
  const open = Boolean(selectedId || mySeatId);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => select(null)}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) select(null);
            }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] rounded-t-2xl border-t border-border bg-surface p-4 shadow-pop lg:hidden"
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border" />
            <button
              onClick={() => select(null)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <div className="max-h-[68vh] overflow-y-auto pt-2">
              <SeatSidebar />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
