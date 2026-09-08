import TokenDisplayConfigureForm from "@/components/token-display/configure-form";
import TokenDisplayShowPageCard from "@/components/token-display/show-page-card";
import { TvMinimalIcon } from "lucide-react";
import { lazy } from "react";

const manifest = {
  plugin: "care-token-display-fe",
  routes: {},
  devices: [
    {
      type: "token_display",
      icon: TvMinimalIcon,
      configureForm: TokenDisplayConfigureForm,
      showPageCard: TokenDisplayShowPageCard,
    },
  ],
  components: {
    SubQueueActions: lazy(
      () => import("@/components/token-display/sub-queue-actions"),
    ),
  },
};

export default manifest;
