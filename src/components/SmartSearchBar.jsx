// src/components/SmartSearchBar.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    wisataData,
    beritaData,
    pengumumanData,
    eventData,
    pelayananData,
} from '../data/mockData';

// ─────────────────────────────────────────────────────────────────
// Bangun flat index dari semua data source
// ─────────────────────────────────────────────────────────────────
function buildIndex() {
    const items = [];

    wisataData.forEach((d) =>
        items.push({
            id:       `wisata-${d.id}`,
            refId:    d.id,
            title:    d.nama,
            sub:      `${d.kategori} · ${d.lokasi}`,
            type:     'wisata',
            icon:     'fa-mountain',
            color:    '#eef3fa',
            tc:       'var(--teal-700)',
            href:     null,
            keywords: [d.nama, d.lokasi, d.kategori, d.kecamatan, d.deskripsi]
                        .filter(Boolean).map((s) => s.toLowerCase()),
        })
    );

    beritaData.forEach((d) =>
        items.push({
            id:       `berita-${d.id}`,
            refId:    d.id,
            title:    d.judul,
            sub:      `Berita · ${d.kategori} · ${d.penulis}`,
            type:     'berita',
            icon:     'fa-newspaper',
            color:    '#fff8e6',
            tc:       '#b45309',
            href:     `/berita/${d.slug}`,
            keywords: [d.judul, d.excerpt, d.kategori, d.penulis]
                        .filter(Boolean).map((s) => s.toLowerCase()),
        })
    );

    eventData.forEach((d) =>
        items.push({
            id:       `event-${d.id}`,
            refId:    d.id,
            title:    d.nama,
            sub:      `${d.kategori} · ${d.lokasi}`,
            type:     'event',
            icon:     'fa-calendar-alt',
            color:    '#f0fdf4',
            tc:       '#16a34a',
            href:     null,
            keywords: [d.nama, d.lokasi, d.kategori, d.penyelenggara]
                        .filter(Boolean).map((s) => s.toLowerCase()),
        })
    );

    pengumumanData.forEach((d) =>
        items.push({
            id:       `pengumuman-${d.id}`,
            refId:    d.id,
            title:    d.judul,
            sub:      `Pengumuman · ${d.instansi}`,
            type:     'pengumuman',
            icon:     'fa-bullhorn',
            color:    '#fff7ed',
            tc:       '#c2410c',
            href:     `/pengumuman/${d.id}`,
            keywords: [d.judul, d.isi, d.instansi, d.kategori]
                        .filter(Boolean).map((s) => s.toLowerCase()),
        })
    );

    pelayananData.forEach((d) =>
        items.push({
            id:       `pelayanan-${d.id}`,
            refId:    d.id,
            title:    d.nama,
            sub:      d.deskripsi,
            type:     'pelayanan',
            icon:     d.icon || 'fa-hands-helping',
            color:    '#faf5ff',
            tc:       '#7c3aed',
            href:     d.url,
            keywords: [d.nama, d.deskripsi, d.kategori]
                        .filter(Boolean).map((s) => s.toLowerCase()),
        })
    );

    return items;
}

const ALL_ITEMS = buildIndex();

const CATS = [
    { key: 'semua',      label: 'Semua',       icon: 'fa-th' },
    { key: 'wisata',     label: 'Wisata',       icon: 'fa-mountain' },
    { key: 'berita',     label: 'Berita',       icon: 'fa-newspaper' },
    { key: 'event',      label: 'Event',        icon: 'fa-calendar-alt' },
    { key: 'pelayanan',  label: 'Pelayanan',    icon: 'fa-hands-helping' },
    { key: 'pengumuman', label: 'Pengumuman',   icon: 'fa-bullhorn' },
];

const CAT_META = {
    wisata:     { icon: 'fa-mountain',      color: '#eef3fa', tc: 'var(--teal-700)', label: 'Wisata',      count: wisataData.length },
    berita:     { icon: 'fa-newspaper',     color: '#fff8e6', tc: '#b45309',         label: 'Berita',      count: beritaData.length },
    event:      { icon: 'fa-calendar-alt',  color: '#f0fdf4', tc: '#16a34a',         label: 'Event',       count: eventData.length },
    pengumuman: { icon: 'fa-bullhorn',      color: '#fff7ed', tc: '#c2410c',         label: 'Pengumuman',  count: pengumumanData.length },
    pelayanan:  { icon: 'fa-hands-helping', color: '#faf5ff', tc: '#7c3aed',         label: 'Pelayanan',   count: pelayananData.length },
};

// ─────────────────────────────────────────────────────────────────
// Tracking popularitas via localStorage
// ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'smartsearch_clicks_v1';

function getClicks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

function recordClick(id) {
    const c = getClicks();
    c[id] = (c[id] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

const DEFAULT_POPULAR_IDS = ['wisata-1', 'wisata-2', 'event-1', 'pengumuman-1'];

function getPopularItems() {
    const clicks = getClicks();
    const hasAnyClick = Object.keys(clicks).length > 0;
    if (hasAnyClick) {
        return ALL_ITEMS
            .map((item) => ({ ...item, clicks: clicks[item.id] || 0 }))
            .filter((item) => item.clicks > 0)
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5);
    }
    return DEFAULT_POPULAR_IDS
        .map((id) => ALL_ITEMS.find((item) => item.id === id))
        .filter(Boolean)
        .map((item) => ({ ...item, clicks: 0 }));
}

// ─────────────────────────────────────────────────────────────────
// Highlight keyword dalam teks
// ─────────────────────────────────────────────────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim()) return <>{text}</>;
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
// Section title
// ─────────────────────────────────────────────────────────────────
function SectionTitle({ icon, iconColor, label }) {
    return (
        <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', color: '#4d6888',
            padding: '10px 16px 4px',
            display: 'flex', alignItems: 'center', gap: 7,
        }}>
            <i className={`fas ${icon}`} style={{ color: iconColor || '#4d6888', fontSize: 11 }} />
            {label}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Item row — rata kiri
// ─────────────────────────────────────────────────────────────────
function ItemRow({ item, query, onSelect }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(item)}
            style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer',
                background: hovered ? '#eef3fa' : 'transparent',
                borderBottom: '1px solid #dae2ef',
                transition: 'background .12s',
            }}
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
                {item.type}
            </span>
        </div>
    );
}

function CatRow({ catKey, meta, onSelect }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(catKey)}
            style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px', cursor: 'pointer',
                background: hovered ? '#eef3fa' : 'transparent',
                borderBottom: '1px solid #dae2ef',
                transition: 'background .12s',
            }}
        >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${meta.icon}`} style={{ color: meta.tc, fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: '#102d4d' }}>{meta.label}</div>
            <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0, background: '#eef3fa', color: '#35609a', borderRadius: 50, padding: '2px 9px', whiteSpace: 'nowrap' }}>
                {meta.count} konten
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Portal Dropdown — render ke body agar tidak terpotong overflow
// ─────────────────────────────────────────────────────────────────
function PortalDropdown({ anchorRef, children, visible }) {
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (!visible) { setRect(null); return; }
        function update() {
            if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
        }
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
    }, [visible, anchorRef]);

    if (!visible || !rect) return null;

    return createPortal(
        <div
            data-smartsearch-portal="true"
            style={{
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
                background: 'white',
                borderRadius: 16,
                boxShadow: '0 16px 48px rgba(0,0,0,.2)',
                border: '1px solid rgba(0,0,0,.08)',
                overflow: 'hidden',
                zIndex: 99999,
                maxHeight: '70vh',
                overflowY: 'auto',
            }}
        >
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

    const [keyword,      setKeyword]      = useState('');
    const [activeCat,    setActiveCat]    = useState('semua');
    const [showPopular,  setShowPopular]  = useState(false);
    const [showSuggest,  setShowSuggest]  = useState(false);
    const [suggestions,  setSuggestions]  = useState([]);
    const [popularItems, setPopularItems] = useState([]);

    // Tutup saat klik di luar
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
        setPopularItems(getPopularItems());
        setShowPopular(true);
        setShowSuggest(false);
    }

    function computeSuggest(q, cat = activeCat) {
        const lq = q.toLowerCase().trim();
        if (!lq) { openPopular(); return; }
        const matched = ALL_ITEMS.filter((item) => {
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

    // Klik kategori di dropdown → browse kategori (tanpa keyword)
    function selectCat(catKey) {
        closeAll();
        navigate(`/search?cat=${catKey}`);
    }

    // Tombol Cari
    function doSearch() {
        if (!keyword.trim()) return;
        closeAll();
        navigate(`/search?q=${encodeURIComponent(keyword.trim())}&cat=${activeCat}`);
    }

    // Pills di bawah searchbar:
    // - klik "Semua" → /search?cat=semua (tampilkan semua konten)
    // - klik kategori lain → /search?cat=wisata dst.
    // - jika ada keyword aktif, sertakan juga q= supaya filter tetap berlaku
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
            <div ref={anchorRef}>
                <div
                    className="hero-search-box-container"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 60, padding: 5 }}
                >
                    <div className="hero-search-box" style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Ketik kata kunci pencarian..."
                            value={keyword}
                            onChange={onInput}
                            onFocus={onFocus}
                            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') closeAll(); }}
                            autoComplete="off"
                            style={{ flex: 1, borderRadius: '50px', border: 'none', padding: '15px 25px', fontSize: 16, outline: 'none', color: 'gray' }}
                        />
                        <button
                            onClick={doSearch}
                            style={{ background: 'var(--teal-600)', border: 'none', borderRadius: 50, padding: '12px 30px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginRight: 5 }}
                        >
                            <i className="fas fa-search" /> Cari
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Portal dropdown ── */}
            <PortalDropdown anchorRef={anchorRef} visible={showPopular || showSuggest}>
                {showPopular && (
                    <>
                        <div>
                            <SectionTitle icon="fa-fire" iconColor="#d4a853" label="Paling sering dicari" />
                            {popularItems.map((item) => (
                                <ItemRow key={item.id} item={item} query="" onSelect={selectItem} />
                            ))}
                        </div>
                        <div style={{ height: 1, background: '#dae2ef' }} />
                        <div>
                            <SectionTitle icon="fa-th" label="Telusuri kategori" />
                            {Object.entries(CAT_META).map(([key, meta]) => (
                                <CatRow key={key} catKey={key} meta={meta} onSelect={selectCat} />
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
            <div
                className="search-categories"
                style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}
            >
                {CATS.map((c) => (
                    <span
                        key={c.key}
                        onClick={() => handlePillClick(c.key)}
                        style={{
                            backdropFilter: 'blur(5px)',
                            padding: '8px 18px', borderRadius: 50, fontSize: 13,
                            cursor: 'pointer', transition: 'all .3s',
                            border: '1px solid rgba(255,255,255,.2)',
                            background: activeCat === c.key ? 'var(--teal-500)' : 'rgba(255,255,255,.15)',
                            color: 'white',
                            fontWeight: activeCat === c.key ? 600 : 400,
                            userSelect: 'none',
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