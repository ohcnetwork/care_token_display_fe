import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeviceDetail } from "@/lib/device/types";
import { request } from "@/lib/request";
import tokenDisplayApi from "@/lib/token-display/api";
import {
  TokenDisplayWriteMetadata,
  readMetadata,
  toWriteMetadata,
} from "@/lib/token-display/types";

/**
 * Device update is a PUT of the full write shape, and care_fe spreads plug
 * metadata *flat* into the body rather than nesting it under `care_metadata`
 * (care_fe/src/pages/Facility/settings/devices/components/DeviceForm.tsx:189-194).
 * The backend then validates the body directly with
 * `TokenDisplayDeviceMetadataWriteSpec.model_validate(request_data)`
 * (token_display/device.py).
 *
 * So a partial edit must rebuild the whole body from the retrieved device;
 * sending only the changed field would blank the rest.
 */
function buildUpdateBody(
  device: DeviceDetail,
  metadata: TokenDisplayWriteMetadata,
): Record<string, unknown> {
  return {
    identifier: device.identifier,
    status: device.status,
    availability_status: device.availability_status,
    manufacturer: device.manufacturer,
    manufacture_date: device.manufacture_date,
    expiration_date: device.expiration_date,
    lot_number: device.lot_number,
    serial_number: device.serial_number,
    registered_name: device.registered_name,
    user_friendly_name: device.user_friendly_name,
    model_number: device.model_number,
    part_number: device.part_number,
    contact: device.contact,
    care_type: device.care_type,
    ...metadata,
  };
}

export class SubQueueAlreadyLinkedError extends Error {
  constructor() {
    super("sub_queue_already_linked");
    this.name = "SubQueueAlreadyLinkedError";
    this.message = "This service point is already on that display"
  }
}

/**
 * Read-modify-write against a token display device's metadata.
 *
 * The list endpoint returns `{}` for care_metadata by design (the backend's
 * `list()` is a no-op so the display token never leaks into list payloads), so
 * any edit MUST retrieve the device first to learn its current configuration.
 * This hook wraps that GET and the subsequent PUT in one mutation, which is why
 * both the device show page and the "Add to Token Display" dialog can share it.
 *
 * `update` receives the device's current write-shape metadata and returns the
 * next one. Throw from it to abort before the PUT.
 */
export default function useUpdateTokenDisplayMetadata({
  facilityId,
  onSuccess,
  onError,
}: {
  facilityId: string;
  onSuccess?: (device: DeviceDetail) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      deviceId,
      update,
    }: {
      deviceId: string;
      update: (
        current: TokenDisplayWriteMetadata,
      ) => TokenDisplayWriteMetadata;
    }) => {
      const device = await request(tokenDisplayApi.getDevice, {
        pathParams: { facilityId, deviceId },
      });

      const next = update(toWriteMetadata(readMetadata(device.care_metadata)));

      return request(tokenDisplayApi.updateDevice, {
        pathParams: { facilityId, deviceId },
        body: buildUpdateBody(device, next),
      });
    },
    onSuccess: (device) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device"] });
      onSuccess?.(device);
    },
    onError,
  });
}
