import { Copy, ExternalLink, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";



/**
 * The display URL for the TV.
 *
 * The backend returns a *relative* path (built with `reverse()` in
 * token_display/utils.py, so the SSR route is never hardcoded). It is resolved
 * against the care API origin here, because the TV opening this URL has no
 * `window.CARE_API_URL` of its own — it needs the absolute address.
 *
 * `display_path` is null until the device has both service points and a service
 * account whose auth token has been generated.
 */
export default function DisplayLink({
  displayPath,
}: {
  displayPath: string | null;
}) {
  const { t } = useTranslation();

  if (!displayPath) {
    return (
      <Alert variant="warning">
        <TriangleAlert />
        <AlertDescription>{t("display_not_ready")}</AlertDescription>
      </Alert>
    );
  }

  const displayUrl = new URL(displayPath, window.CARE_API_URL).toString();

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">{t("display_url")}</h3>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-muted-background px-3 py-2 text-xs">
          {displayUrl}
        </code>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("copy")}
          onClick={() => {
            navigator.clipboard.writeText(displayUrl);
            toast.success(t("display_url_copied"));
          }}
        >
          <Copy />
        </Button>
        <Button variant="outline" size="icon" aria-label={t("open")} asChild>
          <a href={displayUrl} target="_blank" rel="noreferrer">
            <ExternalLink />
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("display_url_token_warning")}
      </p>
    </div>
  );
}
