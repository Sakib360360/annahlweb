import { useState } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'

export default function NotificationBell() {
  const { notifications, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm transition hover:bg-white"
        onClick={() => {
          setOpen((prev) => !prev)
          if (!open) markAllRead()
        }}
        aria-label="Notifications"
      >
        <span className="h-5 w-5">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 2a6 6 0 016 6v4.586l1.707 1.707a1 1 0 01-.707 1.707h-14a1 1 0 01-.707-1.707L6 12.586V8a6 6 0 016-6zm0 20a3 3 0 003-3H9a3 3 0 003 3z" />
          </svg>
        </span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <p className="mt-1 text-xs text-slate-500">Latest updates appear here.</p>
          </div>
          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-slate-600">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 ${n.read ? 'bg-white' : 'bg-brand-50'} border-b border-slate-100`}
                >
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
