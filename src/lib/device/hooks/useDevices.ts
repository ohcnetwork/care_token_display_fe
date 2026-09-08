import { useQuery } from "@tanstack/react-query";

import deviceApi from "@/lib/device/deviceApi";
import { query } from "@/lib/request";

export default function useDevices({
  facilityId,
  careType,
  search,
}: {
  facilityId: string;
  careType?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["devices", facilityId, { careType, search }],
    queryFn: query(deviceApi.listDevices, {
      pathParams: { facilityId },
      queryParams: { care_type: careType, search_text: search },
    }),
  });
}
