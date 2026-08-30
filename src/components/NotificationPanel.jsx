import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const typeIcons = {
  application: "✓",
  status: "●",
  interview: "◎",
  deadline: "◷",
  recommendation: "★",
  applicant: "👤",
};

export default function NotificationPanel({
  open,
  onClose,
  notifications = [],
  onMarkAllRead,
  onItemClick,
}) {
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  if (!open) return null;

  const handleClickItem = (notif) => {
    if (onItemClick) onItemClick(notif);
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  };

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <div className="notif-panel" ref={panelRef} role="dialog" aria-label="Notifications">
      <div className="notif-panel__head">
        <strong>Notifications</strong>
        {hasUnread && (
          <button className="notif-panel__mark" onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <ul className="notif-panel__list">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notif-item${n.unread ? " notif-item--unread" : ""}`}
              onClick={() => handleClickItem(n)}
              style={{ cursor: "pointer" }}
            >
              <span className={`notif-item__ico notif-item__ico--${n.type}`}>
                {typeIcons[n.type] || "•"}
              </span>
              <div className="notif-item__body">
                <span className="notif-item__title">{n.title}</span>
                {n.message && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgba(61, 16, 40, 0.7)",
                      display: "block",
                      marginTop: "2px",
                      lineHeight: "1.3",
                    }}
                  >
                    {n.message}
                  </span>
                )}
                <span className="notif-item__time">{n.time}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ padding: "28px 16px", textAlign: "center", color: "rgba(61,16,40,0.6)", fontSize: "13px" }}>
          Belum ada notifikasi untuk akun Anda.
        </div>
      )}
    </div>
  );
}