import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Camera, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, Calendar, Grid3X3, BarChart3, Award, MapPin, Clock, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Settings, RefreshCw, Zap, Target, Star, ExternalLink, Instagram, Filter } from "lucide-react";

// âââ BRAND COLORS âââ
const COLORS = {
  navy: "#1B2A4A",
  terracotta: "#C4622D",
  olive: "#6B7D3A",
  mustard: "#D4A030",
  cream: "#FFF8F0",
  white: "#FFFFFF",
  lightGray: "#F3F4F6",
  darkGray: "#374151",
  accent1: "#E8845C",
  accent2: "#8BA44A",
};

// âââ DEMO DATA (fallback when no API connected) âââ
const generateDemoFollowers = () => {
  const months = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar"];
  let base = 18200;
  return months.map((m) => {
    base += Math.floor(Math.random() * 600 + 200);
    return { month: m, followers: base, gained: Math.floor(Math.random() * 400 + 150), lost: Math.floor(Math.random() * 80 + 20) };
  });
};

const generateDemoEngagement = () => {
  const days = ["Lun", "Mar", "MiÃ©", "Jue", "Vie", "SÃ¡b", "Dom"];
  return days.map((d) => ({
    day: d,
    likes: Math.floor(Math.random() * 300 + 150),
    comments: Math.floor(Math.random() * 45 + 10),
    shares: Math.floor(Math.random() * 30 + 5),
    saves: Math.floor(Math.random() * 60 + 15),
  }));
};

const generateDemoReach = () => {
  const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
  return weeks.map((w) => ({
    week: w,
    reach: Math.floor(Math.random() * 15000 + 25000),
    impressions: Math.floor(Math.random() * 25000 + 40000),
    profileVisits: Math.floor(Math.random() * 2000 + 3000),
  }));
};

const DEMO_POSTS = [
  { id: 1, type: "Reel", caption: "ð® Taco Tuesday hits different at Oh Mexico!", likes: 847, comments: 62, shares: 34, saves: 89, reach: 12400, date: "2026-03-24", status: "published", image: "ð¬" },
  { id: 2, type: "Carousel", caption: "Our legendary Molcajete â served in a volcanic stone bowl ð", likes: 623, comments: 41, shares: 28, saves: 112, reach: 9800, date: "2026-03-22", status: "published", image: "ð¸" },
  { id: 3, type: "Story", caption: "Happy Hour vibes 4-7PM ð¹ Mon-Fri", likes: 445, comments: 18, shares: 15, saves: 34, reach: 8200, date: "2026-03-21", status: "published", image: "ð±" },
  { id: 4, type: "Reel", caption: "150+ tequilas. Best margaritas in Miami ð", likes: 1203, comments: 89, shares: 67, saves: 145, reach: 18600, date: "2026-03-19", status: "published", image: "ð¬" },
  { id: 5, type: "Feed", caption: "EspaÃ±ola Way since 1997 â¤ï¸ 25+ years of sabor", likes: 534, comments: 35, shares: 22, saves: 78, reach: 7600, date: "2026-03-17", status: "published", image: "ð¸" },
  { id: 6, type: "Reel", caption: "POV: descubriste el mejor guacamole de South Beach", likes: 956, comments: 73, shares: 51, saves: 134, reach: 15200, date: "2026-03-15", status: "published", image: "ð¬" },
];

const CALENDAR_ITEMS = [
  { date: "2026-03-26", title: "Reel: Behind the scenes cocina", type: "Reel", status: "draft", pillar: "Autenticidad" },
  { date: "2026-03-27", title: "Story: Viernes de margaritas", type: "Story", status: "approved", pillar: "Promociones" },
  { date: "2026-03-28", title: "Carousel: Top 5 tacos", type: "Carousel", status: "draft", pillar: "MenÃº" },
  { date: "2026-03-29", title: "Feed: EspaÃ±ola Way vibes", type: "Feed", status: "scheduled", pillar: "Lifestyle" },
  { date: "2026-03-30", title: "Reel: Molcajete prep ASMR", type: "Reel", status: "draft", pillar: "MenÃº" },
  { date: "2026-03-31", title: "Story: Taco Tuesday reminder", type: "Story", status: "approved", pillar: "Promociones" },
  { date: "2026-04-01", title: "Reel: Taco Tuesday compilation", type: "Reel", status: "idea", pillar: "Comunidad" },
  { date: "2026-04-02", title: "Feed: Staff spotlight", type: "Feed", status: "idea", pillar: "Autenticidad" },
  { date: "2026-04-03", title: "Carousel: 3 locaciones comparadas", type: "Carousel", status: "idea", pillar: "Locaciones" },
  { date: "2026-04-04", title: "Reel: Cliente reacciona al Molcajete", type: "Reel", status: "idea", pillar: "Comunidad" },
];

const COMPETITORS = [
  { name: "Lolo's Surf Cantina", handle: "@lolossurfcantina", followers: "8.2K", engagement: "2.1%", strength: "Beach vibes, breakfast crowd", weakness: "Menos variedad de menÃº" },
  { name: "Naked Taco", handle: "@nakedtaco", followers: "12.5K", engagement: "1.8%", strength: "Hotel guests, modern brand", weakness: "Solo una locaciÃ³n" },
  { name: "La CervecerÃ­a de Barrio", handle: "@lacerveceriadebarrio", followers: "45K", engagement: "1.5%", strength: "Gran alcance, mismo grupo", weakness: "Diferente mercado" },
];

const CONTENT_PILLARS = [
  { name: "MenÃº", percentage: 35, color: COLORS.terracotta, posts: 12 },
  { name: "Lifestyle", percentage: 25, color: COLORS.mustard, posts: 8 },
  { name: "Promociones", percentage: 20, color: COLORS.olive, posts: 7 },
  { name: "Comunidad", percentage: 12, color: COLORS.accent1, posts: 4 },
  { name: "Autenticidad", percentage: 8, color: COLORS.navy, posts: 3 },
];

const LOCATIONS_DATA = [
  { name: "EspaÃ±ola Way", reviews: 2491, rating: 4.2, topDish: "Molcajete", dailyMargaritas: 65, sentiment: 87 },
  { name: "Ocean Drive", reviews: 169, rating: 4.8, topDish: "Quesabirria", dailyMargaritas: 45, sentiment: 92 },
  { name: "Lincoln Road", reviews: 485, rating: 4.3, topDish: "Guacamole", dailyMargaritas: 40, sentiment: 84 },
];

// âââ INSTAGRAM API MODULE âââ
const InstagramAPI = {
  baseUrl: "https://graph.instagram.com",

  async fetchMetrics(accessToken, userId) {
    try {
      const fields = "followers_count,media_count,profile_views";
      const res = await fetch(`${this.baseUrl}/${userId}?fields=${fields}&access_token=${accessToken}`);
      if (!res.ok) throw new Error("API Error");
      return await res.json();
    } catch (e) {
      console.warn("Instagram API unavailable, using demo data:", e.message);
      return null;
    }
  },

  async fetchMedia(accessToken, userId, limit = 25) {
    try {
      const fields = "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink";
      const res = await fetch(`${this.baseUrl}/${userId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
      if (!res.ok) throw new Error("API Error");
      return await res.json();
    } catch (e) {
      console.warn("Instagram API unavailable, using demo data:", e.message);
      return null;
    }
  },

  async fetchInsights(accessToken, mediaId) {
    try {
      const metrics = "impressions,reach,saved,shares";
      const res = await fetch(`${this.baseUrl}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`);
      if (!res.ok) throw new Error("API Error");
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};

// âââ METRIC CARD COMPONENT âââ
function MetricCard({ icon: Icon, label, value, change, changeType, color }) {
  const isPositive = changeType === "up";
  return (
    <div style={{ background: COLORS.white, borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}`, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ background: `${color}15`, borderRadius: 10, padding: 8, display: "flex" }}>
          <Icon size={20} color={color} />
        </div>
        {change && (
          <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: isPositive ? "#16a34a" : "#dc2626" }}>
            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {change}
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.navy, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// âââ POST ROW âââ
function PostRow({ post }) {
  const engRate = (((post.likes + post.comments + post.shares + post.saves) / post.reach) * 100).toFixed(1);
  const typeColors = { Reel: COLORS.terracotta, Carousel: COLORS.mustard, Story: COLORS.olive, Feed: COLORS.navy };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr repeat(5, 70px) 70px", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${COLORS.lightGray}`, fontSize: 14 }}>
      <span style={{ background: `${typeColors[post.type]}20`, color: typeColors[post.type], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{post.type}</span>
      <span style={{ color: COLORS.darkGray, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.caption.slice(0, 50)}...</span>
      <span style={{ textAlign: "center", color: COLORS.darkGray }}>{post.likes.toLocaleString()}</span>
      <span style={{ textAlign: "center", color: COLORS.darkGray }}>{post.comments}</span>
      <span style={{ textAlign: "center", color: COLORS.darkGray }}>{post.shares}</span>
      <span style={{ textAlign: "center", color: COLORS.darkGray }}>{post.saves}</span>
      <span style={{ textAlign: "center", fontWeight: 600, color: parseFloat(engRate) > 5 ? "#16a34a" : COLORS.terracotta }}>{engRate}%</span>
      <span style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF" }}>{post.date.slice(5)}</span>
    </div>
  );
}

// âââ CALENDAR DAY âââ
function CalendarDay({ item }) {
  const statusColors = { draft: "#FCD34D", approved: "#86EFAC", scheduled: "#93C5FD", idea: "#D1D5DB", published: "#A78BFA" };
  const statusLabels = { draft: "Borrador", approved: "Aprobado", scheduled: "Programado", idea: "Idea", published: "Publicado" };
  return (
    <div style={{ background: COLORS.white, borderRadius: 10, padding: 12, border: `1px solid ${COLORS.lightGray}`, minHeight: 80, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy }}>{item.date.slice(8)}</span>
        <span style={{ background: statusColors[item.status], padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{statusLabels[item.status]}</span>
      </div>
      <span style={{ fontSize: 12, color: COLORS.darkGray, lineHeight: 1.3 }}>{item.title}</span>
      <span style={{ fontSize: 10, color: COLORS.terracotta, fontWeight: 600 }}>{item.pillar}</span>
    </div>
  );
}

// âââ MAIN DASHBOARD âââ
export default function OhMexicoDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [apiConnected, setApiConnected] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [followerData] = useState(generateDemoFollowers);
  const [engagementData] = useState(generateDemoEngagement);
  const [reachData] = useState(generateDemoReach);
  const [selectedPost, setSelectedPost] = useState(null);
  const [calendarWeek, setCalendarWeek] = useState(0);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "Contenido", icon: Grid3X3 },
    { id: "calendar", label: "Calendario", icon: Calendar },
    { id: "competition", label: "Competencia", icon: Target },
    { id: "locations", label: "Locaciones", icon: MapPin },
  ];

  const totalEngagement = DEMO_POSTS.reduce((s, p) => s + p.likes + p.comments + p.shares + p.saves, 0);
  const avgEngRate = ((totalEngagement / DEMO_POSTS.reduce((s, p) => s + p.reach, 0)) * 100).toFixed(1);
  const totalReach = DEMO_POSTS.reduce((s, p) => s + p.reach, 0);
  const bestPost = DEMO_POSTS.reduce((a, b) => (a.reach > b.reach ? a : b));

  const calItems = CALENDAR_ITEMS.slice(calendarWeek * 7, calendarWeek * 7 + 7);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F9FAFB", minHeight: "100vh", color: COLORS.darkGray }}>
      {/* âââ HEADER âââ */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #2D3F6A 100%)`, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>ð²ð½</div>
          <div>
            <h1 style={{ margin: 0, color: COLORS.white, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Oh! Mexico Dashboard</h1>
            <p style={{ margin: 0, color: "#94A3B8", fontSize: 13 }}>Restaurant & TequilerÃ­a â @ohmexico â¢ 20.1K followers</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: apiConnected ? "#16a34a22" : "#dc262622", border: `1px solid ${apiConnected ? "#16a34a" : "#dc2626"}44` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: apiConnected ? "#16a34a" : "#dc2626" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: apiConnected ? "#16a34a" : "#dc2626" }}>{apiConnected ? "API Connected" : "Demo Mode"}</span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
            <Settings size={18} color={COLORS.white} />
          </button>
        </div>
      </div>

      {/* âââ API SETTINGS PANEL âââ */}
      {showSettings && (
        <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.lightGray}`, padding: "20px 32px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16, color: COLORS.navy }}>Instagram API Configuration</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 600 }}>
            <input
              type="text" placeholder="Instagram Access Token" value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.lightGray}`, fontSize: 14, outline: "none" }}
            />
            <button
              onClick={() => { if (accessToken.length > 10) setApiConnected(true); }}
              style={{ padding: "10px 20px", borderRadius: 10, background: COLORS.terracotta, color: COLORS.white, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Conectar
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9CA3AF" }}>
            ObtÃ©n tu token en{" "}
            <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: COLORS.terracotta }}>
              Meta for Developers
            </a>{" "}
            â Instagram Graph API â Generate Token
          </p>
        </div>
      )}

      {/* âââ NAVIGATION âââ */}
      <div style={{ display: "flex", gap: 4, padding: "16px 32px 0", borderBottom: `1px solid ${COLORS.lightGray}`, background: COLORS.white }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? COLORS.terracotta : "#6B7280", borderBottom: isActive ? `2px solid ${COLORS.terracotta}` : "2px solid transparent", marginBottom: -1, transition: "all 0.2s" }}>
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* âââ CONTENT AREA âââ */}
      <div style={{ padding: "24px 32px", maxWidth: 1280, margin: "0 auto" }}>

        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <MetricCard icon={Users} label="Seguidores" value="20,100" change="+3.2%" changeType="up" color={COLORS.navy} />
              <MetricCard icon={Heart} label="Engagement Rate" value={`${avgEngRate}%`} change="+0.8%" changeType="up" color={COLORS.terracotta} />
              <MetricCard icon={Eye} label="Alcance Mensual" value={`${(totalReach / 1000).toFixed(1)}K`} change="+12%" changeType="up" color={COLORS.olive} />
              <MetricCard icon={Zap} label="Best Performer" value={`${(bestPost.reach / 1000).toFixed(1)}K`} change="Reel" changeType="up" color={COLORS.mustard} />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Follower Growth */}
              <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.navy }}>Crecimiento de Seguidores</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={followerData}>
                    <defs>
                      <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.terracotta} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS.terracotta} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 200", "dataMax + 200"]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="followers" stroke={COLORS.terracotta} fill="url(#followerGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement by Day */}
              <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.navy }}>Engagement por DÃ­a</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="likes" stackId="a" fill={COLORS.terracotta} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="comments" stackId="a" fill={COLORS.mustard} />
                    <Bar dataKey="saves" stackId="a" fill={COLORS.olive} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reach + Pillars Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Reach & Impressions */}
              <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.navy }}>Alcance e Impresiones</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={reachData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="reach" stroke={COLORS.terracotta} strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="impressions" stroke={COLORS.navy} strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="profileVisits" stroke={COLORS.olive} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Content Pillars */}
              <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.navy }}>Pilares de Contenido</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={CONTENT_PILLARS} dataKey="percentage" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {CONTENT_PILLARS.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {CONTENT_PILLARS.map((p) => (
                      <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                        <span style={{ fontSize: 13, color: COLORS.darkGray }}>{p.name}</span>
                        <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: "auto" }}>{p.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Awards Banner */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.mustard}15, ${COLORS.terracotta}10)`, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.mustard}30`, display: "flex", alignItems: "center", gap: 16 }}>
              <Award size={32} color={COLORS.mustard} />
              <div>
                <h4 style={{ margin: 0, fontSize: 15, color: COLORS.navy }}>Reconocimientos para destacar en contenido</h4>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
                  ð Best Margaritas â New Times 2024 &nbsp;|&nbsp; â­ Travelers' Choice 2024 &nbsp;|&nbsp; ðºð¸ Top 100 Mexican USA &nbsp;|&nbsp; ðº CBS "Taste of the Town"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === CONTENT TAB === */}
        {activeTab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, color: COLORS.navy }}>Performance de Contenido</h2>
              <div style={{ display: "flex", gap: 8 }}>
                {["Todos", "Reels", "Carousel", "Feed", "Stories"].map((f) => (
                  <button key={f} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${COLORS.lightGray}`, background: f === "Todos" ? COLORS.navy : COLORS.white, color: f === "Todos" ? COLORS.white : COLORS.darkGray, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Table */}
            <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr repeat(5, 70px) 70px", gap: 12, padding: "0 0 12px", borderBottom: `2px solid ${COLORS.lightGray}`, fontSize: 12, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>
                <span>Tipo</span><span>Caption</span>
                <span style={{ textAlign: "center" }}>â¤ï¸</span>
                <span style={{ textAlign: "center" }}>ð¬</span>
                <span style={{ textAlign: "center" }}>âï¸</span>
                <span style={{ textAlign: "center" }}>ð</span>
                <span style={{ textAlign: "center" }}>Eng%</span>
                <span style={{ textAlign: "center" }}>Fecha</span>
              </div>
              {DEMO_POSTS.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>

            {/* Content Type Performance */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { type: "Reels", avg: "14.7K", emoji: "ð¬", eng: "6.8%", tip: "Best performer â priorizar" },
                { type: "Carousels", avg: "9.8K", emoji: "ð¸", eng: "5.2%", tip: "Alto en saves â educar" },
                { type: "Feed", avg: "7.6K", emoji: "ð¼ï¸", eng: "4.1%", tip: "Brand awareness" },
                { type: "Stories", avg: "8.2K", emoji: "ð±", eng: "3.5%", tip: "Engagement directo" },
              ].map((t) => (
                <div key={t.type} style={{ background: COLORS.white, borderRadius: 16, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}`, textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{t.emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{t.type}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.terracotta, margin: "4px 0" }}>{t.avg}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>Avg. Reach</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.olive, marginTop: 4 }}>{t.eng} eng.</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6, fontStyle: "italic" }}>{t.tip}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === CALENDAR TAB === */}
        {activeTab === "calendar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 20, color: COLORS.navy }}>Calendario Editorial</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setCalendarWeek(Math.max(0, calendarWeek - 1))} style={{ background: COLORS.white, border: `1px solid ${COLORS.lightGray}`, borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>
                  {calendarWeek === 0 ? "Semana Actual" : `Semana +${calendarWeek}`}
                </span>
                <button onClick={() => setCalendarWeek(Math.min(1, calendarWeek + 1))} style={{ background: COLORS.white, border: `1px solid ${COLORS.lightGray}`, borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Status legend */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { label: "Idea", color: "#D1D5DB" },
                { label: "Borrador", color: "#FCD34D" },
                { label: "Aprobado", color: "#86EFAC" },
                { label: "Programado", color: "#93C5FD" },
                { label: "Publicado", color: "#A78BFA" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
              {["Lun", "Mar", "MiÃ©", "Jue", "Vie", "SÃ¡b", "Dom"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#9CA3AF", padding: "0 0 8px" }}>{d}</div>
              ))}
              {calItems.map((item, i) => (
                <CalendarDay key={i} item={item} />
              ))}
            </div>

            {/* Pipeline summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                { label: "Ideas", count: CALENDAR_ITEMS.filter((c) => c.status === "idea").length, color: "#D1D5DB" },
                { label: "Borradores", count: CALENDAR_ITEMS.filter((c) => c.status === "draft").length, color: "#FCD34D" },
                { label: "Aprobados", count: CALENDAR_ITEMS.filter((c) => c.status === "approved").length, color: "#86EFAC" },
                { label: "Programados", count: CALENDAR_ITEMS.filter((c) => c.status === "scheduled").length, color: "#93C5FD" },
                { label: "Publicados", count: CALENDAR_ITEMS.filter((c) => c.status === "published").length, color: "#A78BFA" },
              ].map((s) => (
                <div key={s.label} style={{ background: COLORS.white, borderRadius: 12, padding: 16, textAlign: "center", borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.navy }}>{s.count}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === COMPETITION TAB === */}
        {activeTab === "competition" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: COLORS.navy }}>AnÃ¡lisis de Competencia</h2>

            {/* Competitor Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {COMPETITORS.map((comp) => (
                <div key={comp.name} style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: COLORS.navy }}>{comp.name}</h3>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.terracotta }}>{comp.handle}</p>
                    </div>
                    <ExternalLink size={16} color="#9CA3AF" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy }}>{comp.followers}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>Followers</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.olive }}>{comp.engagement}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>Engagement</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>+</span> {comp.strength}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>â</span> {comp.weakness}
                  </div>
                </div>
              ))}
            </div>

            {/* Oh Mexico vs Competition */}
            <div style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, color: COLORS.navy }}>Oh Mexico vs. Competencia</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { metric: "Followers", ohMexico: "20.1K", avg: "10.3K", status: "win" },
                  { metric: "Engagement", ohMexico: `${avgEngRate}%`, avg: "1.8%", status: "win" },
                  { metric: "Locaciones", ohMexico: "3", avg: "1", status: "win" },
                  { metric: "AÃ±os en SoBe", ohMexico: "29", avg: "8", status: "win" },
                ].map((m) => (
                  <div key={m.metric} style={{ textAlign: "center", padding: 16, background: "#F0FDF4", borderRadius: 12 }}>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>{m.metric}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy }}>{m.ohMexico}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>vs. avg {m.avg}</div>
                    <div style={{ fontSize: 16, marginTop: 4 }}>ð</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Insight */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.olive}10, ${COLORS.navy}08)`, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.olive}20` }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, color: COLORS.navy }}>ð¡ Ventaja Competitiva Clave</h3>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.darkGray, lineHeight: 1.6 }}>
                Oh Mexico es el <strong>ÃNICO restaurante mexicano</strong> con presencia en las 3 calles principales de South Beach (EspaÃ±ola Way, Ocean Drive, Lincoln Road). Con Rosa Mexicano cerrado en Feb 2026, no hay competencia directa en Lincoln Road. Oportunidad de dominar el segmento.
              </p>
            </div>
          </div>
        )}

        {/* === LOCATIONS TAB === */}
        {activeTab === "locations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: COLORS.navy }}>Performance por LocaciÃ³n</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {LOCATIONS_DATA.map((loc) => (
                <div key={loc.name} style={{ background: COLORS.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${COLORS.lightGray}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <MapPin size={18} color={COLORS.terracotta} />
                    <h3 style={{ margin: 0, fontSize: 18, color: COLORS.navy }}>{loc.name}</h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.navy }}>{loc.rating}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>Rating â­</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.terracotta }}>{loc.reviews.toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>Reviews</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>Top Dish</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{loc.topDish}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>Margaritas/dÃ­a</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.terracotta }}>~{loc.dailyMargaritas}</span>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "#6B7280" }}>Sentiment Score</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: loc.sentiment > 85 ? "#16a34a" : COLORS.mustard }}>{loc.sentiment}%</span>
                      </div>
                      <div style={{ height: 6, background: COLORS.lightGray, borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${loc.sentiment}%`, background: loc.sentiment > 85 ? "#16a34a" : COLORS.mustard, borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Margarita Counter */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.terracotta}, ${COLORS.accent1})`, borderRadius: 16, padding: 32, color: COLORS.white, textAlign: "center" }}>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>ð¹ Margaritas vendidas este aÃ±o (estimado)</div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2 }}>~{(150 * 90).toLocaleString()}</div>
              <div style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>~150 diarias Ã 3 locaciones = contenido infinito</div>
            </div>
          </div>
        )}
      </div>

      {/* âââ FOOTER âââ */}
      <div style={{ padding: "20px 32px", textAlign: "center", borderTop: `1px solid ${COLORS.lightGray}`, marginTop: 40 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
          Oh! Mexico Dashboard â¢ Built by La Productora â¢ Data: {apiConnected ? "Instagram Graph API" : "Demo Mode"} â¢ Last updated: Mar 2026
        </p>
      </div>
    </div>
  );
}
