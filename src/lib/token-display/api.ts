import { DeviceDetail, DeviceListResponse } from "@/lib/device/types";
import { HttpMethod, PaginatedResponse, apiRoutes } from "@/lib/request";
import { UserBase } from "@/lib/types/common";
import { TokenSubQueueRead } from "@/lib/token-display/types";

/**
 * Routes consumed by this plug. Every path here is a care backend route —
 * verified against care_fe's own api definitions rather than guessed:
 *
 *   device retrieve/update  care_fe/src/types/device/deviceApi.ts:26,:31
 *   token sub queue list    care_fe/src/types/tokens/tokenSubQueue/tokenSubQueueApi.ts:9
 *   users list              care_fe/src/types/user/userApi.ts:14
 */
export default apiRoutes({
  getDevice: {
    path: "/api/v1/facility/{facilityId}/device/{deviceId}/",
    method: HttpMethod.GET,
    TResponse: {} as DeviceDetail,
  },
  updateDevice: {
    path: "/api/v1/facility/{facilityId}/device/{deviceId}/",
    method: HttpMethod.PUT,
    TResponse: {} as DeviceDetail,
    TRequest: {} as Record<string, unknown>,
  },
  listDevices: {
    path: "/api/v1/facility/{facilityId}/device/",
    method: HttpMethod.GET,
    TResponse: {} as DeviceListResponse,
  },
  listSubQueues: {
    path: "/api/v1/facility/{facilityId}/token/sub_queue/",
    method: HttpMethod.GET,
    TResponse: {} as PaginatedResponse<TokenSubQueueRead>,
  },
  listUsers: {
    path: "/api/v1/users/",
    method: HttpMethod.GET,
    TResponse: {} as PaginatedResponse<UserBase>,
  },
});
