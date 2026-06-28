import { useState, useEffect, useRef, useCallback } from "react";
import downloadGif from "./download.gif";
import postcardImg from "./postcard.png";


const COLORS = {
  classes: "#378ADD", exams: "#E24B4A", study: "#639922",
  personal: "#BA7517", clubs: "#7F77DD", labs: "#1D9E75",
  assignments: "#D85A30", other: "#888780"
};

const BADGE_ICONS = ["🌱","⚡","🔥","💎","🏆","🎯","⭐","🚀"];

const initialSubjects = [
  { id: 1, name: "Machine Learning", color: "#378ADD", credits: 4, totalClasses: 32, attendedClasses: 28 },
  { id: 2, name: "DBMS", color: "#E24B4A", credits: 3, totalClasses: 32, attendedClasses: 29 },
  { id: 3, name: "Operating Systems", color: "#639922", credits: 4, totalClasses: 32, attendedClasses: 25 },
  { id: 4, name: "Computer Networks", color: "#7F77DD", credits: 3, totalClasses: 32, attendedClasses: 27 },
];

const initialEvents = [
  { id: 1, title: "ML Lecture", type: "classes", subject: "Machine Learning", date: "2025-06-25", startTime: "09:00", endTime: "10:00", location: "Room 301", professor: "Dr. Rao", notes: "", color: "#378ADD" },
  { id: 2, title: "DBMS Lab", type: "labs", subject: "DBMS", date: "2025-06-25", startTime: "14:00", endTime: "16:00", location: "Lab 2", professor: "Dr. Sharma", notes: "", color: "#1D9E75" },
  { id: 3, title: "OS Exam", type: "exams", subject: "Operating Systems", date: "2025-07-07", startTime: "10:00", endTime: "12:00", location: "Hall A", professor: "Dr. Patel", notes: "Revise paging and deadlocks", color: "#E24B4A" },
  { id: 4, title: "ML Exam", type: "exams", subject: "Machine Learning", date: "2025-07-15", startTime: "10:00", endTime: "12:00", location: "Hall B", professor: "Dr. Rao", notes: "", color: "#E24B4A" },
  { id: 5, title: "ML Study Session", type: "study", subject: "Machine Learning", date: "2025-06-26", startTime: "14:00", endTime: "16:00", location: "Library", professor: "", notes: "Random Forest chapter", color: "#639922" },
  { id: 6, title: "Gym", type: "personal", subject: "", date: "2025-06-27", startTime: "07:00", endTime: "08:00", location: "Sports Complex", professor: "", notes: "", color: "#BA7517" },
];

const initialAssignments = [
  { id: 1, title: "ML Report", subject: "Machine Learning", dueDate: "2025-06-30", status: "In Progress", priority: "High", progress: 65, estimatedHours: 8, checklist: ["Literature review", "Dataset prep", "Model training", "Report writing"], submissionLink: "", notes: "" },
  { id: 2, title: "DBMS ER Diagram", subject: "DBMS", dueDate: "2025-06-28", status: "Not Started", priority: "High", progress: 0, estimatedHours: 4, checklist: ["Design schema", "Draw ER diagram", "Normalize"], submissionLink: "", notes: "" },
  { id: 3, title: "OS Shell Script", subject: "Operating Systems", dueDate: "2025-07-05", status: "Completed", priority: "Medium", progress: 100, estimatedHours: 3, checklist: ["Write script", "Test cases", "Documentation"], submissionLink: "https://github.com", notes: "" },
  { id: 4, title: "CN Assignment", subject: "Computer Networks", dueDate: "2025-07-10", status: "Not Started", priority: "Low", progress: 10, estimatedHours: 5, checklist: ["TCP/IP problems", "Subnetting"], submissionLink: "", notes: "" },
];

const initialTasks = [
  { id: 1, text: "Finish DBMS assignment", done: false, priority: "High", dueDate: "2025-06-28", category: "Academic", recurring: false },
  { id: 2, text: "Watch ML lecture", done: true, priority: "Medium", dueDate: "2025-06-25", category: "Academic", recurring: false },
  { id: 3, text: "Revise OS", done: false, priority: "High", dueDate: "2025-06-25", category: "Study", recurring: false },
  { id: 4, text: "Buy groceries", done: false, priority: "Low", dueDate: "2025-06-26", category: "Personal", recurring: false },
  { id: 5, text: "Solve 5 LeetCode problems", done: false, priority: "Medium", dueDate: "2025-06-25", category: "Coding", recurring: true },
];

const initialTimetableData = {
  Monday:    [{time:"09:00",subj:"Machine Learning",room:"Room 301"},{time:"10:00",subj:"DBMS",room:"Room 302"},{time:"14:00",subj:"Operating Systems",room:"Lab 2"}],
  Tuesday:   [{time:"09:00",subj:"Operating Systems",room:"Room 303"},{time:"11:00",subj:"Computer Networks",room:"Room 304"}],
  Wednesday: [{time:"09:00",subj:"Machine Learning",room:"Room 301"},{time:"10:00",subj:"DBMS",room:"Room 302"},{time:"14:00",subj:"Computer Networks",room:"Lab 3"}],
  Thursday:  [{time:"09:00",subj:"Operating Systems",room:"Room 303"},{time:"11:00",subj:"Machine Learning",room:"Room 301"}],
  Friday:    [{time:"09:00",subj:"DBMS",room:"Room 302"},{time:"11:00",subj:"Computer Networks",room:"Room 304"},{time:"14:00",subj:"Machine Learning",room:"Lab 1"}],
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDay(y, m) {
  return new Date(y, m, 1).getDay();
}
function formatDate(d) {
  return d.toISOString().split("T")[0];
}
function daysBetween(a, b) {
  return Math.ceil((new Date(b) - new Date(a)) / 86400000);
}

let mainAudioCtx = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!mainAudioCtx) {
    mainAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return mainAudioCtx;
};

const unlockAudio = () => {
  try {
    const audioCtx = getAudioContext();
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  } catch (e) {
    console.error("Failed to unlock audio context:", e);
  }
};

const playAlarmSound = () => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const playBeep = (time, freq, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };
    const now = audioCtx.currentTime;
    playBeep(now, 880, 0.15);
    playBeep(now + 0.2, 880, 0.15);
    playBeep(now + 0.4, 1200, 0.35);
  } catch (e) {
    console.error("Failed to play synthesized alarm:", e);
  }
};

export default function AcademicCalendar() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");
  const [tab, setTab] = useState(() => localStorage.getItem("activeTab") || "dashboard");
  const [calView, setCalView] = useState("monthly");
  const [today] = useState(new Date("2025-06-25"));
  const [currentDate, setCurrentDate] = useState(new Date("2025-06-25"));
  const [events, setEvents] = useState(initialEvents);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [tasks, setTasks] = useState(initialTasks);
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem("subjects");
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  // Timetable State
  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem("timetable");
    return saved ? JSON.parse(saved) : initialTimetableData;
  });
  const [editingSlot, setEditingSlot] = useState(null); // { day, time }
  const [slotForm, setSlotForm] = useState({ subj: "", room: "" });

  // Add Subject State
  const [newSubject, setNewSubject] = useState({ name: "", credits: 3, totalClasses: 30, attendedClasses: 0, color: "#378ADD" });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [pomodoroState, setPomodoroState] = useState({ running: false, mode: "study", seconds: 1500, duration: 1500, sessions: 0 });
  const [customPomodoroHrs, setCustomPomodoroHrs] = useState("0");
  const [customPomodoroMins, setCustomPomodoroMins] = useState("25");
  const [customPomodoroSecs, setCustomPomodoroSecs] = useState("0");
  const [calendarFilter, setCalendarFilter] = useState("All");
  const [newEvent, setNewEvent] = useState({ title:"", type:"classes", subject:"", date: formatDate(new Date("2025-06-25")), startTime:"09:00", endTime:"10:00", location:"", professor:"", notes:"", color:"#378ADD" });
  const [newTask, setNewTask] = useState({ text:"", priority:"Medium", dueDate:"", category:"Academic", recurring:false });
  const [newAssignment, setNewAssignment] = useState({ title:"", subject:"", dueDate:"", status:"Not Started", priority:"Medium", progress:0, estimatedHours:0, checklist:[], notes:"" });
  const pomodoroRef = useRef(null);
  const [notification, setNotification] = useState(null);

  const [assignmentsFilter, setAssignmentsFilter] = useState("All");
  const [tasksFilter, setTasksFilter] = useState("All");
  const [examChecklists, setExamChecklists] = useState({});
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [backgrounds, setBackgrounds] = useState(() => {
    const saved = localStorage.getItem("backgrounds");
    const initialList = [
      { id: "custom-gif", name: "My GIF (download.gif)", url: downloadGif },
      { id: "postcard-img", name: "Postcard Image", url: postcardImg }
    ];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.some(bg => bg.id === "postcard-img")) {
        parsed.push({ id: "postcard-img", name: "Postcard Image", url: postcardImg });
      }
      return parsed;
    }
    return initialList;
  });
  const [backgroundGif, setBackgroundGif] = useState(() => {
    const saved = localStorage.getItem("backgroundGif");
    if (!saved || saved.includes("download.gif")) {
      return postcardImg;
    }
    return saved;
  });
  const [newGifUrl, setNewGifUrl] = useState("");
  const [newGifName, setNewGifName] = useState("");
  const [showBgSettings, setShowBgSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem("activeTab", tab);
  }, [tab]);

  useEffect(() => {
    const handleGesture = () => {
      unlockAudio();
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("touchstart", handleGesture);
    window.addEventListener("keydown", handleGesture);
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("backgrounds", JSON.stringify(backgrounds));
  }, [backgrounds]);

  useEffect(() => {
    localStorage.setItem("backgroundGif", backgroundGif);
  }, [backgroundGif]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    if (pomodoroState.running) {
      pomodoroRef.current = setInterval(() => {
        setPomodoroState(s => {
          if (s.seconds <= 1) {
            const isStudy = s.mode === "study";
            setTimeout(() => {
              showNotif(`Pomodoro: ${isStudy ? "Break time!" : "Back to study!"}`);
              playAlarmSound();
            }, 0);
            const newSessions = isStudy ? s.sessions + 1 : s.sessions;
            const nextMode = isStudy ? (newSessions % 4 === 0 ? "longbreak" : "break") : "study";
            const nextSecs = nextMode === "study" ? 1500 : nextMode === "break" ? 300 : 900;
            return { running: false, mode: nextMode, seconds: nextSecs, duration: nextSecs, sessions: newSessions };
          }
          return { ...s, seconds: s.seconds - 1 };
        });
      }, 1000);
    } else {
      clearInterval(pomodoroRef.current);
    }
    return () => clearInterval(pomodoroRef.current);
  }, [pomodoroState.running]);

  function showNotif(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }


  function addEvent() {
    const e = { ...newEvent, id: Date.now(), color: COLORS[newEvent.type] || "#888780" };
    setEvents(ev => [...ev, e]);
    setShowAddEvent(false);
    showNotif("Event added!");
  }

  function addTask() {
    const t = { ...newTask, id: Date.now(), done: false };
    setTasks(tk => [...tk, t]);
    setShowAddTask(false);
  }

  function addAssignment() {
    const a = { ...newAssignment, id: Date.now(), checklist: newAssignment.checklist || [] };
    setAssignments(as => [...as, a]);
    setShowAddAssignment(false);
  }

  function toggleTask(id) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    showNotif("Task completed!");
  }

  function toggleHabit(id) {
    // habits removed
  }

  function fmtTime(sec) {
    return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
  }

  const todayStr = formatDate(today);
  const todayEvents = events.filter(e => e.date === todayStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
  const upcomingExams = events.filter(e => e.type === "exams" && e.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date));
  const pendingTasks = tasks.filter(t => !t.done);
  const completedAssignments = assignments.filter(a => a.status === "Completed").length;
  const avgAttendance = subjects.length
    ? Math.round(
        subjects.reduce(
          (acc, sub) =>
            acc + (sub.totalClasses > 0 ? (sub.attendedClasses / sub.totalClasses) * 100 : 100),
          0
        ) / subjects.length
      )
    : 100;

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;background:#000}
    .app{min-height:100vh;background:${darkMode?"rgba(15, 15, 19, 0.45)":"rgba(244, 246, 250, 0.45)"};color:${darkMode?"#e8e8f0":"#1a1a2e"};transition:all .2s;position:relative;z-index:1}
    .bg-layer {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background-image: url('${backgroundGif}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 0;
      opacity: 1.0;
      filter: blur(0px);
      pointer-events: none;
      transition: opacity 0.3s, filter 0.3s;
    }
    .page-heading {
      display: inline-block;
      padding: 8px 16px;
      background: rgba(26, 26, 46, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      cursor: default;
      transition: all 0.2s ease;
      margin-bottom: 16px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      text-decoration: none;
    }
    .page-heading:hover {
      background: rgba(26, 26, 46, 0.85);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
    .date-pill {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      background: rgba(26, 26, 46, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      color: #9090b0;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      cursor: default;
      transition: all 0.2s ease;
      margin-top: 4px;
    }
    .date-pill:hover {
      background: rgba(26, 26, 46, 0.85);
      border-color: rgba(255, 255, 255, 0.25);
      color: #fff;
      transform: translateY(-1px);
    }
    .sidebar{width:220px;background:${darkMode?"rgba(26,26,46,0.65)":"rgba(255,255,255,0.65)"};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-right:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};height:100vh;position:fixed;top:0;left:0;z-index:100;transition:transform 0.3s ease;transform:${sidebarCollapsed?"translateX(-220px)":"translateX(0)"};display:flex;flex-direction:column}
    .main{margin-left:${sidebarCollapsed?"0":"220px"};padding:24px;min-height:100vh;position:relative;z-index:1;transition:margin-left 0.3s ease}
    .topbar{background:${darkMode?"rgba(26,26,46,0.65)":"rgba(255,255,255,0.65)"};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};padding:12px 24px;margin:-24px -24px 24px;position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:12px}
    .card{background:${darkMode?"rgba(26,26,46,0.65)":"rgba(255,255,255,0.65)"};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};border-radius:12px;padding:16px}
    .card-sm{background:${darkMode?"rgba(34,34,58,0.6)":"rgba(248,249,254,0.6)"};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};border-radius:8px;padding:12px}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
    .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .btn{padding:8px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:all .15s}
    .btn-primary{background:#7F77DD;color:#fff}
    .btn-primary:hover{background:#6b63c9}
    .btn-sm{padding:4px 10px;border-radius:6px;font-size:12px}
    .btn-ghost{background:transparent;border:1px solid ${darkMode?"#2a2a3e":"#e8eaf0"};color:${darkMode?"#e8e8f0":"#1a1a2e"}}
    .nav-item{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:${darkMode?"#9090b0":"#555577"};transition:all .15s;text-decoration:none;border:none;background:none;width:100%;text-align:left}
    .nav-item:hover,.nav-item.active{background:${darkMode?"rgba(42,42,62,0.7)":"rgba(240,240,255,0.7)"};color:#7F77DD}
    .nav-item.active{font-weight:600}
    .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600}
    .badge-red{background:#FCEBEB;color:#A32D2D}
    .badge-green{background:#EAF3DE;color:#3B6D11}
    .badge-yellow{background:#FAEEDA;color:#854F0B}
    .badge-blue{background:#E6F1FB;color:#185FA5}
    .badge-purple{background:#EEEDFE;color:#3C3489}
    .badge-gray{background:#F1EFE8;color:#5F5E5A}
    .progress-bar{height:6px;border-radius:3px;background:${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"}}
    .progress-fill{height:100%;border-radius:3px;transition:width .3s}
    .input{width:100%;padding:8px 12px;border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(224,226,234,0.5)"};border-radius:8px;background:${darkMode?"rgba(34,34,58,0.6)":"#fff"};color:${darkMode?"#e8e8f0":"#1a1a2e"};font-size:13px;outline:none}
    .input:focus{border-color:#7F77DD}
    .select{width:100%;padding:8px 12px;border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(224,226,234,0.5)"};border-radius:8px;background:${darkMode?"rgba(34,34,58,0.6)":"#fff"};color:${darkMode?"#e8e8f0":"#1a1a2e"};font-size:13px;outline:none}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
    .modal{background:${darkMode?"rgba(26,26,46,0.85)":"rgba(255,255,255,0.85)"};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};border-radius:16px;padding:24px;width:100%;max-width:480px;max-height:85vh;overflow-y:auto}
    .event-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
    .event-pill{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;font-size:12px;cursor:pointer;transition:opacity .15s}
    .event-pill:hover{opacity:.8}
    .cal-cell{min-height:80px;padding:6px;border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};vertical-align:top;cursor:pointer;transition:background .15s}
    .cal-cell:hover{background:${darkMode?"rgba(34,34,58,0.5)":"rgba(248,249,254,0.5)"}}
    .cal-today{background:${darkMode?"rgba(34,34,90,0.6)":"rgba(240,240,255,0.6)"}}
    .tab-btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:500;background:transparent;color:${darkMode?"#9090b0":"#777799"};transition:all .15s}
    .tab-btn.active{background:#7F77DD;color:#fff}
    .habit-check{width:28px;height:28px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .15s}
    .pomodoro-ring{width:200px;height:200px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:8px solid;margin:0 auto}
    .subject-dot{width:12px;height:12px;border-radius:3px;flex-shrink:0}
    table{width:100%;border-collapse:collapse}
    th{text-align:left;font-size:12px;font-weight:600;color:${darkMode?"#9090b0":"#888899"};padding:8px 12px;border-bottom:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};text-transform:uppercase;letter-spacing:.5px}
    td{padding:10px 12px;border-bottom:1px solid ${darkMode?"rgba(30,30,48,0.5)":"rgba(240,242,250,0.5)"};font-size:13px;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    .notif{position:fixed;top:20px;right:20px;background:#7F77DD;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:500;z-index:999;animation:slideIn .3s ease}
    @keyframes slideIn{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}
    .scroll-y{overflow-y:auto;max-height:320px}
    .chip{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;border:1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"};background:${darkMode?"rgba(34,34,58,0.6)":"rgba(248,249,254,0.6)"};color:${darkMode?"#9090b0":"#666688"};cursor:pointer;transition:all .15s}
    .chip.active{background:#7F77DD;color:#fff;border-color:#7F77DD}
    @media(max-width:768px){.sidebar{transform:${sidebarCollapsed?"translateX(-100%)":"translateX(0)"}}.main{margin-left:0 !important}.grid4{grid-template-columns:1fr 1fr}.grid3{grid-template-columns:1fr}}
  `;

  function Sidebar() {
    const navs = [
      { id:"dashboard", icon:"🏠", label:"Dashboard" },
      { id:"calendar", icon:"📅", label:"Calendar" },
      { id:"assignments", icon:"📋", label:"Assignments" },
      { id:"tasks", icon:"✅", label:"To-Do List" },
      { id:"exams", icon:"⏱️", label:"Exam Countdown" },
      { id:"pomodoro", icon:"🍅", label:"Pomodoro" },
      { id:"subjects", icon:"🎓", label:"Subjects" },
      { id:"attendance", icon:"📌", label:"Attendance" },
      { id:"timetable", icon:"🗓️", label:"Timetable" },
    ];
    return (
      <div className="sidebar">
        <div style={{padding:"20px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <span style={{fontSize:22}}>🎓</span>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:darkMode?"#e8e8f0":"#1a1a2e"}}>StudyOS</div>
              <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899"}}>Academic Planner</div>
            </div>
          </div>
        </div>
        <div style={{padding:"0 8px", overflowY:"auto", flex:1}}>
          {navs.map(n => (
            <button key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>setTab(n.id)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </div>
        <div style={{padding:"16px",marginTop:"auto",display:"flex",flexDirection:"column",gap:12}}>
          <img 
            src={postcardImg} 
            alt="Postcard" 
            style={{
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "block"
            }} 
          />
          <button className="btn btn-ghost" style={{width:"100%",fontSize:12}} onClick={()=>setShowBgSettings(true)}>
            🖼️ Customize BG
          </button>
        </div>
      </div>
    );
  }

  function Dashboard() {
    return (
      <div>
        <div style={{marginBottom:20}}>
          <h1 className="page-heading">Good {today.getHours()<12?"Morning":"Afternoon"}! 👋</h1>
          <div>
            <div className="date-pill">{today.toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          </div>
        </div>


        <div className="grid2" style={{marginBottom:20}}>
          {[
            { label:"Assignments", value:`${completedAssignments}/${assignments.length}`, icon:"📋", sub:"completed", color:"#1D9E75" },
            { label:"Attendance", value:`${avgAttendance}%`, icon:"📌", sub:"average", color:"#378ADD" },
          ].map(m => (
            <div key={m.label} className="card" style={{borderTop:`3px solid ${m.color}`}}>
              <div style={{fontSize:20,marginBottom:6}}>{m.icon}</div>
              <div style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</div>
              <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899",marginTop:2}}>{m.label}</div>
              <div style={{fontSize:10,color:darkMode?"#777790":"#aaaacc"}}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid2" style={{marginBottom:20}}>
          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <h3 style={{fontSize:14,fontWeight:600}}>📅 Today's Schedule</h3>
              <span style={{fontSize:11,color:darkMode?"#9090b0":"#888899"}}>{todayStr}</span>
            </div>
            {todayEvents.length === 0 ? (
              <div style={{color:darkMode?"#777790":"#aaaacc",fontSize:13,textAlign:"center",padding:"20px 0"}}>No events today 🎉</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {todayEvents.map(e => (
                  <div key={e.id} className="event-pill" style={{background:e.color+"20",border:`1px solid ${e.color}30`}} onClick={()=>setSelectedEvent(e)}>
                    <div style={{width:3,height:30,background:e.color,borderRadius:2,flexShrink:0}}></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:darkMode?"#e8e8f0":"#1a1a2e"}}>{e.title}</div>
                      <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899"}}>{e.startTime} – {e.endTime} · {e.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <h3 style={{fontSize:14,fontWeight:600}}>⏱️ Exam Countdown</h3>
            </div>
            {upcomingExams.slice(0,3).map(e => {
              const days = daysBetween(todayStr, e.date);
              const urgency = days<=7?"#E24B4A":days<=14?"#BA7517":"#1D9E75";
              return (
                <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(240,242,250,0.5)"}`}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{e.subject}</div>
                    <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899"}}>{e.date}</div>
                  </div>
                  <div style={{background:urgency+"15",color:urgency,padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{days}d left</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontSize:14,fontWeight:600}}>✅ Pending Tasks</h3>
            <span style={{background:"#E24B4A20",color:"#E24B4A",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600}}>{pendingTasks.length}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {pendingTasks.slice(0,6).map(t => (
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}>
                <input type="checkbox" onChange={()=>toggleTask(t.id)} style={{width:16,height:16,accentColor:"#7F77DD"}} />
                <span style={{fontSize:13,flex:1}}>{t.text}</span>
                <span className={`badge badge-${t.priority==="High"?"red":t.priority==="Medium"?"yellow":"gray"}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function CalendarView() {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDay(y, m);
    const cells = [];
    for (let i=0; i<firstDay; i++) cells.push(null);
    for (let d=1; d<=daysInMonth; d++) cells.push(d);

    function getEventsForDay(day) {
      const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      return events.filter(e => e.date === dateStr && (calendarFilter === "All" || e.type === calendarFilter));
    }

    const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h2 className="page-heading" style={{marginBottom:0}}>{MONTHS[m]} {y}</h2>
          <div style={{display:"flex",gap:8}}>
            {["monthly","weekly","agenda"].map(v => (
              <button key={v} className={`tab-btn ${calView===v?"active":""}`} onClick={()=>setCalView(v)}>{v}</button>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={()=>setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}>‹</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setCurrentDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}>›</button>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <button className={`chip ${calendarFilter==="All"?"active":""}`} onClick={()=>setCalendarFilter("All")}>
            All Events
          </button>
          {Object.entries(COLORS).map(([type,color]) => {
            const isActive = calendarFilter === type;
            return (
              <button key={type} className={`chip ${isActive?"active":""}`} onClick={()=>setCalendarFilter(isActive?"All":type)} style={{textTransform:"capitalize"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:color,marginRight:6}}></span>{type}
              </button>
            );
          })}
        </div>

        {calView === "monthly" && (
          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>{weekDays.map(d=><th key={d} style={{padding:"10px",textAlign:"center",background:darkMode?"rgba(34,34,58,0.5)":"#f8f9fe",fontSize:12,fontWeight:600,color:darkMode?"#9090b0":"#888899"}}>{d}</th>)}</tr>
              </thead>
              <tbody>
                {Array.from({length:Math.ceil(cells.length/7)},(_,ri)=>(
                  <tr key={ri}>
                    {cells.slice(ri*7,(ri+1)*7).map((day,ci)=>{
                      if (!day) return <td key={ci} style={{padding:8,border:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"#f0f2fa"}`,aspectRatio:"1/1"}}></td>;
                      const dateStr = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                      const dayEvents = getEventsForDay(day);
                      const isToday = dateStr === todayStr;
                      return (
                        <td key={ci} style={{padding:8,border:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"#f0f2fa"}`,verticalAlign:"top",aspectRatio:"1/1",background:isToday?(darkMode?"rgba(34,34,90,0.6)":"#f0f0ff"):"transparent",cursor:"pointer"}}
                          onClick={()=>{setNewEvent(n=>({...n,date:dateStr}));setShowAddEvent(true)}}>
                          <div style={{fontSize:12,fontWeight:isToday?700:400,color:isToday?"#7F77DD":darkMode?"#e8e8f0":"#1a1a2e",marginBottom:4}}>{day}</div>
                          {dayEvents.slice(0,2).map(e=>(
                            <div key={e.id} onClick={ev=>{ev.stopPropagation();setSelectedEvent(e)}} style={{background:e.color+"20",borderLeft:`2px solid ${e.color}`,padding:"2px 4px",borderRadius:3,fontSize:10,marginBottom:2,color:darkMode?"#e8e8f0":"#1a1a2e",cursor:"pointer",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{e.title}</div>
                          ))}
                          {dayEvents.length>2&&<div style={{fontSize:10,color:"#7F77DD"}}>+{dayEvents.length-2} more</div>}
                        </td>
                      );
                    })}
                    {cells.slice(ri*7,(ri+1)*7).length<7 && Array.from({length:7-cells.slice(ri*7,(ri+1)*7).length},(_,i)=><td key={`empty-${i}`} style={{border:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"#f0f2fa"}`,aspectRatio:"1/1"}}></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {calView === "agenda" && (
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>Upcoming Events</h3>
            {events.filter(e=>e.date>=todayStr && (calendarFilter === "All" || e.type === calendarFilter)).sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)).map(e=>(
              <div key={e.id} className="event-pill" style={{background:e.color+"15",border:`1px solid ${e.color}30`,marginBottom:8}} onClick={()=>setSelectedEvent(e)}>
                <div style={{width:3,height:40,background:e.color,borderRadius:2,flexShrink:0}}></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{e.title}</div>
                  <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899"}}>{e.date} · {e.startTime}–{e.endTime} · {e.location}</div>
                </div>
                <span className={`badge badge-${e.type==="exams"?"red":e.type==="study"?"green":"blue"}`}>{e.type}</span>
              </div>
            ))}
          </div>
        )}

        {calView === "weekly" && (
          <div className="card">
            <div style={{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",gap:1}}>
              <div style={{padding:8}}></div>
              {weekDays.map(d=><div key={d} style={{padding:8,textAlign:"center",fontSize:12,fontWeight:600,color:darkMode?"#9090b0":"#888899"}}>{d}</div>)}
              {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(hr=>(
                <>
                  <div key={hr} style={{padding:"8px 4px",fontSize:10,color:darkMode?"#777790":"#aaaacc",textAlign:"right"}}>{hr}</div>
                  {weekDays.map(d=>{
                    const dayIdx = weekDays.indexOf(d);
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay() + dayIdx);
                    const dateStr = formatDate(weekStart);
                    const evt = events.find(e=>e.date===dateStr && e.startTime===hr && (calendarFilter === "All" || e.type === calendarFilter));
                    return (
                      <div key={d} style={{minHeight:40,border:`1px solid ${darkMode?"#2a2a3e":"#f0f2fa"}`,padding:2}}>
                        {evt && <div style={{background:evt.color+"30",border:`1px solid ${evt.color}`,borderRadius:4,padding:"2px 4px",fontSize:10,color:darkMode?"#e8e8f0":"#1a1a2e",overflow:"hidden"}}>{evt.title}</div>}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function Assignments() {
    const filters = ["All","Not Started","In Progress","Completed"];
    const filtered = assignments.filter(a=>assignmentsFilter==="All"||a.status===assignmentsFilter);
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 className="page-heading" style={{marginBottom:0}}>📋 Assignment Tracker</h2>
          <button className="btn btn-primary" onClick={()=>setShowAddAssignment(true)}>+ Add Assignment</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {filters.map(f=><button key={f} className={`chip ${assignmentsFilter===f?"active":""}`} onClick={()=>setAssignmentsFilter(f)}>{f}</button>)}
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <table>
            <thead><tr>
              <th>Assignment</th><th>Subject</th><th>Due Date</th><th>Status</th><th>Priority</th><th>Progress</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(a=>{
                const daysLeft = daysBetween(todayStr, a.dueDate);
                return (
                  <tr key={a.id}>
                    <td><div style={{fontWeight:500}}>{a.title}</div></td>
                    <td><span style={{fontSize:12,color:darkMode?"#9090b0":"#888899"}}>{a.subject}</span></td>
                    <td><div style={{fontSize:12}}>{a.dueDate}</div><div style={{fontSize:10,color:daysLeft<=2?"#E24B4A":"#888899"}}>{daysLeft}d left</div></td>
                    <td><span className={`badge badge-${a.status==="Completed"?"green":a.status==="In Progress"?"blue":"gray"}`}>{a.status}</span></td>
                    <td><span className={`badge badge-${a.priority==="High"?"red":a.priority==="Medium"?"yellow":"gray"}`}>{a.priority}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className="progress-bar" style={{flex:1}}><div className="progress-fill" style={{width:`${a.progress}%`,background:"#7F77DD"}}></div></div>
                        <span style={{fontSize:11,fontWeight:600,minWidth:30}}>{a.progress}%</span>
                      </div>
                    </td>
                    <td><button className="btn btn-ghost btn-sm" onClick={()=>{setSelectedAssignment(a);setEditingAssignment(a);}}>View</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function Tasks() {
    const cats = ["All",...[...new Set(tasks.map(t=>t.category))]];
    const filtered = tasks.filter(t=>!t.done && (tasksFilter==="All"||t.category===tasksFilter));
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 className="page-heading" style={{marginBottom:0}}>✅ To-Do List</h2>
          <button className="btn btn-primary" onClick={()=>setShowAddTask(true)}>+ Add Task</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {cats.map(c=><button key={c} className={`chip ${tasksFilter===c?"active":""}`} onClick={()=>setTasksFilter(c)}>{c}</button>)}
        </div>
        <div className="card">
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {filtered.map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 8px",borderRadius:8,background:t.done?(darkMode?"#1e2e1e":"#f0f8f0"):"transparent",opacity:t.done?.6:1,transition:"all .15s"}}>
                <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} style={{width:18,height:18,accentColor:"#7F77DD",flexShrink:0}} />
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,textDecoration:t.done?"line-through":"none",color:t.done?(darkMode?"#777790":"#aaaacc"):darkMode?"#e8e8f0":"#1a1a2e"}}>{t.text}</div>
                  <div style={{fontSize:11,color:darkMode?"#777790":"#aaaacc"}}>{t.category} · Due {t.dueDate} {t.recurring?"· 🔄 Recurring":""}</div>
                </div>
                <span className={`badge badge-${t.priority==="High"?"red":t.priority==="Medium"?"yellow":"gray"}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // StudyPlanner was removed

  function ExamCountdown() {
    return (
      <div>
        <h2 className="page-heading">⏱️ Exam Countdown</h2>
        <div className="grid3">
          {upcomingExams.map(e=>{
            const days = daysBetween(todayStr, e.date);
            const urgency = days<=7?"#E24B4A":days<=14?"#BA7517":"#1D9E75";
            const cl = examChecklists[e.id] || [];
            return (
              <div key={e.id} className="card">
                <div style={{textAlign:"center",marginBottom:12}}>
                  <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{e.subject}</div>
                  <div style={{fontSize:40,fontWeight:800,color:urgency}}>{days}</div>
                  <div style={{fontSize:12,color:darkMode?"#9090b0":"#888899"}}>days left</div>
                  <div style={{fontSize:11,marginTop:4,color:darkMode?"#9090b0":"#888899"}}>{e.date} · {e.startTime}</div>
                </div>
                <div className="progress-bar" style={{marginBottom:12}}>
                  <div className="progress-fill" style={{width:`${Math.max(0,100-(days/30)*100)}%`,background:urgency}}></div>
                </div>
                <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Revision Checklist</div>
                {cl.map((item,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:12}}>
                    <input type="checkbox" style={{accentColor:"#7F77DD"}} />
                    <span>{item}</span>
                  </div>
                ))}
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input className="input" placeholder="Add topic" style={{flex:1,fontSize:12,padding:"6px 10px"}}
                    onKeyDown={ev=>{if(ev.key==="Enter"&&ev.target.value){setExamChecklists(c=>({...c,[e.id]:[...(c[e.id]||[]),ev.target.value]}));ev.target.value="";}}} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Habits component was removed

  function Pomodoro() {
    const pMode = pomodoroState;
    const totalSecs = pMode.duration;
    const pct = totalSecs > 0 ? ((totalSecs - pMode.seconds) / totalSecs) * 100 : 0;
    const modeColor = pMode.mode === "study" ? "#E24B4A" : pMode.mode === "break" ? "#1D9E75" : "#378ADD";
    const modeLabel = pMode.mode === "study" ? "Study Time" : pMode.mode === "break" ? "Short Break" : "Long Break";
    return (
      <div>
        <h2 className="page-heading">🍅 Pomodoro Timer</h2>
        <div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}>
          <div className="card" style={{textAlign:"center",width:"100%",maxWidth:"400px"}}>
            <div style={{marginBottom:12}}>
              <span className={`badge badge-${pMode.mode==="study"?"red":pMode.mode==="break"?"green":"blue"}`}>{modeLabel}</span>
            </div>
            <div style={{position:"relative",width:200,height:200,margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="200" height="200" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                <circle cx="100" cy="100" r="88" fill="none" stroke={darkMode?"#2a2a3e":"#f0f0f0"} strokeWidth="12"/>
                <circle cx="100" cy="100" r="88" fill="none" stroke={modeColor} strokeWidth="12"
                  strokeDasharray={`${2*Math.PI*88}`} strokeDashoffset={`${2*Math.PI*88*(1-pct/100)}`}
                  style={{transition:"stroke-dashoffset 1s linear"}} strokeLinecap="round"/>
              </svg>
              <div>
                <div style={{fontSize:42,fontWeight:700,color:modeColor,lineHeight:1}}>{fmtTime(pMode.seconds)}</div>
                <div style={{fontSize:12,color:darkMode?"#9090b0":"#888899",marginTop:4}}>Session {pMode.sessions+1}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:16}}>
              <button className="btn btn-primary" style={{background:modeColor,minWidth:80}} onClick={()=>{ unlockAudio(); setPomodoroState(s=>({...s,running:!s.running})); }}>
                {pMode.running?"⏸ Pause":"▶ Start"}
              </button>
              <button className="btn btn-ghost" onClick={()=>{ unlockAudio(); setPomodoroState({running:false,mode:"study",seconds:1500,duration:1500,sessions:0}); }}>↺ Reset</button>
              <button className="btn btn-ghost" onClick={()=>{ unlockAudio(); playAlarmSound(); }} style={{display:"flex",alignItems:"center",gap:4}}>
                🔊 Test Sound
              </button>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:20}}>
              {["study","break","longbreak"].map(m=>{
                const sVal = m==="study"?1500:m==="break"?300:900;
                return (
                  <button key={m} className={`chip ${pMode.mode===m?"active":""}`} onClick={()=>setPomodoroState(s=>({...s,running:false,mode:m,seconds:sVal,duration:sVal}))}>
                    {m==="study"?"🍅 25m":m==="break"?"☕ 5m":"🌿 15m"}
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"}`}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:8,color:darkMode?"#9090b0":"#888899"}}>Set Custom Time</label>
              <div style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <label style={{fontSize:9,color:"#9090b0",marginBottom:2}}>Hrs</label>
                  <input type="number" className="input" style={{width:55,textAlign:"center"}} value={customPomodoroHrs} onChange={e=>setCustomPomodoroHrs(e.target.value)} min="0" max="23" />
                </div>
                <span style={{fontSize:16,fontWeight:600,alignSelf:"flex-end",paddingBottom:8}}>:</span>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <label style={{fontSize:9,color:"#9090b0",marginBottom:2}}>Mins</label>
                  <input type="number" className="input" style={{width:55,textAlign:"center"}} value={customPomodoroMins} onChange={e=>setCustomPomodoroMins(e.target.value)} min="0" max="59" />
                </div>
                <span style={{fontSize:16,fontWeight:600,alignSelf:"flex-end",paddingBottom:8}}>:</span>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <label style={{fontSize:9,color:"#9090b0",marginBottom:2}}>Secs</label>
                  <input type="number" className="input" style={{width:55,textAlign:"center"}} value={customPomodoroSecs} onChange={e=>setCustomPomodoroSecs(e.target.value)} min="0" max="59" />
                </div>
                <button className="btn btn-primary" style={{alignSelf:"flex-end",marginBottom:1,marginLeft:4}} onClick={() => {
                  const h = parseInt(customPomodoroHrs) || 0;
                  const m = parseInt(customPomodoroMins) || 0;
                  const s = parseInt(customPomodoroSecs) || 0;
                  const total = (h * 3600) + (m * 60) + s;
                  if (total && total > 0) {
                    setPomodoroState(prev => ({ ...prev, running: false, seconds: total, duration: total }));
                    showNotif(`Timer set to ${h > 0 ? `${h}h ` : ""}${m}m ${s}s!`);
                  }
                }}>Set</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Goals component was removed

  // Analytics was removed

  const adjustAttended = (id, delta) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        const newAtt = Math.max(0, Math.min(s.totalClasses, s.attendedClasses + delta));
        return { ...s, attendedClasses: newAtt };
      }
      return s;
    }));
  };

  const adjustTotal = (id, delta) => {
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        const newTotal = Math.max(1, s.totalClasses + delta);
        const newAtt = Math.min(newTotal, s.attendedClasses);
        return { ...s, totalClasses: newTotal, attendedClasses: newAtt };
      }
      return s;
    }));
  };

  function Subjects() {
    const addSubject = () => {
      if (newSubject.name.trim()) {
        setSubjects(prev => [...prev, { ...newSubject, id: Date.now() }]);
        setNewSubject({ name: "", credits: 3, totalClasses: 30, attendedClasses: 0, color: "#378ADD" });
        showNotif("Subject added!");
      }
    };

    return (
      <div>
        <h2 className="page-heading">🎓 Subject Management</h2>
        <div className="grid2" style={{marginBottom:20}}>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>Add New Subject</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="input" placeholder="Subject Name" value={newSubject.name} onChange={e=>setNewSubject(n=>({...n,name:e.target.value}))} />
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:"#9090b0"}}>Credits</label>
                  <input type="number" className="input" value={newSubject.credits} onChange={e=>setNewSubject(n=>({...n,credits:parseInt(e.target.value)||0}))} />
                </div>
                <div style={{flex:1}}>
                  <label style={{fontSize:11,color:"#9090b0"}}>Total Classes</label>
                  <input type="number" className="input" value={newSubject.totalClasses} onChange={e=>setNewSubject(n=>({...n,totalClasses:parseInt(e.target.value)||0}))} min="1" />
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <label style={{fontSize:12,color:"#9090b0"}}>Theme Color:</label>
                <input type="color" style={{border:"none",background:"none",width:40,height:32,cursor:"pointer"}} value={newSubject.color} onChange={e=>setNewSubject(n=>({...n,color:e.target.value}))} />
              </div>
              <button className="btn btn-primary" onClick={addSubject}>Add Subject</button>
            </div>
          </div>
          
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {subjects.map(s=>{
              const att = s.totalClasses > 0 ? Math.round((s.attendedClasses / s.totalClasses) * 100) : 100;
              return (
                <div key={s.id} className="card" style={{borderLeft:`4px solid ${s.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:15}}>{s.name}</div>
                    </div>
                    <span style={{background:s.color+"20",color:s.color,padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{s.credits} Credits</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                      <span style={{color:darkMode?"#9090b0":"#888899"}}>Attendance</span>
                      <span style={{fontWeight:600,color:att>=75?"#1D9E75":"#E24B4A"}}>{att}% ({s.attendedClasses}/{s.totalClasses})</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{width:`${att}%`,background:att>=75?"#1D9E75":"#E24B4A"}}></div></div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
                    <div style={{display:"flex",gap:8}}>
                      {events.filter(e=>e.subject===s.name).slice(0,2).map(e=>(
                        <span key={e.id} className={`badge badge-${e.type==="exams"?"red":e.type==="classes"?"blue":"gray"}`}>{e.type}</span>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{borderColor:"rgba(226,75,74,0.4)",color:"#E24B4A",padding:"3px 8px"}} onClick={()=>{
                      setSubjects(prev=>prev.filter(x=>x.id!==s.id));
                      showNotif("Subject removed!");
                    }}>🗑 Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function Attendance() {
    return (
      <div>
        <h2 className="page-heading">📌 Attendance Tracker</h2>
        <div className="card" style={{padding:0,overflow:"hidden",marginBottom:16}}>
          <table>
            <thead><tr><th>Subject</th><th>Present (Attended)</th><th>Absent</th><th>Total</th><th>Attendance %</th></tr></thead>
            <tbody>
              {subjects.map(s=>{
                const att = s.totalClasses > 0 ? Math.round((s.attendedClasses / s.totalClasses) * 100) : 100;
                return (
                  <tr key={s.id}>
                    <td><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:2,background:s.color}}></div>{s.name}</div></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button className="btn btn-ghost btn-sm" style={{padding:"2px 8px",minWidth:24}} onClick={()=>adjustAttended(s.id, -1)}>-</button>
                        <span style={{color:"#1D9E75",fontWeight:600,minWidth:24,textAlign:"center"}}>{s.attendedClasses}</span>
                        <button className="btn btn-ghost btn-sm" style={{padding:"2px 8px",minWidth:24}} onClick={()=>adjustAttended(s.id, 1)}>+</button>
                      </div>
                    </td>
                    <td><span style={{color:"#E24B4A",fontWeight:600}}>{s.totalClasses - s.attendedClasses}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button className="btn btn-ghost btn-sm" style={{padding:"2px 8px",minWidth:24}} onClick={()=>adjustTotal(s.id, -1)}>-</button>
                        <span style={{minWidth:24,textAlign:"center"}}>{s.totalClasses}</span>
                        <button className="btn btn-ghost btn-sm" style={{padding:"2px 8px",minWidth:24}} onClick={()=>adjustTotal(s.id, 1)}>+</button>
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className="progress-bar" style={{width:80}}><div className="progress-fill" style={{width:`${att}%`,background:att>=75?"#1D9E75":"#E24B4A"}}></div></div>
                        <span style={{fontSize:12,fontWeight:700,color:att>=75?"#1D9E75":"#E24B4A"}}>{att}%</span>
                        {att<75&&<span className="badge badge-red">⚠ Low</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid4">
          {subjects.map(s=>{
            const att = s.totalClasses > 0 ? Math.round((s.attendedClasses / s.totalClasses) * 100) : 100;
            return (
              <div key={s.id} className="card" style={{textAlign:"center",borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:s.color}}>{s.name}</div>
                <div style={{fontSize:24,fontWeight:800,color:att>=75?"#1D9E75":"#E24B4A"}}>{att}%</div>
                <div style={{fontSize:11,color:darkMode?"#9090b0":"#888899",marginTop:4}}>{s.attendedClasses}/{s.totalClasses} classes</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function Timetable() {
    const handleSlotClick = (day, time, slot) => {
      setEditingSlot({ day, time });
      setSlotForm({ subj: slot ? slot.subj : "", room: slot ? slot.room : "" });
    };

    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
      <div>
        <h2 className="page-heading">🗓️ Weekly Timetable</h2>
        <div style={{marginBottom:10,fontSize:12,color:"#9090b0"}}>💡 Click any cell/slot in the grid to add, edit, or clear a class.</div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",borderBottom:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"}`}}>
            <div style={{padding:"12px 8px",background:darkMode?"rgba(34,34,58,0.5)":"#f8f9fe"}}></div>
            {weekDays.map(d=><div key={d} style={{padding:"12px 8px",textAlign:"center",fontSize:12,fontWeight:600,background:darkMode?"rgba(34,34,58,0.5)":"#f8f9fe",color:darkMode?"#9090b0":"#888899"}}>{d}</div>)}
          </div>
          {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(hr=>(
            <div key={hr} style={{display:"grid",gridTemplateColumns:"80px repeat(5,1fr)",borderBottom:`1px solid ${darkMode?"rgba(42,42,62,0.5)":"rgba(232,234,240,0.5)"}`}}>
              <div style={{padding:"12px 8px",fontSize:11,color:darkMode?"#777790":"#aaaacc",textAlign:"center"}}>{hr}</div>
              {weekDays.map((day,i)=>{
                const daySlots = timetable[day] || [];
                const slot = daySlots.find(s=>s.time===hr);
                const c = slot ? (subjects.find(s=>s.name===slot.subj)?.color || "#7F77DD") : "transparent";
                return (
                  <div key={i} onClick={() => handleSlotClick(day, hr, slot)} style={{padding:6,minHeight:48,background:"transparent",cursor:"pointer",borderRight:`1px solid ${darkMode?"rgba(42,42,62,0.15)":"rgba(240,242,250,0.5)"}`,transition:"background .15s"}}
                    className="cal-cell">
                    {slot ? (
                      <div style={{background:c+"20",border:`1px solid ${c}40`,borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:600,color:c}}>
                        {slot.subj}
                        <div style={{fontSize:10,fontWeight:400,color:darkMode?"#9090b0":"#888899"}}>{slot.room}</div>
                      </div>
                    ) : (
                      <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"rgba(255,255,255,0.04)"}}>+</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }


  function AddEventModal() {
    return (
      <div className="modal-bg" onClick={e=>{if(e.target.className==="modal-bg")setShowAddEvent(false)}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:16,fontWeight:700}}>Add Event</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAddEvent(false)}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input className="input" placeholder="Event title" value={newEvent.title} onChange={e=>setNewEvent(n=>({...n,title:e.target.value}))} />
            <select className="select" value={newEvent.type} onChange={e=>setNewEvent(n=>({...n,type:e.target.value,color:COLORS[e.target.value]||"#888780"}))}>
              {Object.keys(COLORS).map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <select className="select" value={newEvent.subject} onChange={e=>setNewEvent(n=>({...n,subject:e.target.value}))}>
              <option value="">Select subject (optional)</option>
              {subjects.map(s=><option key={s.id}>{s.name}</option>)}
            </select>
            <input type="date" className="input" value={newEvent.date} onChange={e=>setNewEvent(n=>({...n,date:e.target.value}))} />
            <div style={{display:"flex",gap:8}}>
              <input type="time" className="input" value={newEvent.startTime} onChange={e=>setNewEvent(n=>({...n,startTime:e.target.value}))} />
              <input type="time" className="input" value={newEvent.endTime} onChange={e=>setNewEvent(n=>({...n,endTime:e.target.value}))} />
            </div>
            <input className="input" placeholder="Location" value={newEvent.location} onChange={e=>setNewEvent(n=>({...n,location:e.target.value}))} />
            <textarea className="input" placeholder="Notes" value={newEvent.notes} onChange={e=>setNewEvent(n=>({...n,notes:e.target.value}))} rows={3} style={{resize:"vertical"}} />
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowAddEvent(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addEvent}>Add Event</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AddTaskModal() {
    return (
      <div className="modal-bg" onClick={e=>{if(e.target.className==="modal-bg")setShowAddTask(false)}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:16,fontWeight:700}}>Add Task</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAddTask(false)}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input className="input" placeholder="Task description" value={newTask.text} onChange={e=>setNewTask(n=>({...n,text:e.target.value}))} />
            <select className="select" value={newTask.priority} onChange={e=>setNewTask(n=>({...n,priority:e.target.value}))}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            <select className="select" value={newTask.category} onChange={e=>setNewTask(n=>({...n,category:e.target.value}))}>
              <option>Academic</option><option>Study</option><option>Personal</option><option>Coding</option><option>Other</option>
            </select>
            <input type="date" className="input" value={newTask.dueDate} onChange={e=>setNewTask(n=>({...n,dueDate:e.target.value}))} />
            <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}>
              <input type="checkbox" checked={newTask.recurring} onChange={e=>setNewTask(n=>({...n,recurring:e.target.checked}))} />
              Recurring task
            </label>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowAddTask(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AddAssignmentModal() {
    return (
      <div className="modal-bg" onClick={e=>{if(e.target.className==="modal-bg")setShowAddAssignment(false)}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:16,fontWeight:700}}>Add Assignment</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowAddAssignment(false)}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input className="input" placeholder="Assignment title" value={newAssignment.title} onChange={e=>setNewAssignment(n=>({...n,title:e.target.value}))} />
            <select className="select" value={newAssignment.subject} onChange={e=>setNewAssignment(n=>({...n,subject:e.target.value}))}>
              <option value="">Select subject</option>
              {subjects.map(s=><option key={s.id}>{s.name}</option>)}
            </select>
            <input type="date" className="input" value={newAssignment.dueDate} onChange={e=>setNewAssignment(n=>({...n,dueDate:e.target.value}))} />
            <select className="select" value={newAssignment.priority} onChange={e=>setNewAssignment(n=>({...n,priority:e.target.value}))}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <label style={{fontSize:13,minWidth:120}}>Est. hours:</label>
              <input type="number" className="input" value={newAssignment.estimatedHours} onChange={e=>setNewAssignment(n=>({...n,estimatedHours:+e.target.value}))} min="0" />
            </div>
            <input className="input" placeholder="Submission link" value={newAssignment.submissionLink||""} onChange={e=>setNewAssignment(n=>({...n,submissionLink:e.target.value}))} />
            <textarea className="input" placeholder="Notes" value={newAssignment.notes} onChange={e=>setNewAssignment(n=>({...n,notes:e.target.value}))} rows={2} />
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost" onClick={()=>setShowAddAssignment(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addAssignment}>Add Assignment</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function EventDetailModal() {
    const e = selectedEvent;
    if (!e) return null;
    return (
      <div className="modal-bg" onClick={ev=>{if(ev.target.className==="modal-bg")setSelectedEvent(null)}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:4,height:40,background:e.color,borderRadius:2}}></div>
              <div>
                <h2 style={{fontSize:16,fontWeight:700}}>{e.title}</h2>
                <span className={`badge badge-${e.type==="exams"?"red":e.type==="study"?"green":"blue"}`}>{e.type}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelectedEvent(null)}>✕</button>
          </div>
          {[["📅 Date",e.date],["⏰ Time",`${e.startTime} – ${e.endTime}`],["📍 Location",e.location],["📚 Subject",e.subject],["📝 Notes",e.notes]].map(([label,val])=>val?(
            <div key={label} style={{display:"flex",gap:12,marginBottom:8}}>
              <span style={{fontSize:12,color:darkMode?"#9090b0":"#888899",minWidth:100}}>{label}</span>
              <span style={{fontSize:13,fontWeight:500}}>{val}</span>
            </div>
          ):null)}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>{setEvents(evs=>evs.filter(x=>x.id!==e.id));setSelectedEvent(null);}}>🗑 Delete</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setSelectedEvent(null)}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  function AssignmentDetailModal() {
    const a = editingAssignment;
    if (!a) return null;
    const save = () => { 
      setAssignments(as=>as.map(x=>x.id===a.id?a:x)); 
      setSelectedAssignment(null); 
      setEditingAssignment(null);
    };
    const cancel = () => {
      setSelectedAssignment(null);
      setEditingAssignment(null);
    };
    return (
      <div className="modal-bg" onClick={ev=>{if(ev.target.className==="modal-bg")cancel()}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700}}>{a.title}</h2>
            <button className="btn btn-ghost btn-sm" onClick={cancel}>✕</button>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <span className={`badge badge-${a.priority==="High"?"red":a.priority==="Medium"?"yellow":"gray"}`}>{a.priority}</span>
            <span className={`badge badge-${a.status==="Completed"?"green":a.status==="In Progress"?"blue":"gray"}`}>{a.status}</span>
            <span className="badge badge-purple">{a.subject}</span>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:darkMode?"#9090b0":"#888899",marginBottom:4}}>Progress: {a.progress}%</div>
            <div className="progress-bar" style={{height:8,borderRadius:4}}><div className="progress-fill" style={{width:`${a.progress}%`,background:"#7F77DD",height:"100%",borderRadius:4}}></div></div>
            <input type="range" min="0" max="100" value={a.progress} onChange={e=>setEditingAssignment(x=>({...x,progress:+e.target.value}))} style={{width:"100%",marginTop:4,accentColor:"#7F77DD"}} />
          </div>
          <select className="select" value={a.status} onChange={e=>setEditingAssignment(x=>({...x,status:e.target.value}))} style={{marginBottom:12}}>
            <option>Not Started</option><option>In Progress</option><option>Completed</option>
          </select>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:8}}>Checklist</div>
            {(a.checklist||[]).map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:13}}>
                <input type="checkbox" style={{accentColor:"#7F77DD"}} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button className="btn btn-ghost btn-sm" onClick={cancel}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  const getTabContent = () => {
    switch (tab) {
      case "dashboard": return Dashboard();
      case "calendar": return CalendarView();
      case "assignments": return Assignments();
      case "tasks": return Tasks();
      case "exams": return ExamCountdown();
      case "pomodoro": return Pomodoro();
      case "subjects": return Subjects();
      case "attendance": return Attendance();
      case "timetable": return Timetable();
      default: return Dashboard();
    }
  };

  function BackgroundSettingsModal() {
    const addGif = () => {
      if (newGifUrl.trim()) {
        const nameVal = newGifName.trim() || newGifUrl.trim().split('/').pop() || `Custom GIF ${backgrounds.length + 1}`;
        const newBg = {
          id: `custom-${Date.now()}`,
          name: nameVal,
          url: newGifUrl.trim()
        };
        setBackgrounds(prev => [...prev, newBg]);
        setBackgroundGif(newBg.url);
        setNewGifUrl("");
        setNewGifName("");
      }
    };

    return (
      <div className="modal-bg" onClick={e=>{if(e.target.className==="modal-bg")setShowBgSettings(false)}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:16,fontWeight:700}}>Choose Background</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowBgSettings(false)}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:8}}>Add Custom GIF (URL/Path)</label>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <input className="input" placeholder="Custom Name (e.g. Lo-fi Chill Room)" value={newGifName} onChange={e=>setNewGifName(e.target.value)} />
                <div style={{display:"flex",gap:8}}>
                  <input className="input" placeholder="Paste GIF URL or relative path (e.g. ./relax.gif)" value={newGifUrl} onChange={e=>setNewGifUrl(e.target.value)} />
                  <button className="btn btn-primary" onClick={addGif}>Add</button>
                </div>
              </div>
            </div>

            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:8}}>Upload Local Image / GIF</label>
              <input type="file" accept="image/*" className="input" style={{padding:"6px 10px"}} onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    const newBg = {
                      id: `custom-${Date.now()}`,
                      name: file.name,
                      url: dataUrl
                    };
                    setBackgrounds(prev => [...prev, newBg]);
                    setBackgroundGif(newBg.url);
                  };
                  reader.readAsDataURL(file);
                }
              }} />
            </div>

            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:8}}>Select a Theme</label>
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:250,overflowY:"auto"}}>
                {backgrounds.map(bg => (
                  <div key={bg.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <button className="btn" style={{
                      flex: 1,
                      textAlign: "left",
                      padding: "10px 12px",
                      background: backgroundGif === bg.url ? "#7F77DD" : "transparent",
                      color: backgroundGif === bg.url ? "#fff" : "#e8e8f0",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: backgroundGif === bg.url ? "600" : "500",
                      transition: "all 0.15s",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }} onClick={() => setBackgroundGif(bg.url)}>
                      {bg.name}
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{padding: "6px 8px", minWidth: 28}} title="Rename Background" onClick={() => {
                      const newName = prompt("Enter new name for this background:", bg.name);
                      if (newName && newName.trim()) {
                        setBackgrounds(prev => prev.map(x => x.id === bg.id ? { ...x, name: newName.trim() } : x));
                      }
                    }}>✏️</button>
                    {bg.id !== "custom-gif" && (
                      <button className="btn btn-ghost btn-sm" style={{borderColor: "rgba(226,75,74,0.4)", color: "#E24B4A", padding: "6px 8px", minWidth: 28}} title="Delete Background" onClick={() => {
                        setBackgrounds(prev => prev.filter(x => x.id !== bg.id));
                        if (backgroundGif === bg.url) {
                          setBackgroundGif(downloadGif);
                        }
                      }}>🗑</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
              <button className="btn btn-primary" onClick={()=>setShowBgSettings(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function EditSlotModal() {
    const saveSlot = () => {
      const { day, time } = editingSlot;
      setTimetable(prev => {
        const daySlots = prev[day] || [];
        // Remove existing slot for this time if it exists
        const filtered = daySlots.filter(s => s.time !== time);
        if (slotForm.subj) {
          filtered.push({ time, subj: slotForm.subj, room: slotForm.room });
        }
        return { ...prev, [day]: filtered };
      });
      setEditingSlot(null);
      showNotif("Timetable updated!");
    };

    return (
      <div className="modal-bg" onClick={e=>{if(e.target.className==="modal-bg")setEditingSlot(null)}}>
        <div className="modal">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontSize:16,fontWeight:700}}>Edit Class Slot ({editingSlot.day} @ {editingSlot.time})</h2>
            <button className="btn btn-ghost btn-sm" onClick={()=>setEditingSlot(null)}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:6}}>Subject</label>
              <select className="select" value={slotForm.subj} onChange={e=>setSlotForm(f=>({...f,subj:e.target.value}))}>
                <option value="">No Class (Clear Slot)</option>
                {subjects.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:6}}>Room / Location</label>
              <input className="input" placeholder="e.g. Room 301, Lab 2" value={slotForm.room} onChange={e=>setSlotForm(f=>({...f,room:e.target.value}))} />
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
              <button className="btn btn-ghost" onClick={()=>setEditingSlot(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSlot}>Save Slot</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <style>{css}</style>
      <div className="bg-layer"></div>
      {Sidebar()}
      <div className="main">
        <div className="topbar">
          <button className="btn btn-ghost btn-sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} style={{display:"flex",alignItems:"center",gap:6}}>
            <span>{sidebarCollapsed ? "▶" : "◀"}</span> <span>Sidebar</span>
          </button>
          <div style={{flex:1}}></div>
          <button className="btn btn-primary" onClick={()=>setShowAddEvent(true)} style={{display:"flex",alignItems:"center",gap:6}}>
            <span>+</span> Add Event
          </button>
        </div>
        {getTabContent()}
      </div>
      {showAddEvent && AddEventModal()}
      {showAddTask && AddTaskModal()}
      {showAddAssignment && AddAssignmentModal()}
      {selectedEvent && EventDetailModal()}
      {selectedAssignment && AssignmentDetailModal()}
      {showBgSettings && BackgroundSettingsModal()}
      {editingSlot && EditSlotModal()}
      {notification && <div className="notif">{notification}</div>}
    </div>
  );
}
