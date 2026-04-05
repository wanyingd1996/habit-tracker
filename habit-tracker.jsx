import { useState, useMemo } from "react";

const COLORS = [
  { bg: "bg-violet-500", light: "bg-violet-100", text: "text-violet-700", border: "border-violet-400", hex: "#8b5cf6" },
  { bg: "bg-sky-500", light: "bg-sky-100", text: "text-sky-700", border: "border-sky-400", hex: "#0ea5e9" },
  { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-400", hex: "#10b981" },
  { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-700", border: "border-rose-400", hex: "#f43f5e" },
  { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700", border: "border-amber-400", hex: "#f59e0b" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-700", border: "border-pink-400", hex: "#ec4899" },
  { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-700", border: "border-teal-400", hex: "#14b8a6" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700", border: "border-orange-400", hex: "#f97316" },
];

const EMOJIS = ["📰", "🤖", "🏃", "📚", "🧘", "💧", "🎸", "✍️", "🍎", "💻", "🌿", "🎨"];

const today = new Date();
today.setHours(0, 0, 0, 0);

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const initialHabits = [
  { id: 1, name: "Read the News", emoji: "📰", colorIdx: 0, logs: {}, createdAt: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)) },
  { id: 2, name: "AI Course", emoji: "🤖", colorIdx: 1, logs: {}, createdAt: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)) },
  { id: 3, name: "Exercise", emoji: "🏃", colorIdx: 2, logs: {}, createdAt: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)) },
];

export default function HabitTracker() {
  const [habits, setHabits] = useState(initialHabits);
  const [selectedId, setSelectedId] = useState(1);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📚");
  const [newColorIdx, setNewColorIdx] = useState(3);
  const [nextId, setNextId] = useState(4);

  const selectedHabit = habits.find(h => h.id === selectedId);
  const color = selectedHabit ? COLORS[selectedHabit.colorIdx] : COLORS[0];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewYear, viewMonth, firstDay, daysInMonth]);

  function toggleDay(day) {
    if (!day) return;
    const date = new Date(viewYear, viewMonth, day);
    date.setHours(0, 0, 0, 0);
    if (date > today) return;
    const key = toDateKey(date);
    setHabits(prev => prev.map(h => {
      if (h.id !== selectedId) return h;
      const logs = { ...h.logs };
      logs[key] = !logs[key];
      if (!logs[key]) delete logs[key];
      return { ...h, logs };
    }));
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    if (ny > today.getFullYear() || (ny === today.getFullYear() && nm > today.getMonth())) return;
    setViewMonth(nm);
    setViewYear(ny);
  }

  function isToday(day) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }

  function isFuture(day) {
    if (!day) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d > today;
  }

  function isDone(day) {
    if (!day || !selectedHabit) return false;
    const key = toDateKey(new Date(viewYear, viewMonth, day));
    return !!selectedHabit.logs[key];
  }

  // Stats
  const stats = useMemo(() => {
    if (!selectedHabit) return {};
    const logs = selectedHabit.logs;
    const allDone = Object.keys(logs).filter(k => logs[k]).sort();
    const total = allDone.length;

    // Current streak
    let streak = 0;
    let check = new Date(today);
    while (true) {
      const key = toDateKey(check);
      if (logs[key]) { streak++; check.setDate(check.getDate() - 1); }
      else break;
    }

    // This month completion
    const monthTotal = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => {
      const date = new Date(viewYear, viewMonth, d);
      return date <= today;
    }).length;
    const monthDone = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => {
      const key = toDateKey(new Date(viewYear, viewMonth, d));
      return logs[key];
    }).length;

    return { total, streak, monthTotal, monthDone, rate: monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0 };
  }, [selectedHabit, viewYear, viewMonth, daysInMonth]);

  function addHabit() {
    if (!newName.trim()) return;
    setHabits(prev => [...prev, {
      id: nextId, name: newName.trim(), emoji: newEmoji,
      colorIdx: newColorIdx, logs: {}, createdAt: toDateKey(today)
    }]);
    setSelectedId(nextId);
    setNextId(n => n + 1);
    setNewName(""); setNewEmoji("📚"); setNewColorIdx(3);
    setShowAddModal(false);
  }

  function deleteHabit(id) {
    if (habits.length <= 1) return;
    setHabits(prev => prev.filter(h => h.id !== id));
    if (selectedId === id) setSelectedId(habits.find(h => h.id !== id)?.id);
  }

  const isNextDisabled = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">🗓️ Habit Tracker</h1>
          <p className="text-xs text-gray-400 mt-1">Build better habits</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {habits.map(h => {
            const c = COLORS[h.colorIdx];
            const isSelected = h.id === selectedId;
            const allDone = Object.values(h.logs).filter(Boolean).length;
            return (
              <div
                key={h.id}
                onClick={() => setSelectedId(h.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${isSelected ? `${c.light} border ${c.border}` : "hover:bg-gray-50 border border-transparent"}`}
              >
                <span className="text-xl">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? c.text : "text-gray-700"}`}>{h.name}</p>
                  <p className="text-xs text-gray-400">{allDone} day{allDone !== 1 ? "s" : ""} logged</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteHabit(h.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs px-1"
                  title="Delete habit"
                >✕</button>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg">+</span> Add Habit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedHabit && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-4xl">{selectedHabit.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedHabit.name}</h2>
                <p className="text-sm text-gray-400">Tracking since {selectedHabit.createdAt}</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Current Streak", value: `${stats.streak} 🔥`, sub: "days in a row" },
                { label: "Total Days", value: stats.total, sub: "days logged ever" },
                { label: "This Month", value: `${stats.monthDone}/${stats.monthTotal}`, sub: "days completed" },
                { label: "Completion Rate", value: `${stats.rate}%`, sub: "this month" },
              ].map(s => (
                <div key={s.label} className={`${color.light} border ${color.border} rounded-2xl p-4`}>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${color.text}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Month Nav */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                  ‹
                </button>
                <h3 className="text-lg font-semibold text-gray-900">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
                <button onClick={nextMonth} disabled={isNextDisabled} className={`p-2 rounded-lg transition-colors ${isNextDisabled ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}>
                  ›
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const done = isDone(day);
                  const future = isFuture(day);
                  const todayDay = isToday(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      disabled={future}
                      title={future ? "Future date" : done ? "Click to unmark" : "Click to mark done"}
                      className={`
                        relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all
                        ${future ? "text-gray-200 cursor-not-allowed" : "cursor-pointer"}
                        ${done ? `${color.bg} text-white shadow-sm hover:opacity-90` :
                          future ? "bg-gray-50" :
                          todayDay ? "bg-gray-100 text-gray-900 hover:bg-gray-200 ring-2 ring-gray-900 ring-offset-1" :
                          "bg-gray-50 text-gray-600 hover:bg-gray-100"}
                      `}
                    >
                      <span>{day}</span>
                      {done && <span className="text-xs opacity-80">✓</span>}
                      {todayDay && !done && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gray-900" />}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded-md ${color.bg}`} />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-gray-100" />
                  <span>Missed / Not yet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-gray-100 ring-2 ring-gray-900 ring-offset-1" />
                  <span>Today</span>
                </div>
                <span className="ml-auto italic">Click any past day to toggle</span>
              </div>
            </div>

            {/* Year heatmap hint */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              Navigate months with the arrows to see your full history.
            </div>
          </>
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Habit</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addHabit()}
                  placeholder="e.g. Meditate, Journal, Walk..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pick an Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewEmoji(e)}
                      className={`text-xl p-2 rounded-lg transition-all ${newEmoji === e ? "bg-gray-900 ring-2 ring-gray-900 ring-offset-1 scale-110" : "bg-gray-100 hover:bg-gray-200"}`}
                    >{e}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pick a Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setNewColorIdx(i)}
                      className={`w-8 h-8 rounded-full transition-all ${c.bg} ${newColorIdx === i ? "ring-2 ring-offset-2 ring-gray-900 scale-110" : "hover:scale-105"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >Cancel</button>
              <button
                onClick={addHabit}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >Add Habit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
