import { UserBase } from "@/lib/types/common";

/**
 * The `care_type` this plug registers. Must match
 * `token_display.device.CARE_DEVICE_TYPE` in the backend plug
 * (care_token_display/src/token_display/device.py).
 */
export const TOKEN_DISPLAY_CARE_TYPE = "token_display";

export type TokenSubQueueStatus = "active" | "inactive";

/**
 * Mirrors care's `TokenSubQueueReadSpec`
 * (care/emr/resources/scheduling/token_sub_queue/spec.py), as serialized into
 * device metadata by the backend plug's `TokenDisplayDeviceMetadataReadSpec`.
 */
export interface TokenSubQueueRead {
  id: string;
  name: string;
  status: TokenSubQueueStatus;
}

/**
 * Retrieve-side device metadata, produced by
 * `TokenDisplayDeviceMetadataReadSpec` (token_display/spec.py:93).
 *
 * NOTE: the device *list* endpoint deliberately returns `{}` for care_metadata
 * — the backend's `list()` is a no-op so the display token never appears in
 * list payloads. Only the retrieve endpoint carries these fields.
 */
export interface TokenDisplayReadMetadata {
  sub_queues: TokenSubQueueRead[];
  service_account: UserBase | null;
  /**
   * Path to the SSR display page, including the service account token.
   * `null` unless the device has both sub-queues and a service account whose
   * auth token has been generated.
   */
  display_path: string | null;
}

/**
 * Write-side device metadata, validated by
 * `TokenDisplayDeviceMetadataWriteSpec` (token_display/spec.py:24).
 *
 * Both fields are optional server-side; an unconfigured display is valid.
 * `sub_queues` order is meaningful — it is the column order on the board.
 */
export interface TokenDisplayWriteMetadata {
  sub_queues: string[];
  service_account: string | null;
}

export function readMetadata(
  careMetadata: Record<string, unknown> | undefined,
): TokenDisplayReadMetadata {
  const metadata = (careMetadata ?? {}) as Partial<TokenDisplayReadMetadata>;
  return {
    sub_queues: metadata.sub_queues ?? [],
    service_account: metadata.service_account ?? null,
    display_path: metadata.display_path ?? null,
  };
}

/**
 * Project retrieve-side metadata back into the write shape, so a partial edit
 * (e.g. removing one sub-queue) round-trips the untouched fields instead of
 * clearing them.
 */
export function toWriteMetadata(
  metadata: TokenDisplayReadMetadata,
): TokenDisplayWriteMetadata {
  return {
    sub_queues: metadata.sub_queues.map((subQueue) => subQueue.id),
    service_account: metadata.service_account?.id ?? null,
  };
}

/**
 * Coerce metadata that may hold either the expanded read shape or already-flat
 * IDs into the write shape. The device form seeds its state from the retrieve
 * response, so both shapes can reach the create/update payload.
 */
export function normalizeWriteMetadata(
  metadata: Record<string, unknown> | undefined,
): TokenDisplayWriteMetadata {
  const { sub_queues, service_account } = (metadata ?? {}) as {
    sub_queues?: (string | TokenSubQueueRead)[];
    service_account?: string | UserBase | null;
  };

  return {
    sub_queues: (sub_queues ?? []).map((subQueue) =>
      typeof subQueue === "string" ? subQueue : subQueue.id,
    ),
    service_account:
      (typeof service_account === "string"
        ? service_account
        : service_account?.id) ?? null,
  };
}
