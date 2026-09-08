import { HttpMethod, PaginatedResponse, apiRoutes } from "@/lib/request";
import { LocationList } from "@/lib/types/location";

export default apiRoutes({
  listLocations: {
    path: "/api/v1/facility/{facilityId}/location/",
    method: HttpMethod.GET,
    TResponse: {} as PaginatedResponse<LocationList>,
  },
});
