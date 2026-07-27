import { AnnouncementToast } from "@apiops/design-system/react";
import { useEffect, useState } from "react";

interface Props {
  id: string;
  href: string;
  message: string;
  linkLabel: string;
  dismissLabel: string;
  delay?: number;
}

export default function SiteAnnouncement({ id, href, message, linkLabel, dismissLabel, delay = 3000 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissed = false;

    try {
      dismissed = window.localStorage.getItem(id) === "dismissed";
    } catch {
      // Storage can be unavailable in privacy modes; the announcement should still work.
    }

    if (dismissed) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, id]);

  function dismiss() {
    try {
      window.localStorage.setItem(id, "dismissed");
    } catch {
      // Dismiss for this page view even when persistence is unavailable.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <AnnouncementToast className="ds-announcement-toast" dismissLabel={dismissLabel} onDismiss={dismiss}>
      <span>{message}</span>{" "}<a href={href}>{linkLabel} <span aria-hidden="true">→</span></a>
    </AnnouncementToast>
  );
}
