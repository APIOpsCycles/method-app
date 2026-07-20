import { permanentRedirect } from "next/navigation";

// Compatibility alias only. The design system has one English canonical route.
export default function Page() {
  permanentRedirect("/design-system");
}
