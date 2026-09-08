import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Check,
  ExternalLink,
  Search,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DeviceDetail, DeviceList } from "@/lib/device/types";
import { query } from "@/lib/request";
import tokenDisplayApi from "@/lib/token-display/api";
import {
  TOKEN_DISPLAY_CARE_TYPE,
  TokenSubQueueRead,
  readMetadata,
} from "@/lib/token-display/types";
import useUpdateTokenDisplayMetadata, {
  SubQueueAlreadyLinkedError,
} from "@/lib/token-display/useUpdateTokenDisplayMetadata";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

const deviceLabel = (device: DeviceDetail | DeviceList) =>
  device.user_friendly_name || device.registered_name;

/** care_fe's device show page route. */
const deviceUrl = (facilityId: string, deviceId: string) =>
  `/facility/${facilityId}/settings/devices/${deviceId}`;

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
  const [addedTo, setAddedTo] = useState<DeviceDetail | null>(null);

  const { mutate: updateMetadata, isPending } = useUpdateTokenDisplayMetadata({
    facilityId,
    onSuccess: setAddedTo,
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

  // The update response carries the retrieve spec, so the success state can
  // show the display's resulting configuration without another fetch.
  const addedMetadata = readMetadata(addedTo?.care_metadata);

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
      <div className="flex items-center justify-between gap-2 py-2 pb-4">
        <span className="text-sm">{t("add_to_token_display")}</span>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            setAddedTo(null);
            setOpen(true);
          }}
        >
          {t("add")}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {addedTo ? (
            <>
              <DialogHeader>
                <DialogTitle>{t("add_to_token_display")}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <Check className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {t("added_to_token_display")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("added_to_token_display_success_description", {
                      name: subQueue.name,
                      display: deviceLabel(addedTo),
                    })}
                  </p>
                </div>
              </div>

              {!addedMetadata.display_path && (
                <Alert variant="warning">
                  <TriangleAlert />
                  <AlertDescription>{t("display_not_ready")}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button variant="outline" asChild>
                  <a href={deviceUrl(facilityId, addedTo.id)}>
                    <ArrowUpRight />
                    {t("view_device")}
                  </a>
                </Button>
                {addedMetadata.display_path && (
                  <Button asChild>
                    <a
                      href={new URL(
                        addedMetadata.display_path,
                        window.CARE_API_URL,
                      ).toString()}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink />
                      {t("open_display")}
                    </a>
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t("add_to_token_display")}</DialogTitle>
                <DialogDescription>
                  {t("add_to_token_display_description", {
                    name: subQueue.name,
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
                <Input
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
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    {t("no_token_displays_found")}
                  </p>
                )}
                {devices?.results.map((device) => (
                  <button
                    key={device.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => addToDisplay(device.id)}
                    className="hover:bg-accent flex w-full flex-col items-start rounded-md px-3 py-2 text-left disabled:opacity-50"
                  >
                    <span className="text-sm font-medium">
                      {deviceLabel(device)}
                    </span>
                    {device.user_friendly_name && (
                      <span className="text-muted-foreground text-xs">
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </PluginComponent>
  );
}
