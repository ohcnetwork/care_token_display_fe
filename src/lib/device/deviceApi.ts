import { DeviceDetail, DeviceListResponse } from "@/lib/device/types";
import { HttpMethod, apiRoutes } from "@/lib/request";

export default apiRoutes({
  listDevices: {
    path: "/api/v1/facility/{facilityId}/device/",
    method: HttpMethod.GET,
    TResponse: {} as DeviceListResponse,
  },
  associateEncounter: {
    path: "/api/v1/facility/{facilityId}/device/{deviceId}/associate_encounter/",
    method: HttpMethod.POST,
    TResponse: {} as DeviceDetail,
    TBody: {} as { encounter: string | null },
  },
});
