import { Info } from "lucide-react";


import { useTranslation } from "@/hooks/use-translation";
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
 */
export default function TokenDisplayConfigureForm() {
  const { t } = useTranslation();

  return (
    <PluginComponent>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0" />
        {t("configure_after_create_hint")}
      </p>
    </PluginComponent>
  );
}
