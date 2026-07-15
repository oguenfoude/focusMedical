"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setDayOff } from "@/lib/actions/schedule";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

interface ScheduleEntry {
  dayOfWeek: number;
  isDayOff: boolean;
}

interface ScheduleClientProps {
  schedule: ScheduleEntry[];
  dict: Dictionary;
}

export function ScheduleClient({ schedule, dict }: ScheduleClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{dict.schedule.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.schedule.subtitle}</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground/80">{dict.schedule.weeklySchedule}</span>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {Object.values(dict.schedule.days as Record<string, string>).map((dayName: string, index: number) => {
            const daySchedule = schedule.find((s) => s.dayOfWeek === index);
            const isDayOff = daySchedule?.isDayOff ?? false;

            return (
              <ScheduleRow
                key={index}
                day={dayName}
                dayOfWeek={index}
                isDayOff={isDayOff}
                onToggle={() => router.refresh()}
                dict={dict}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScheduleRow({
  day,
  dayOfWeek,
  isDayOff,
  onToggle,
  dict,
}: {
  day: string;
  dayOfWeek: number;
  isDayOff: boolean;
  onToggle: () => void;
  dict: Dictionary;
}) {
  const [state, formAction, isPending] = useActionState(setDayOff, {
    error: "",
  });

  useEffect(() => {
    if ("success" in state && state.success) {
      toast.success(dict.schedule.toast.updated);
    }
  }, [state, dict]);

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-sm font-medium text-foreground w-20 sm:w-28 shrink-0">{day}</span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isDayOff
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isDayOff ? dict.schedule.dayOff : dict.schedule.open}
        </span>
      </div>
      <form
        action={async (formData) => {
          await formAction(formData);
          onToggle();
        }}
      >
        <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
        <input type="hidden" name="isDayOff" value={String(!isDayOff)} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="h-9 text-xs"
          disabled={isPending}
        >
          {isDayOff ? dict.schedule.setOpen : dict.schedule.setDayOff}
        </Button>
      </form>
    </div>
  );
}
