import { useEffect, useRef } from "react";

const dummyNotifications = [
  { id: 1, type: "application", title: "Application sent to Nexora Studio", time: "2 jam lalu", unread: true },
  { id: 2, type: "status", title: "Your application is now In Review", time: "5 jam lalu", unread: true },
  { id: 3, type: "interview", title: "Interview scheduled with Brightmind Agency", time: "1 hari lalu", unread: true },
  { id: 4, type: "deadline", title: "Deadline soon: Data Analyst (Entry)", time: "2 hari lalu", unread: false },
  { id: 5, type: "recommendation", title: "New job matched for your profile", time: "3 hari lalu", unread: false },
];

const typeIcons = {
  application: "✓",
  status: "●",
  interview: "◎",
  deadline: "◷",
  recommendation: "★",
};

export default function NotificationPanel({ open, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="notif-panel" ref={panelRef} role="dialog" aria-label="Notifications">
      <div className="notif-panel__head">
        <strong>Notifications</strong>
        <button
          className="notif-panel__mark"
          onClick={() => {
            /* mark all read */
          }}
        >
          Mark all read
        </button>
      </div>
      <ul className="notif-panel__list">
        {dummyNotifications.map((n) => (
          <li key={n.id} className={`notif-item${n.unread ? " notif-item--unread" : ""}`}>
            <span className={`notif-item__ico notif-item__ico--${n.type}`}>{typeIcons[n.type] || "•"}</span>
            <div className="notif-item__body">
              <span className="notif-item__title">{n.title}</span>
              <span className="notif-item__time">{n.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}