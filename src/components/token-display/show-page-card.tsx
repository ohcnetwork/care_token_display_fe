import { DeviceDetail } from "@/lib/device/types";
import { readMetadata } from "@/lib/token-display/types";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import PluginComponent from "@/components/common/plugin-component";
import DisplayLink from "@/components/token-display/display-link";
import ServiceAccountCard from "@/components/token-display/service-account-card";
import ServicePointsCard from "@/components/token-display/service-points-card";

/**
 * Rendered by care_fe on the device show page as
 * `PluginDeviceManifest["showPageCard"]`
 * — signature: `React.FC<{ device: DeviceDetail; facilityId: string }>`
 * (care_fe/src/pluginTypes.ts:187).
 */
export default function TokenDisplayShowPageCard({
  device,
  facilityId,
}: {
  device: DeviceDetail;
  facilityId: string;
}) {
  const metadata = readMetadata(device.care_metadata);

  return (
    <PluginComponent>
      <Card>
        <CardContent className="space-y-6 pt-6">
          <DisplayLink displayPath={metadata.display_path} />
          <Separator />
          <ServicePointsCard
            facilityId={facilityId}
            deviceId={device.id}
            subQueues={metadata.sub_queues}
          />
          <Separator />
          <ServiceAccountCard
            facilityId={facilityId}
            deviceId={device.id}
            serviceAccount={metadata.service_account}
          />
        </CardContent>
      </Card>
    </PluginComponent>
  );
}
