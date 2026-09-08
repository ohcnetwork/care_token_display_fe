import { useQuery } from "@tanstack/react-query";
import { MonitorPlay, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { query } from "@/lib/request";
import tokenDisplayApi from "@/lib/token-display/api";
import {
  TOKEN_DISPLAY_CARE_TYPE,
  TokenSubQueueRead,
} from "@/lib/token-display/types";
import useUpdateTokenDisplayMetadata, {
  SubQueueAlreadyLinkedError,
} from "@/lib/token-display/useUpdateTokenDisplayMetadata";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import PluginComponent from "@/components/common/plugin-component";
import { useTranslation } from "@/hooks/use-translation";


/**
 * Rendered by care_fe inside a service point card's edit state, via
 * `PLUGIN_Component __name="SubQueueActions"`
 * (care_fe/src/pages/Facility/queues/ManageServicePointSheet.tsx).
 *
 * Adding a service point to a display happens HERE rather than on the device
 * show page, so service points are only ever chosen from the queue
 * configuration screen where they are defined.
 */
export default function SubQueueActions({
  facilityId,
  subQueue,
}: {
  facilityId: string;
  subQueue: TokenSubQueueRead;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { mutate: updateMetadata, isPending } = useUpdateTokenDisplayMetadata({
    facilityId,
    onSuccess: () => {
      setOpen(false);
      toast.success(t("added_to_token_display"));
    },
    onError: (error) => {
      if (error instanceof SubQueueAlreadyLinkedError) {
        toast.error(t("service_point_already_on_display"));
        return;
      }
    },
  });

  // The device LIST endpoint returns `{}` for care_metadata by design, so it
  // cannot tell us which displays already carry this service point. The
  // retrieve happens inside the mutation, and the duplicate check with it.
  const { data: devices, isLoading } = useQuery({
    queryKey: ["token-display", "devices", facilityId, search],
    queryFn: query.debounced(tokenDisplayApi.listDevices, {
      pathParams: { facilityId },
      queryParams: {
        care_type: TOKEN_DISPLAY_CARE_TYPE,
        search_text: search || undefined,
      },
    }),
    enabled: open,
  });

  const addToDisplay = (deviceId: string) =>
    updateMetadata({
      deviceId,
      update: (current) => {
        if (current.sub_queues.includes(subQueue.id)) {
          throw new SubQueueAlreadyLinkedError();
        }
        return {
          ...current,
          // Appended last: order is the column order on the board.
          sub_queues: [...current.sub_queues, subQueue.id],
        };
      },
    });

  return (
    <PluginComponent>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <MonitorPlay />
        {t("add_to_display")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("add_to_token_display")}</DialogTitle>
            <DialogDescription>
              {t("add_to_token_display_description", { name: subQueue.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t("search_token_displays")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
            {!isLoading && devices?.results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("no_token_displays_found")}
              </p>
            )}
            {devices?.results.map((device) => (
              <button
                key={device.id}
                type="button"
                disabled={isPending}
                onClick={() => addToDisplay(device.id)}
                className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-accent disabled:opacity-50"
              >
                <span className="text-sm font-medium">
                  {device.user_friendly_name || device.registered_name}
                </span>
                {device.user_friendly_name && (
                  <span className="text-xs text-muted-foreground">
                    {device.registered_name}
                  </span>
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PluginComponent>
  );
}
