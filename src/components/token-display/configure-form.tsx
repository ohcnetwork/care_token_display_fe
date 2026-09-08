import { Info } from "lucide-react";
import { useEffect } from "react";

import { useTranslation } from "@/hooks/use-translation";
import { normalizeWriteMetadata } from "@/lib/token-display/types";
import { ConfigureFormProps } from "@/lib/types/common";
import PluginComponent from "@/components/common/plugin-component";

/**
 * Rendered by care_fe in the device create/edit form as
 * `PluginDeviceManifest["configureForm"]` (care_fe/src/pluginTypes.ts:182).
 *
 * Deliberately empty of inputs. Both `sub_queues` and `service_account` are
 * optional server-side (token_display/spec.py:33-34), and both are configured
 * after creation — service points from the queue management screen, the service
 * account from the device show page. Duplicating those pickers here would give
 * two places to do the same thing.
 *
 * It still owns one job: the form seeds its state from the device retrieve
 * response, where those two fields are expanded objects, but create/update only
 * accepts IDs. So it projects the metadata back into the write shape.
 */
export default function TokenDisplayConfigureForm({
  metadata,
  onChange,
}: ConfigureFormProps) {
  const { t } = useTranslation();

  useEffect(
    () => {
      const next = normalizeWriteMetadata(metadata);

      const nextJson = JSON.stringify(next);
      const currentJson = JSON.stringify(metadata);

      if (nextJson !== currentJson) {
        onChange(next);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadata],
  );

  return (
    <PluginComponent>
      <p className="text-muted-foreground flex items-start gap-2 text-xs">
        <Info className="size-4 shrink-0" />
        {t("configure_after_create_hint")}
      </p>
    </PluginComponent>
  );
}
