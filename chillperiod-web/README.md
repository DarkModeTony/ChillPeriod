# ChillPeriod Web 🌐

The web application for ChillPeriod — track attendance, discover chill spots, manage your academic life.

[![Live](https://img.shields.io/badge/Live-chillperiod.in-8b5cf6)](https://chillperiod.in)

---

## ✨ Features

### 📊 Attendance Tracker
- **Per-course tracking** with visual progress bars
- **GitHub-style heatmap** — full-year contribution graph with green (attended), red (bunked), amber (mixed)
- **Safety status**: 🟢 Safe / 🟡 Caution / 🔴 Danger zones
- **Bunk calculator**: Know exactly how many classes you can skip
- **Mass Bunk**: One-click bunk + cascading alerts to followers
- **Bunk Together**: Timeframe-aware — marks YOUR overlapping classes when joining a friend's bunk, not theirs

### 📅 Custom Timetable
- Auto-populated by selecting Semester & Section
- Support for lab groups (G1/G2)
- Custom timetable override for personalized schedules
- Today's schedule at a glance

### 📚 SyllabusX Integration
- Real-time B.Tech syllabus from [SyllabusX](https://syllabusx.live)
- Interactive progress checkboxes (persisted via localStorage)
- Unit-wise Theory & Lab breakdown
- Direct links to notes, PYQs, and books

### 🧭 Explore & Events
- **Dual Tab UI** toggling between `🎟️ Events & Shows` and `📍 Hangout Spots`
- **Aggregation Engine** — Automatically fetches Hackathons and Cultural Fests from **Unstop** and **Devfolio**, plus "Now Playing" movies from **TMDB**.
- Crowdsourced events (Concerts, Standups, College Fests, Parties) added by the community.
- College-aware spot discovery using Overpass API
- Upvote (🔥) / Downvote (👎) voting system synced with Discord
- Modern, dynamic styling with glassmorphism event cards

### 👥 Social & Profiles
- Follow friends, track their bunk activity
- **Attendance heatmap on friend profiles** — see their year at a glance
- Public/private profile toggle
- Bunk titles: Rookie 🌱 → Bunk Legend 👑
- Achievements system
- Account management with Delete Account option

### 📋 Tasks & Productivity
- Create tasks with **subtasks/checklists** — nested checkboxes with progress bars
- **📌 Pin** important tasks to the top of the list
- **🔍 Search & Sort** — filter by title or tag, sort by due date, priority, or newest
- **🏷️ Color-coded tags** — auto-assigned consistent colors per tag for quick scanning
- **📅 Calendar View** — toggle to a monthly grid with dot indicators per day
- **🎯 Daily Goal** — "Complete X tasks today" with configurable target and ring chart
- **🤝 Shared Tasks** — search and add collaborators, see stacked avatars on task cards
- **⏰ Due Date Reminders** — browser push notification when due within 1 hour
- Focus mode with built-in **Pomodoro Timer** (25min work / 5min break)
- Synced with Discord bot (`/tasks` `/addtask` `/donetask`)

### 🔔 Notifications
- Push Notifications for follower alerts and bunk invites
- Mass bunk cascade alerts
- Bunk Together result feedback (shows which classes were bunked)
- In-app slide-out notification panel

### 🛡️ Privacy & Security
- Terms & Conditions + Privacy Policy
- Full data ownership with deletion options
- Minimal data collection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI** | React 19, Vanilla CSS with CSS Variables |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) (Mongoose) |
| **Auth** | [Auth.js v5](https://authjs.dev/) (Google + Discord OAuth) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
src/
├── app/                # Next.js App Router pages & API
│   ├── api/            # REST API routes
│   │   ├── attendance/ # Mark, fetch attendance
│   │   ├── notifications/ # Mass bunk, follow alerts, bunk together
│   │   ├── spots/      # CRUD + voting
│   │   └── users/      # Profile, social
│   ├── attendance/     # Attendance dashboard + heatmap
│   ├── spots/          # Spots discovery page
│   ├── profile/        # User profile + friend profiles with heatmap
│   ├── syllabus/       # SyllabusX integration
│   ├── tasks/          # Task management + Pomodoro
│   ├── docs/           # Documentation page
│   ├── privacy/        # Privacy policy
│   └── terms/          # Terms & conditions
├── components/         # Reusable UI components
│   ├── AttendanceHeatmap.js  # GitHub-style contribution graph
│   ├── NotificationPanel.js  # Slide-out notifications
│   └── ...
├── lib/                # Utilities & DB
│   ├── data/           # Static data (excuses, timetable, colleges)
│   └── models/         # Mongoose schemas
└── models/             # Additional models (Spot, Notification)
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
cd chillperiod-web
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
DISCORD_CLIENT_ID=your_discord_id
DISCORD_CLIENT_SECRET=your_discord_secret
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## 🤝 Contributing

PRs are welcome! Fork → Branch → Commit → PR.

## 📄 License

MIT — see [LICENSE](../LICENSE)

---

*Built with ❤️ by [Tony](https://github.com/DarkModeTony)*
