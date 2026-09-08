import {
  Bed,
  Building,
  Building2,
  Car,
  Eye,
  Home,
  Hospital,
  LucideIcon,
  Map,
} from "lucide-react";

export type AvailabilityStatus = "available" | "unavailable";

export type Status = "active" | "inactive" | "unknown";

export type OperationalStatus = "C" | "H" | "O" | "U" | "K" | "I";

export type LocationMode = "instance" | "kind";

export type LocationForm = (typeof LocationFormOptions)[number];

export interface LocationBase {
  status: Status;
  operational_status: OperationalStatus;
  name: string;
  description: string;
  form: LocationForm;
  mode: LocationMode;
  availability_status: AvailabilityStatus;
}

export interface LocationList extends LocationBase {
  id: string;
  has_children: boolean;
  parent?: LocationList;
}

export const LocationFormOptions = [
  "si",
  "bu",
  "wi",
  "wa",
  "lvl",
  "co",
  "ro",
  "bd",
  "ve",
  "ho",
  "ca",
  "rd",
  "area",
  "jdn",
  "vi",
] as const;

export const LocationTypeIcons = {
  bd: Bed, // bed
  wa: Hospital, // ward
  lvl: Building2, // level/floor
  bu: Building, // building
  si: Map, // site
  wi: Building2, // wing
  co: Building2, // corridor
  ro: Home, // room
  ve: Car, // vehicle
  ho: Home, // house
  ca: Car, // carpark
  rd: Car, // road
  area: Map, // area
  jdn: Map, // garden
  vi: Eye, // virtual
} as const satisfies Record<LocationForm, LucideIcon>;
