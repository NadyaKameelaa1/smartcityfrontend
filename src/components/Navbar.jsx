// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { label: 'Beranda',    href: '/#home',       icon: 'fa-home' },
    { label: 'Profil',     href: '/#profil',     icon: 'fa-city',
      dropdown: [
          { label: 'Tentang Purbalingga', href: '/#profil', icon: 'fa-info-circle' },
        //   { label: 'Sejarah',             href: '/#profil', icon: 'fa-scroll' },
        //   { label: 'Visi & Misi',         href: '/#profil', icon: 'fa-bullseye' },
          { label: 'Profil Pejabat',      href: '/pejabat', icon: 'fa-user-tie' },
      ]
    },
    { label: 'Wisata',     href: '/wisata',     icon: 'fa-mountain'},
    { label: 'Berita',     href: '/berita',      icon: 'fa-newspaper' },
    { label: 'Pelayanan',  href: '/pelayanan',  icon: 'fa-hands-helping' },
    { label: 'Event',      href: '/event',      icon: 'fa-calendar-alt' },
    { label: 'Pengumuman', href: '/pengumuman',  icon: 'fa-bullhorn' },
    { label: 'Peta',       href: '/peta',        icon: 'fa-map-marked-alt' },
];

// Ganti dengan nama user dari context/auth state kamu
const DUMMY_USER = { nama: 'Nadya Kameela', loggedIn: true };

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Navbar() {
    const [scrolled,      setScrolled]      = useState(false);
    const [mobileOpen,    setMobileOpen]    = useState(false);
    const [searchOpen,    setSearchOpen]    = useState(false);
    const [searchVal,     setSearchVal]     = useState('');
    const [userMenuOpen,  setUserMenuOpen]  = useState(false);
    const location = useLocation();

    const user = DUMMY_USER; // ganti dengan useAuth() / useContext dll.

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setMobileOpen(false);
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Tutup user menu kalau klik di luar
    useEffect(() => {
        if (!userMenuOpen) return;
        const handler = (e) => {
            if (!e.target.closest('.user-menu-wrap')) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [userMenuOpen]);

    const handleSearch = () => {
        if (!searchVal.trim()) return;
        window.location.href = `/search?q=${encodeURIComponent(searchVal)}`;
        setSearchOpen(false);
        setSearchVal('');
    };

    const handleAnchorClick = (e, href) => {
        if (href.startsWith('/#')) {
            e.preventDefault();
            const id = href.replace('/#', '');
            if (location.pathname !== '/') {
                window.location.href = href;
                return;
            }
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setMobileOpen(false);
    };

    return (
        <>
            <style>{`
                /* ── User avatar button ── */
                .user-menu-wrap {
                    position: relative;
                }
                .user-avatar-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px 4px 4px;
                    border-radius: 50px;
                    border: 1.5px solid var(--border);
                    background: white;
                    cursor: pointer;
                    transition: var(--transition);
                    font-family: var(--font-body);
                }
                .user-avatar-btn:hover {
                    border-color: var(--teal-400);
                    box-shadow: 0 2px 12px rgba(64,114,175,.12);
                }
                .user-avatar-circle {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--teal-600), var(--teal-800));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-display);
                    font-size: 11px;
                    font-weight: 700;
                    color: white;
                    letter-spacing: 1px;
                    flex-shrink: 0;
                }
                .user-avatar-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--dark);
                    max-width: 90px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .user-avatar-btn .fa-chevron-down {
                    font-size: 9px;
                    color: var(--text-muted);
                    transition: transform .2s;
                }
                .user-avatar-btn.open .fa-chevron-down {
                    transform: rotate(180deg);
                }

                /* ── User dropdown ── */
                .user-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    width: 220px;
                    background: white;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border);
                    padding: 8px;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-8px);
                    transition: all .25s cubic-bezier(.4,0,.2,1);
                    z-index: 200;
                }
                .user-dropdown.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .user-dropdown-header {
                    padding: 10px 12px 12px;
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 6px;
                }
                .user-dropdown-name {
                    font-weight: 700;
                    font-size: 14px;
                    color: var(--dark);
                    margin-bottom: 2px;
                }
                .user-dropdown-email {
                    font-size: 11.5px;
                    color: var(--text-muted);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .user-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 13.5px;
                    color: var(--text-dark);
                    transition: var(--transition);
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    background: none;
                    width: 100%;
                    font-family: var(--font-body);
                }
                .user-dropdown-item:hover {
                    background: var(--teal-50);
                    color: var(--teal-700);
                }
                .user-dropdown-item i {
                    width: 16px;
                    color: var(--teal-500);
                    font-size: 13px;
                }
                .user-dropdown-sep {
                    height: 1px;
                    background: var(--border);
                    margin: 6px 0;
                }
                .user-dropdown-item.logout {
                    color: #b91c1c;
                }
                .user-dropdown-item.logout i {
                    color: #ef4444;
                }
                .user-dropdown-item.logout:hover {
                    background: #fef2f2;
                    color: #991b1b;
                }

                /* ── Login button (jika belum login) ── */
                .btn-login {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 18px;
                    border-radius: 50px;
                    background: var(--teal-600);
                    color: white;
                    font-family: var(--font-body);
                    font-size: 13px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                    text-decoration: none;
                }
                .btn-login:hover {
                    background: var(--teal-700);
                    transform: translateY(-1px);
                }
            `}</style>

            {/* ── NAVBAR ── */}
            <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        {/* Logo */}
                        <Link to="/#home" className="navbar-logo">
                            <div className="logo-emblem">
                                <i className="fas fa-city" />
                            </div>
                            <div className="logo-text-group">
                                <span className="logo-title">Purbalingga</span>
                                <span className="logo-subtitle">Smart City</span>
                            </div>
                        </Link>

                        {/* Desktop Menu */}
                        <ul className="navbar-menu">
                            {navLinks.map((link) => (
                                <li className="nav-item" key={link.label}>
                                    {link.dropdown ? (
                                        <>
                                            <span className="nav-link">
                                                {link.label}
                                                <i className="fas fa-chevron-down" />
                                            </span>
                                            <div className="dropdown-menu">
                                                {link.dropdown.map((d) => (
                                                    <Link
                                                        key={d.label}
                                                        to={d.href}
                                                        className="dropdown-item"
                                                        onClick={(e) => handleAnchorClick(e, d.href)}
                                                    >
                                                        <i className={`fas ${d.icon}`} />
                                                        {d.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <Link
                                            to={link.href}
                                            className={`nav-link${location.pathname === link.href ? ' active' : ''}`}
                                            onClick={(e) => handleAnchorClick(e, link.href)}
                                        >
                                            <i className={`fas ${link.icon}`} style={{ fontSize: 12 }} />
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Actions */}
                        <div className="navbar-actions">

                            {/* User menu / Login */}
                            {user.loggedIn ? (
                                <div className="user-menu-wrap">
                                    <button
                                        className={`user-avatar-btn${userMenuOpen ? ' open' : ''}`}
                                        onClick={() => setUserMenuOpen((v) => !v)}
                                        aria-label="Menu akun"
                                    >
                                        <div className="user-avatar-circle">
                                            {getInitials(user.nama)}
                                        </div>
                                        <span className="user-avatar-name">{user.nama.split(' ')[0]}</span>
                                        <i className="fas fa-chevron-down" />
                                    </button>

                                    <div className={`user-dropdown${userMenuOpen ? ' open' : ''}`}>
                                        <div className="user-dropdown-header">
                                            <div className="user-dropdown-name">{user.nama}</div>
                                            <div className="user-dropdown-email">nadya.kameela@gmail.com</div>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="user-dropdown-item"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <i className="fas fa-user-circle" /> Profil Saya
                                        </Link>
                                        <Link
                                            to="/riwayat"
                                            className="user-dropdown-item"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <i className="fas fa-ticket-alt" /> Riwayat Tiket
                                        </Link>
                                        {/* <Link
                                            to="/pengumuman"
                                            className="user-dropdown-item"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <i className="fas fa-bell" /> Notifikasi
                                        </Link> */}
                                        <div className="user-dropdown-sep" />
                                        <button
                                            className="user-dropdown-item logout"
                                            onClick={() => { setUserMenuOpen(false); /* handle logout */ }}
                                        >
                                            <i className="fas fa-sign-out-alt" /> Keluar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="btn-login">
                                    <i className="fas fa-sign-in-alt" /> Masuk
                                </Link>
                            )}

                            {/* Hamburger */}
                            <button
                                className="hamburger"
                                id="hamburger"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Menu"
                            >
                                <span /><span /><span />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── SEARCH OVERLAY ── */}
            <div
                className={`search-overlay${searchOpen ? ' active' : ''}`}
                id="searchOverlay"
                onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
            >
                <button className="search-close" onClick={() => setSearchOpen(false)}>
                    <i className="fas fa-times" />
                </button>
                <div className="search-overlay-inner">
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-box-input"
                            placeholder="Cari informasi Purbalingga..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            autoFocus={searchOpen}
                        />
                    </div>
                    <div className="search-categories">
                        {['Semua', 'Wisata', 'Berita', 'Event', 'Pelayanan', 'Pengumuman'].map((k) => (
                            <span key={k} className="search-cat-tag">{k}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MOBILE MENU ── */}
            <div
                className={`mobile-menu${mobileOpen ? ' active' : ''}`}
                id="mobileMenu"
                onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
            >
                <div className="mobile-menu-panel">
                    {/* User info di mobile */}
                    {user.loggedIn && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '0 0 20px', marginBottom: 20,
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                                color: 'white', letterSpacing: 1, flexShrink: 0
                            }}>
                                {getInitials(user.nama)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>{user.nama}</div>
                                <Link
                                    to="/profile"
                                    style={{ fontSize: 12, color: 'var(--teal-600)', fontWeight: 600 }}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Lihat Profil →
                                </Link>
                            </div>
                        </div>
                    )}

                    <ul className="mobile-nav-links">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                <Link
                                    to={link.href}
                                    onClick={(e) => handleAnchorClick(e, link.href)}
                                >
                                    <i className={`fas ${link.icon}`} />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Logout di mobile */}
                    {user.loggedIn && (
                        <button
                            onClick={() => { setMobileOpen(false); /* handle logout */ }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '14px 0', marginTop: 8,
                                borderTop: '1px solid var(--border)',
                                width: '100%', background: 'none', border: 'none',
                                color: '#b91c1c', fontFamily: 'var(--font-body)',
                                fontSize: 14, fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            <i className="fas fa-sign-out-alt" style={{ width: 20, color: '#ef4444' }} />
                            Keluar dari Akun
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}