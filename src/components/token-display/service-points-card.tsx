import { Info, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { TokenSubQueueRead } from "@/lib/token-display/types";
import useUpdateTokenDisplayMetadata from "@/lib/token-display/useUpdateTokenDisplayMetadata";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";



/**
 * Service points configured on a token display device.
 *
 * Removal only — adding a service point happens from the queue management page
 * (the "Add to Token Display" action on a service point), so that the
 * facility's queue configuration stays the single place service points are
 * chosen from.
 */
export default function ServicePointsCard({
  facilityId,
  deviceId,
  subQueues,
}: {
  facilityId: string;
  deviceId: string;
  subQueues: TokenSubQueueRead[];
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allSelected =
    subQueues.length > 0 && selected.length === subQueues.length;
  const someSelected = selected.length > 0 && !allSelected;

  const { mutate: updateMetadata, isPending } = useUpdateTokenDisplayMetadata({
    facilityId,
    onSuccess: () => {
      toast.success(t("service_points_removed"));
      setSelected([]);
    },
    onError: () => toast.error(t("failed_to_remove_service_points")),
  });

  const removeSubQueues = (ids: string[]) => {
    const removing = new Set(ids);
    updateMetadata({
      deviceId,
      update: (current) => ({
        ...current,
        sub_queues: current.sub_queues.filter((id) => !removing.has(id)),
      }),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{t("service_points")}</h3>
        {selected.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => removeSubQueues(selected)}
          >
            <Trash2 />
            {t("remove_selected", { count: selected.length })}
          </Button>
        )}
      </div>

      {subQueues.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("no_service_points_configured")}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label={t("select_all")}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked ? subQueues.map((subQueue) => subQueue.id) : [],
                    )
                  }
                />
              </TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {subQueues.map((subQueue) => (
              <TableRow key={subQueue.id}>
                <TableCell>
                  <Checkbox
                    aria-label={subQueue.name}
                    checked={selectedSet.has(subQueue.id)}
                    onCheckedChange={(checked) =>
                      setSelected((prev) =>
                        checked
                          ? [...prev, subQueue.id]
                          : prev.filter((id) => id !== subQueue.id),
                      )
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{subQueue.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      subQueue.status === "active" ? "success" : "neutral"
                    }
                  >
                    {t(subQueue.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    aria-label={t("remove")}
                    onClick={() => removeSubQueues([subQueue.id])}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0" />
        {t("add_service_point_hint")}
      </p>
    </div>
  );
}
