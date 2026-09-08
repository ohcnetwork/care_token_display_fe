import { useQuery } from "@tanstack/react-query";
import { Link2, Link2Off, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { query } from "@/lib/request";
import tokenDisplayApi from "@/lib/token-display/api";
import useUpdateTokenDisplayMetadata from "@/lib/token-display/useUpdateTokenDisplayMetadata";
import { UserBase } from "@/lib/types/common";
import { cn } from "@/lib/utils";

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
import { useTranslation } from "@/hooks/use-translation";



function userLabel(user: UserBase) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name || user.username;
}

/**
 * The service account the display authenticates as.
 *
 * The SSR display page is opened by a TV with no user session — it authenticates
 * via `?token=` using this account's auth token
 * (care_token_display/src/token_display/authentication.py).
 */
export default function ServiceAccountCard({
  facilityId,
  deviceId,
  serviceAccount,
}: {
  facilityId: string;
  deviceId: string;
  serviceAccount: UserBase | null;
}) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { mutate: updateMetadata, isPending } = useUpdateTokenDisplayMetadata({
    facilityId,
    onSuccess: () => {
      setPickerOpen(false);
      toast.success(t("service_account_updated"));
    },
  });

  const setServiceAccount = (id: string | null) =>
    updateMetadata({
      deviceId,
      update: (current) => ({ ...current, service_account: id }),
    });

  const { data: users, isLoading } = useQuery({
    queryKey: ["token-display", "service-accounts", search],
    queryFn: query.debounced(tokenDisplayApi.listUsers, {
      queryParams: {
        is_service_account: true,
        search_text: search || undefined,
      },
    }),
    enabled: pickerOpen,
  });

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{t("service_account")}</h3>

      {serviceAccount ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {userLabel(serviceAccount)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {serviceAccount.username}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => setServiceAccount(null)}
          >
            <Link2Off />
            {t("unlink")}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
          <p className="text-sm text-muted-foreground">
            {t("no_service_account_linked")}
          </p>
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <Link2 />
            {t("link_service_account")}
          </Button>
        </div>
      )}

      {serviceAccount && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={isPending}
        >
          {t("change_service_account")}
        </Button>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("link_service_account")}</DialogTitle>
            <DialogDescription>
              {t("link_service_account_description")}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t("search_service_accounts")}
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
            {!isLoading && users?.results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("no_service_accounts_found")}
              </p>
            )}
            {users?.results.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={isPending}
                onClick={() => setServiceAccount(user.id)}
                className={cn(
                  "flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-accent disabled:opacity-50",
                  user.id === serviceAccount?.id && "bg-accent",
                )}
              >
                <span className="text-sm font-medium">{userLabel(user)}</span>
                <span className="text-xs text-muted-foreground">
                  {user.username}
                </span>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)}>
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
