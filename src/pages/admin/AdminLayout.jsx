import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
 
export default function AdminLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());
 
  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
 
  // Format tanggal WIB
  const formattedDate = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
 
  // Format jam WIB
  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
    hour12: false,
  });
 
  const navLinks = [
    {
      key: "informasi",
      label: "Informasi Wisata",
      icon: "fa-solid fa-mountain-sun",
      path: "/admin/",
    },
    {
      key: "tiket",
      label: "Kelola Tiket",
      icon: "fa-solid fa-ticket",
      path: "/admin/kelola-tiket",
    },
  ];
 
  const isActive = (path) => location.pathname === path;
 
  // Mock data – ganti dengan props / context saat API siap
  const adminName    = user?.name       || "Admin Wisata";
  const wisataName   = user?.wisata     || "Owabong Waterpark";
  const avatarLetter = adminName[0]?.toUpperCase() || "A";
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
 
        :root {
          --teal-50:#eef3fa; --teal-100:#dae2ef; --teal-200:#b8cce3;
          --teal-300:#7aadd3; --teal-400:#5d93c7; --teal-500:#4f83bf;
          --teal-600:#4072af; --teal-700:#35609a; --teal-800:#284d83;
          --teal-900:#1e3c6d; --teal-950:#102d4d;
          --gold:#d4a853; --cream:#f9f7f8; --dark:#102d4d;
          --text-dark:#102d4d; --text-muted:#4d6888; --border:#dae2ef;
          --font-display:'Playfair Display',Georgia,serif;
          --font-body:'DM Sans',sans-serif;
          --radius-sm:8px; --radius-md:16px; --radius-lg:24px;
          --shadow-sm:0 2px 8px rgba(64,114,175,.08);
          --shadow-md:0 8px 32px rgba(64,114,175,.12);
          --shadow-lg:0 20px 60px rgba(64,114,175,.16);
          --transition:all .3s cubic-bezier(.4,0,.2,1);
          --sidebar-w: 260px;
          --sidebar-w-collapsed: 72px;
          --topbar-h: 64px;
        }
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-body); background: var(--cream); color: var(--text-dark); }
 
        /* ── LAYOUT SHELL ── */
        .adm-shell {
          display: flex;
          min-height: 100vh;
        }
 
        /* ══════════════════════════════════
           SIDEBAR
        ══════════════════════════════════ */
        .adm-sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: var(--sidebar-w);
          background: linear-gradient(180deg, var(--teal-900) 0%, var(--teal-950) 100%);
          display: flex;
          flex-direction: column;
          z-index: 300;
          transition: width .3s cubic-bezier(.4,0,.2,1);
          // overflow: hidden;
          
        }
        .adm-sidebar.collapsed { width: var(--sidebar-w-collapsed); }
 
        /* ── Toggle button – posisi mepet tepi kanan sidebar, tidak overlap topbar ── */
        .adm-toggle {
          position: absolute;
          /* turunkan cukup agar tidak masuk area topbar */
          top: calc(var(--topbar-h) / 3.5);
          right: -13px;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: var(--teal-600);
          border: 2px solid white;
          color: white;
          font-size: 10px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
          transition: var(--transition);
          box-shadow: 0 2px 8px rgba(0,0,0,.25);
        }
        .adm-toggle:hover { background: var(--teal-500); transform: scale(1.1); }
 
        /* ── Profile area ── */
        .adm-profile {
          /* beri padding-top agar tidak tertindih topbar */
          padding: calc(var(--topbar-h) + 20px) 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .adm-avatar {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--teal-400), var(--teal-600));
          border: 3px solid rgba(255,255,255,.2);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display);
          font-size: 22px; font-weight: 700; color: white;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,.3);
          transition: var(--transition);
        }
        .adm-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .adm-avatar:hover { transform: scale(1.05); border-color: var(--teal-300); }
 
        /* Collapsed → avatar tetap terlihat */
        .adm-sidebar.collapsed .adm-profile {
          padding-top: calc(var(--topbar-h) + 16px);
          padding-bottom: 16px;
        }
 
        .adm-profile-info {
          text-align: center;
          overflow: hidden;
          transition: opacity .2s, max-height .3s;
          max-height: 120px;
          opacity: 1;
          white-space: nowrap;
          width: 100%;
        }
        .adm-sidebar.collapsed .adm-profile-info {
          opacity: 0;
          max-height: 0;
          pointer-events: none;
        }
        .adm-profile-name {
          font-family: var(--font-display);
          font-size: 15px; font-weight: 700;
          color: white;
          margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .adm-profile-role {
          font-size: 10px; font-weight: 700;
          letter-spacing: 1.8px; text-transform: uppercase;
          color: var(--teal-300);
          margin-bottom: 2px;
        }
        .adm-profile-wisata {
          font-size: 10px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--gold);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 200px;
          margin: 0 auto;
        }
        .adm-profile-badge {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px; padding: 3px 10px;
          border-radius: 50px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          font-size: 11px; color: rgba(255,255,255,.6);
        }
 
        /* Divider */
        .adm-divider {
          margin: 0 16px;
          height: 1px;
          background: rgba(255,255,255,.07);
          flex-shrink: 0;
        }
 
        /* ── Nav ── */
        .adm-nav {
          flex: 1;
          padding: 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .adm-nav-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: rgba(255,255,255,.3);
          padding: 8px 10px 6px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity .2s;
        }
        .adm-sidebar.collapsed .adm-nav-label { opacity: 0; }
 
        .adm-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: var(--radius-sm);
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,.65);
          text-decoration: none;
          transition: var(--transition);
          white-space: nowrap;
          overflow: hidden;
          position: relative;
        }
        .adm-nav-link i {
          width: 20px;
          text-align: center;
          font-size: 15px;
          flex-shrink: 0;
          transition: var(--transition);
        }
        .adm-nav-link span {
          overflow: hidden;
          transition: opacity .2s, max-width .3s;
          max-width: 200px;
          opacity: 1;
        }
        .adm-sidebar.collapsed .adm-nav-link span {
          opacity: 0;
          max-width: 0;
        }
        .adm-nav-link:hover {
          background: rgba(255,255,255,.08);
          color: white;
        }
        .adm-nav-link.active {
          background: rgba(93,147,199,.2);
          color: var(--teal-300);
          font-weight: 600;
          border-left: 3px solid var(--teal-400);
          padding-left: 9px;
        }
        .adm-nav-link.active i { color: var(--teal-300); }
 
        .adm-sidebar.collapsed .adm-nav-link {
          justify-content: center;
          padding: 12px;
        }
        .adm-sidebar.collapsed .adm-nav-link.active {
          border-left: none;
          border-bottom: 2px solid var(--teal-400);
        }
 
        /* ── Sidebar footer / logout ── */
        .adm-sidebar-footer {
          padding: 14px 10px;
          border-top: 1px solid rgba(255,255,255,.07);
          flex-shrink: 0;
        }
        .adm-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.45);
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: var(--transition);
          white-space: nowrap;
          overflow: hidden;
          font-family: var(--font-body);
        }
        .adm-logout-btn i { width: 20px; text-align: center; font-size: 14px; flex-shrink: 0; }
        .adm-logout-btn span { transition: opacity .2s, max-width .3s; max-width: 200px; opacity: 1; }
        .adm-sidebar.collapsed .adm-logout-btn { justify-content: center; }
        .adm-sidebar.collapsed .adm-logout-btn span { opacity: 0; max-width: 0; }
        .adm-logout-btn:hover { background: rgba(239,68,68,.12); color: #fca5a5; }
 
        /* ══════════════════════════════════
           TOPBAR  – fixed di atas, z lebih tinggi
        ══════════════════════════════════ */
        .adm-topbar {
          position: fixed;
          top: 0;
          /* mulai dari kanan sidebar agar tidak nutup toggle */
          left: var(--sidebar-w);
          right: 0;
          height: var(--topbar-h);
          z-index: 200;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 0 28px;
          display: flex;
          align-items: center;
          /* brand di kiri, identity di kanan */
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
          transition: left .3s cubic-bezier(.4,0,.2,1);
        }
        .adm-topbar.collapsed { left: var(--sidebar-w-collapsed); }
 
        /* Kiri: bisa diisi breadcrumb / kosong */
        .adm-topbar-left {
          display: flex; align-items: center; gap: 10px;
        }
 
        /* Kanan: identitas admin + kota */
        .adm-topbar-right {
          display: flex; align-items: center; gap: 18px;
        }
 
        /* Divider vertikal tipis */
        .adm-topbar-sep {
          width: 1px; height: 32px;
          background: var(--border);
          flex-shrink: 0;
        }
 
        /* Brand block (kanan) */
        .adm-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .adm-brand-text {
          text-align: right;
        }
        .adm-brand-row1 {
          font-size: 11px; font-weight: 600;
          color: var(--text-muted);
          letter-spacing: .3px;
        }
        .adm-brand-row2 {
          font-family: var(--font-display);
          font-size: 16px; font-weight: 700;
          color: var(--dark);
          line-height: 1.1;
        }
        .adm-brand-row3 {
          font-size: 10.5px;
          color: var(--text-muted);
          margin-top: 1px;
          display: flex; align-items: center; gap: 5px;
          justify-content: flex-end;
        }
        .adm-brand-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--teal-500), var(--teal-800));
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 16px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(64,114,175,.25);
        }
 
        /* ══════════════════════════════════
           MAIN CONTENT
        ══════════════════════════════════ */
        .adm-main {
          margin-left: var(--sidebar-w);
          padding-top: var(--topbar-h);
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left .3s cubic-bezier(.4,0,.2,1);
          min-width: 0;
        }
        .adm-main.collapsed { margin-left: var(--sidebar-w-collapsed); }
 
        .adm-content {
          flex: 1;
          padding: 32px;
          background: var(--cream);
        }
 
        /* ══════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════ */
        @media (max-width: 768px) {
          .adm-sidebar { width: 260px; transform: translateX(-100%); }
          .adm-sidebar.mobile-open { transform: translateX(0); }
          .adm-main { margin-left: 0 !important; }
          .adm-topbar { left: 0 !important; padding: 0 16px; }
          .adm-content { padding: 20px 16px; }
          .adm-brand-row2 { font-size: 14px; }
        }
      `}</style>

      <div className="adm-shell">
        {/* ── SIDEBAR ── */}
        <aside className={`adm-sidebar${collapsed ? " collapsed" : ""}`}>
          {/* Toggle */}
          <button className="adm-toggle" onClick={() => setCollapsed(!collapsed)}>
            <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} />
          </button>

          {/* Profile */}
          <div className="adm-profile">
            <div className="adm-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} />
              ) : (
                (user?.name?.[0] || "A").toUpperCase()
              )}
            </div>
            <div className="adm-profile-info">
              <div className="adm-profile-name">{user?.name || "Admin Wisata"}</div>
              <div className="adm-profile-role">Staff Wisata</div>
              <div className="adm-profile-badge">
                <i className="fa-solid fa-circle" style={{ fontSize: 6, color: "#4ade80" }} />
                Online
              </div>
            </div>
          </div>

          <div className="adm-divider" />

          {/* Nav Links */}
          <nav className="adm-nav">
            <div className="adm-nav-label">Menu Utama</div>
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                className={`adm-nav-link${isActive(link.path) ? " active" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <i className={link.icon} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer / Logout */}
          <div className="adm-sidebar-footer">
            <button
              className="adm-logout-btn"
              onClick={() => navigate("/admin/login")}
              title={collapsed ? "Keluar" : undefined}
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* ══════ TOPBAR ══════ */}
          <header className={`adm-topbar${collapsed ? " collapsed" : ""}`}>
            {/* Kiri – bisa diisi breadcrumb di masa depan */}
            <div className="adm-topbar-left">
              {/* kosong atau breadcrumb */}
            </div>
  
            {/* Kanan – identitas kota + waktu */}
            <div className="adm-topbar-right">
              <div className="adm-brand">
                <div className="adm-brand-text">
                  <div className="adm-brand-row2">Purbalingga Smart City</div>
                  <div className="adm-brand-row3">
                    <i className="fa-regular fa-clock" style={{ fontSize: 10 }} />
                    {formattedDate} &nbsp;·&nbsp; {formattedTime} WIB
                  </div>
                </div>
                <div className="adm-brand-icon">
                  <i className="fa-solid fa-city" />
                </div>
              </div>
            </div>
          </header>
  
          {/* ══════ MAIN ══════ */}
          <div className={`adm-main${collapsed ? " collapsed" : ""}`}>
            <main className="adm-content">
              {children}
            </main>
          </div>
        </div>
    </>
  );
}