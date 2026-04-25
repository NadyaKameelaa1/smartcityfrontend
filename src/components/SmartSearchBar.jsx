// src/components/SmartSearchBar.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ─────────────────────────────────────────────────────────────────
// Normalisasi response API → flat index item
// Disesuaikan dengan schema database nyata:
//   wisata:     { id, nama, slug, deskripsi, kategori, thumbnail }
//   berita:     { id, judul, slug, konten, kategori, publisher, thumbnail, published_at }
//   event:      { id, nama, slug, kategori, lokasi, penyelenggara, thumbnail, tanggal_mulai }
//   pengumuman: { id, judul, slug, isi, publisher, tanggal_mulai }
//   pelayanan:  { id, nama, deskripsi, url, icon, kategori }
// ─────────────────────────────────────────────────────────────────
function toIndexItems(type, rawItems) {
    const cfgMap = {
        wisata:     { icon: 'fa-mountain',      color: '#eef3fa', tc: 'var(--teal-700)',  label: 'Wisata' },
        berita:     { icon: 'fa-newspaper',     color: '#fff8e6', tc: '#b45309',          label: 'Berita' },
        event:      { icon: 'fa-calendar-alt',  color: '#f0fdf4', tc: '#16a34a',          label: 'Event' },
        pengumuman: { icon: 'fa-bullhorn',      color: '#fff7ed', tc: '#c2410c',          label: 'Pengumuman' },
        pelayanan:  { icon: 'fa-hands-helping', color: '#faf5ff', tc: '#7c3aed',          label: 'Pelayanan' },
    };
    const cfg = cfgMap[type];

    return rawItems.map((d) => {
        let title, sub, href, keywords;

        switch (type) {
            case 'wisata':
                title    = d.nama;
                sub      = [d.kategori].filter(Boolean).join(' · ');
                href     = null; // navigasi ke /search?cat=wisata&q=...
                keywords = [d.nama, d.deskripsi, d.kategori].filter(Boolean).map((s) => s.toLowerCase());
                break;
            case 'berita':
                title    = d.judul;
                sub      = `Berita · ${d.kategori || ''} · ${d.publisher || ''}`.replace(/·\s*·/g, '·').trim().replace(/·\s*$/, '');
                href     = `/berita/${d.slug || d.id}`;
                keywords = [d.judul, d.konten, d.kategori, d.publisher]
                                .filter(Boolean).map((s) => s.replace(/<[^>]*>/g, '').toLowerCase());
                break;
            case 'event':
                title    = d.nama;
                sub      = [d.kategori, d.lokasi].filter(Boolean).join(' · ');
                href     = null;
                keywords = [d.nama, d.lokasi, d.kategori, d.penyelenggara]
                                .filter(Boolean).map((s) => s.toLowerCase());
                break;
            case 'pengumuman':
                title    = d.judul;
                sub      = `Pengumuman · ${d.publisher || ''}`.replace(/·\s*$/, '');
                href     = `/pengumuman/${d.slug || d.id}`;
                keywords = [d.judul, d.isi, d.publisher]
                                .filter(Boolean).map((s) => s.replace(/<[^>]*>/g, '').toLowerCase());
                break;
            case 'pelayanan':
                title    = d.nama;
                sub      = d.deskripsi || '';
                href     = d.url;
                keywords = [d.nama, d.deskripsi, d.kategori].filter(Boolean).map((s) => s.toLowerCase());
                break;
            default:
                title = d.nama || d.judul || '';
                sub = '';
                href = null;
                keywords = [];
        }

        return {
            id:       `${type}-${d.id}`,
            refId:    d.id,
            type,
            typeLabel: cfg.label,
            icon:     type === 'pelayanan' ? (d.icon || cfg.icon) : cfg.icon,
            color:    cfg.color,
            tc:       cfg.tc,
            title,
            sub,
            href,
            keywords,
        };
    });
}

// ─────────────────────────────────────────────────────────────────
// Unwrap response API: { success, data: [...] } | [...] | { data: { data: [...] } }
// ─────────────────────────────────────────────────────────────────
function unwrap(res) {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    return [];
}

// ─────────────────────────────────────────────────────────────────
// Tracking popularitas via sessionStorage (bukan localStorage karena
// localStorage tidak diperbolehkan di artifacts Claude, tapi di sini
// ini code produksi jadi boleh)
// ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'smartsearch_clicks_v2';
function getClicks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function recordClick(id) {
    const c = getClicks(); c[id] = (c[id] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

// ─────────────────────────────────────────────────────────────────
// Category config (untuk pills & dropdown browse)
// ─────────────────────────────────────────────────────────────────
const CATS = [
    { key: 'semua',      label: 'Semua',       icon: 'fa-th' },
    { key: 'wisata',     label: 'Wisata',       icon: 'fa-mountain' },
    { key: 'berita',     label: 'Berita',       icon: 'fa-newspaper' },
    { key: 'event',      label: 'Event',        icon: 'fa-calendar-alt' },
    { key: 'pelayanan',  label: 'Pelayanan',    icon: 'fa-hands-helping' },
    { key: 'pengumuman', label: 'Pengumuman',   icon: 'fa-bullhorn' },
];

const CAT_META_UI = {
    wisata:     { icon: 'fa-mountain',      color: '#eef3fa', tc: 'var(--teal-700)', label: 'Wisata' },
    berita:     { icon: 'fa-newspaper',     color: '#fff8e6', tc: '#b45309',         label: 'Berita' },
    event:      { icon: 'fa-calendar-alt',  color: '#f0fdf4', tc: '#16a34a',         label: 'Event' },
    pengumuman: { icon: 'fa-bullhorn',      color: '#fff7ed', tc: '#c2410c',         label: 'Pengumuman' },
    pelayanan:  { icon: 'fa-hands-helping', color: '#faf5ff', tc: '#7c3aed',         label: 'Pelayanan' },
};

// ─────────────────────────────────────────────────────────────────
// Highlight
// ─────────────────────────────────────────────────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim() || !text) return <>{text}</>;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(re);
    return (
        <>
            {parts.map((part, i) =>
                re.test(part)
                    ? <mark key={i} style={{ background: '#fef08a', color: '#102d4d', borderRadius: 3, padding: '0 2px' }}>{part}</mark>
                    : part
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────
function SectionTitle({ icon, iconColor, label }) {
    return (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4d6888', padding: '10px 16px 4px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className={`fas ${icon}`} style={{ color: iconColor || '#4d6888', fontSize: 11 }} />
            {label}
        </div>
    );
}

function ItemRow({ item, query, onSelect }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(item)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: hovered ? '#eef3fa' : 'transparent', borderBottom: '1px solid #dae2ef', transition: 'background .12s' }}
        >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${item.icon}`} style={{ color: item.tc, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#102d4d', lineHeight: 1.3 }}>
                    {query ? <Highlight text={item.title} query={query} /> : item.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#4d6888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.sub}
                </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, background: item.color, color: item.tc, borderRadius: 50, padding: '2px 9px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {item.typeLabel}
            </span>
        </div>
    );
}

function CatRow({ catKey, meta, count, onSelect }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(catKey)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', background: hovered ? '#eef3fa' : 'transparent', borderBottom: '1px solid #dae2ef', transition: 'background .12s' }}
        >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${meta.icon}`} style={{ color: meta.tc, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: '#102d4d' }}>{meta.label}</div>
            <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, background: '#eef3fa', color: '#35609a', borderRadius: 50, padding: '2px 9px', whiteSpace: 'nowrap' }}>
                {count !== undefined ? `${count} konten` : '...'}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Portal Dropdown
// ─────────────────────────────────────────────────────────────────
function PortalDropdown({ anchorRef, children, visible }) {
    const [rect, setRect] = useState(null);
    useEffect(() => {
        if (!visible) { setRect(null); return; }
        function update() { if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect()); }
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
    }, [visible, anchorRef]);
    if (!visible || !rect) return null;
    return createPortal(
        <div data-smartsearch-portal="true" style={{ position: 'fixed', top: rect.bottom + 8, left: rect.left, width: rect.width, background: 'white', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,.2)', border: '1px solid rgba(0,0,0,.08)', overflow: 'hidden', zIndex: 99999, maxHeight: '70vh', overflowY: 'auto' }}>
            {children}
        </div>,
        document.body
    );
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────
export default function SmartSearchBar() {
    const navigate  = useNavigate();
    const wrapRef   = useRef(null);
    const anchorRef = useRef(null);

    // ── Index dari API ─────────────────────────────────────────
    // allIndex: flat array semua item dari semua kategori
    const [allIndex,    setAllIndex]    = useState([]);
    const [catCounts,   setCatCounts]   = useState({});
    const [indexReady,  setIndexReady]  = useState(false);

    // ── UI state ───────────────────────────────────────────────
    const [keyword,      setKeyword]      = useState('');
    const [activeCat,    setActiveCat]    = useState('semua');
    const [showPopular,  setShowPopular]  = useState(false);
    const [showSuggest,  setShowSuggest]  = useState(false);
    const [suggestions,  setSuggestions]  = useState([]);
    const [popularItems, setPopularItems] = useState([]);

    // ── Fetch index satu kali ──────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const fetchIndex = async () => {
            try {
                // Fetch paralel, route dari api.php:
                //   GET /wisata          → WisataController@index  → { success, data: [...] }
                //   GET /berita          → BeritaController@index   → { success, data: [...] }
                //   GET /pengumuman      → PengumumanController@index
                //   GET /pelayanan       → PelayananController@index
                //   GET /events          → EventController@index
                const [w, b, p, pl, e] = await Promise.allSettled([
                    api.get('/wisata'),
                    api.get('/berita'),
                    api.get('/pengumuman'),
                    api.get('/pelayanan'),
                    api.get('/events'),
                ]);
                if (cancelled) return;

                const wisata     = toIndexItems('wisata',     unwrap(w.value));
                const berita     = toIndexItems('berita',     unwrap(b.value));
                const pengumuman = toIndexItems('pengumuman', unwrap(p.value));
                const pelayanan  = toIndexItems('pelayanan',  unwrap(pl.value));
                const event      = toIndexItems('event',      unwrap(e.value));

                const merged = [...wisata, ...berita, ...event, ...pengumuman, ...pelayanan];
                setAllIndex(merged);
                setCatCounts({
                    wisata:     wisata.length,
                    berita:     berita.length,
                    event:      event.length,
                    pengumuman: pengumuman.length,
                    pelayanan:  pelayanan.length,
                });
                setIndexReady(true);
            } catch (err) {
                console.error('SmartSearchBar index error:', err);
                setIndexReady(true); // tetap ready walau error, tapi index kosong
            }
        };
        fetchIndex();
        return () => { cancelled = true; };
    }, []);

    // ── Popular items ──────────────────────────────────────────
    const getPopularItems = () => {
        if (!indexReady || allIndex.length === 0) return [];
        const clicks = getClicks();
        const hasClicks = Object.keys(clicks).length > 0;
        if (hasClicks) {
            return allIndex
                .map((item) => ({ ...item, clicks: clicks[item.id] || 0 }))
                .filter((item) => item.clicks > 0)
                .sort((a, b) => b.clicks - a.clicks)
                .slice(0, 5);
        }
        // Default: ambil 5 item pertama dari index (data real dari DB)
        return allIndex.slice(0, 5);
    };

    // ── Dropdown logic ─────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            const inWrapper = wrapRef.current?.contains(e.target);
            const inPortal  = e.target.closest('[data-smartsearch-portal]');
            if (!inWrapper && !inPortal) closeAll();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function closeAll() { setShowPopular(false); setShowSuggest(false); }

    function openPopular() {
        if (!indexReady) return;
        setPopularItems(getPopularItems());
        setShowPopular(true);
        setShowSuggest(false);
    }

    function computeSuggest(q, cat = activeCat) {
        const lq = q.toLowerCase().trim();
        if (!lq) { openPopular(); return; }
        if (!indexReady) return;
        const matched = allIndex.filter((item) => {
            if (cat !== 'semua' && item.type !== cat) return false;
            return item.keywords.some((k) => k.includes(lq));
        }).slice(0, 8);
        setSuggestions(matched);
        setShowPopular(false);
        setShowSuggest(matched.length > 0);
    }

    function onFocus() {
        if (keyword.trim()) computeSuggest(keyword);
        else openPopular();
    }

    function onInput(e) {
        const val = e.target.value;
        setKeyword(val);
        computeSuggest(val);
    }

    function selectItem(item) {
        recordClick(item.id);
        setKeyword(item.title);
        closeAll();
        if (item.href) {
            item.href.startsWith('http')
                ? window.open(item.href, '_blank', 'noreferrer')
                : navigate(item.href);
        } else {
            navigate(`/search?q=${encodeURIComponent(item.title)}&cat=${item.type}`);
        }
    }

    function selectCat(catKey) {
        closeAll();
        navigate(`/search?cat=${catKey}`);
    }

    function doSearch() {
        if (!keyword.trim()) return;
        closeAll();
        navigate(`/search?q=${encodeURIComponent(keyword.trim())}&cat=${activeCat}`);
    }

    function handlePillClick(catKey) {
        setActiveCat(catKey);
        closeAll();
        const params = new URLSearchParams({ cat: catKey });
        if (keyword.trim()) params.set('q', keyword.trim());
        navigate(`/search?${params.toString()}`);
    }

    return (
        <div style={{ maxWidth: 700, margin: '0 auto 30px' }} ref={wrapRef}>

            {/* ── Search box ── */}
            {/* ── Search box (MODIFIED) ── */}
            <div ref={anchorRef}>
                <div
                    style={{
                        position: 'relative',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 60,
                        padding: 5,
                    }}
                >
                    <input
                        type="text"
                        className="search-input"
                        placeholder={indexReady ? 'Ketik kata kunci pencarian...' : 'Memuat data...'}
                        value={keyword}
                        onChange={onInput}
                        onFocus={onFocus}
                        onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') closeAll(); }}
                        autoComplete="off"
                        disabled={!indexReady}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            borderRadius: 50,
                            border: 'none',
                            padding: '15px 100px 15px 25px',  // ruang untuk tombol
                            fontSize: 16,
                            outline: 'none',
                            color: 'var(--text-dark)',
                            opacity: indexReady ? 1 : 0.6,
                            background: 'white',
                        }}
                    />
                    <button
                        onClick={doSearch}
                        style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'var(--teal-600)',
                            border: 'none',
                            borderRadius: 50,
                            padding: '12px 30px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <i className="fas fa-search" /> Cari
                    </button>
                </div>
            </div>

            {/* ── Portal dropdown ── */}
            <PortalDropdown anchorRef={anchorRef} visible={showPopular || showSuggest}>
                {showPopular && (
                    <>
                        {popularItems.length > 0 && (
                            <div>
                                <SectionTitle icon="fa-fire" iconColor="#d4a853" label="Paling sering dicari" />
                                {popularItems.map((item) => (
                                    <ItemRow key={item.id} item={item} query="" onSelect={selectItem} />
                                ))}
                            </div>
                        )}
                        <div style={{ height: 1, background: '#dae2ef' }} />
                        <div>
                            <SectionTitle icon="fa-th" label="Telusuri kategori" />
                            {Object.entries(CAT_META_UI).map(([key, meta]) => (
                                <CatRow key={key} catKey={key} meta={meta} count={catCounts[key]} onSelect={selectCat} />
                            ))}
                        </div>
                    </>
                )}

                {showSuggest && (
                    <>
                        <SectionTitle icon="fa-search" label={`Rekomendasi untuk "${keyword}"`} />
                        {suggestions.map((item) => (
                            <ItemRow key={item.id} item={item} query={keyword} onSelect={selectItem} />
                        ))}
                        <div
                            onClick={doSearch}
                            style={{ padding: '10px 16px', borderTop: '1px solid #dae2ef', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--teal-600)', fontSize: 13, fontWeight: 600 }}
                        >
                            <i className="fas fa-search" style={{ fontSize: 11 }} />
                            Lihat semua hasil untuk "{keyword}"
                            <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', fontSize: 11 }} />
                        </div>
                    </>
                )}
            </PortalDropdown>

            {/* ── Category pills ── */}
            <div className="search-categories" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
                {CATS.map((c) => (
                    <span
                        key={c.key}
                        onClick={() => handlePillClick(c.key)}
                        style={{
                            backdropFilter: 'blur(5px)', padding: '8px 18px', borderRadius: 50, fontSize: 13,
                            cursor: 'pointer', transition: 'all .3s', border: '1px solid rgba(255,255,255,.2)',
                            background: activeCat === c.key ? 'var(--teal-500)' : 'rgba(255,255,255,.15)',
                            color: 'white', fontWeight: activeCat === c.key ? 600 : 400, userSelect: 'none',
                        }}
                    >
                        <i className={`fas ${c.icon}`} style={{ marginRight: 6, fontSize: 11 }} />
                        {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
}