// src/pages/Search.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const formatTanggal = (str) => {
    if (!str) return '';
    return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CAT_META = {
    wisata:     { label: 'Wisata',      icon: 'fa-mountain',      color: 'var(--teal-600)' },
    berita:     { label: 'Berita',      icon: 'fa-newspaper',     color: '#4072af'         },
    event:      { label: 'Event',       icon: 'fa-calendar-alt',  color: '#16a34a'         },
    pengumuman: { label: 'Pengumuman',  icon: 'fa-bullhorn',      color: '#d4a853'         },
    pelayanan:  { label: 'Pelayanan',   icon: 'fa-hands-helping', color: '#7c3aed'         },
};

// ─────────────────────────────────────────────────────────────────
// Normalisasi data dari API ke format flat { type, title, desc, href, img, meta }
// Field-field disesuaikan dengan schema database nyata:
//   wisata     : nama, slug, deskripsi, kategori, thumbnail, kecamatan_id
//   berita     : judul, slug, konten, kategori, thumbnail, published_at, publisher
//   event      : nama, slug, kategori, lokasi, tanggal_mulai, jam_mulai, thumbnail
//   pengumuman : judul, slug, isi, publisher, tanggal_mulai
//   pelayanan  : nama, deskripsi, url, icon
// ─────────────────────────────────────────────────────────────────
function normalizeWisata(items = []) {
    return items.map((w) => ({
        type:      'wisata',
        typeLabel: 'Wisata',
        icon:      'fa-mountain',
        color:     'var(--teal-600)',
        id:        w.id,
        title:     w.nama,
        desc:      w.deskripsi,
        href:      `/wisata/${w.slug || w.id}`,
        img:       w.thumbnail,
        meta:      w.kategori || '',
        // keywords untuk client-side filter (lowercase)
        keywords:  [w.nama, w.deskripsi, w.kategori].filter(Boolean).map((s) => s.toLowerCase()),
    }));
}

function normalizeBerita(items = []) {
    return items.map((b) => ({
        type:      'berita',
        typeLabel: 'Berita',
        icon:      'fa-newspaper',
        color:     '#4072af',
        id:        b.id,
        title:     b.judul,
        // konten bisa panjang, ambil 160 char saja
        desc:      b.konten ? b.konten.replace(/<[^>]*>/g, '').slice(0, 160) : '',
        href:      `/berita/${b.slug || b.id}`,
        img:       b.thumbnail,
        meta:      formatTanggal(b.published_at || b.created_at),
        keywords:  [b.judul, b.konten, b.kategori, b.publisher]
                        .filter(Boolean).map((s) => s.replace(/<[^>]*>/g, '').toLowerCase()),
    }));
}

function normalizeEvent(items = []) {
    return items.map((e) => ({
        type:      'event',
        typeLabel: 'Event',
        icon:      'fa-calendar-alt',
        color:     '#16a34a',
        id:        e.id,
        title:     e.nama,
        desc:      [e.lokasi, e.jam_mulai].filter(Boolean).join(' · '),
        href:      `/event`,
        img:       e.thumbnail,
        meta:      formatTanggal(e.tanggal_mulai),
        keywords:  [e.nama, e.kategori, e.lokasi, e.penyelenggara]
                        .filter(Boolean).map((s) => s.toLowerCase()),
    }));
}

function normalizePengumuman(items = []) {
    return items.map((p) => ({
        type:      'pengumuman',
        typeLabel: 'Pengumuman',
        icon:      'fa-bullhorn',
        color:     '#d4a853',
        id:        p.id,
        title:     p.judul,
        desc:      p.isi ? p.isi.replace(/<[^>]*>/g, '').slice(0, 160) : '',
        href:      `/pengumuman/${p.slug || p.id}`,
        img:       null,
        meta:      formatTanggal(p.tanggal_mulai || p.created_at),
        keywords:  [p.judul, p.isi, p.publisher]
                        .filter(Boolean).map((s) => s.replace(/<[^>]*>/g, '').toLowerCase()),
    }));
}

function normalizePelayanan(items = []) {
    return items.map((p) => ({
        type:      'pelayanan',
        typeLabel: 'Pelayanan',
        icon:      p.icon || 'fa-hands-helping',
        color:     '#7c3aed',
        id:        p.id,
        title:     p.nama,
        desc:      p.deskripsi,
        href:      p.url,
        img:       null,
        meta:      null,
        keywords:  [p.nama, p.deskripsi].filter(Boolean).map((s) => s.toLowerCase()),
    }));
}

// ─────────────────────────────────────────────────────────────────
// Client-side filter (setelah data di-fetch dari API)
// ─────────────────────────────────────────────────────────────────
function filterItems(allItems, query, kategori) {
    const q = query.toLowerCase().trim();
    return allItems.filter((item) => {
        // filter kategori
        if (kategori !== 'semua' && item.type !== kategori) return false;
        // jika ada query, filter keywords
        if (q) return item.keywords.some((k) => k.includes(q));
        return true;
    });
}

// ─────────────────────────────────────────────────────────────────
// Highlight
// ─────────────────────────────────────────────────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim() || !text) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part)
                    ? <mark key={i} style={{ background: '#fef08a', color: 'var(--dark)', borderRadius: 3, padding: '0 2px' }}>{part}</mark>
                    : part
            )}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────
// Result Card
// ─────────────────────────────────────────────────────────────────
function ResultCard({ result, query }) {
    const inner = (
        <div
            style={{
                display: 'flex', gap: 16, padding: '20px 24px',
                background: 'white', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                transition: 'all .2s',
                cursor: result.href ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
            {/* Gambar atau icon placeholder */}
            {result.img ? (
                <img
                    src={result.img} alt={result.title}
                    style={{ width: 88, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <div style={{ width: 88, height: 72, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fas ${result.icon}`} style={{ fontSize: 24, color: result.color }} />
                </div>
            )}

            {/* Konten */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
                        color: result.color, background: result.color + '18',
                        padding: '3px 10px', borderRadius: 50,
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <i className={`fas ${result.icon}`} style={{ fontSize: 9 }} /> {result.typeLabel}
                    </span>
                    {result.meta && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{result.meta}</span>
                    )}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--dark)', marginBottom: 6, lineHeight: 1.3 }}>
                    <Highlight text={result.title} query={query} />
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <Highlight text={result.desc} query={query} />
                </div>
            </div>

            {result.href && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--teal-500)', flexShrink: 0 }}>
                    <i className="fas fa-arrow-right" />
                </div>
            )}
        </div>
    );

    if (!result.href) return inner;
    const isExternal = result.href.startsWith('http');
    return isExternal
        ? <a href={result.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
        : <Link to={result.href} style={{ textDecoration: 'none' }}>{inner}</Link>;
}

// ─────────────────────────────────────────────────────────────────
// Skeleton loading
// ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ display: 'flex', gap: 16, padding: '20px 24px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ width: 88, height: 72, borderRadius: 8, background: '#e2e8f0', flexShrink: 0, animation: 'pulse 1.4s ease infinite' }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '30%', background: '#e2e8f0', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.4s ease infinite' }} />
                <div style={{ height: 18, width: '70%', background: '#e2e8f0', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.4s ease infinite' }} />
                <div style={{ height: 13, width: '90%', background: '#f1f5f9', borderRadius: 6, animation: 'pulse 1.4s ease infinite' }} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────
function EmptyState({ query, kategori }) {
    const catLabel = CAT_META[kategori]?.label || '';
    return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fas fa-search-minus" style={{ fontSize: 48, color: 'var(--teal-200)', marginBottom: 16, display: 'block' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--dark)', marginBottom: 8 }}>Tidak ada hasil</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                {query
                    ? `Tidak ada hasil untuk "${query}"${catLabel ? ` di kategori ${catLabel}` : ''}. Coba kata kunci lain.`
                    : `Belum ada data untuk kategori ${catLabel}.`}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// Main Search Page
// ─────────────────────────────────────────────────────────────────
export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [inputVal, setInputVal] = useState(() => searchParams.get('q') || '');

    // State data API — satu kali fetch semua, lalu filter client-side
    const [allItems, setAllItems]     = useState([]);
    const [dataReady, setDataReady]   = useState(false);
    const [fetchError, setFetchError] = useState(false);

    // Count per kategori (dari data yang sudah di-fetch)
    const [counts, setCounts] = useState({ semua: 0, wisata: 0, berita: 0, event: 0, pengumuman: 0, pelayanan: 0 });

    const query    = searchParams.get('q') || '';
    const kategori = searchParams.get('cat') || 'semua';

    // ── Fetch semua data dari API saat mount ───────────────────
    useEffect(() => {
        let cancelled = false;
        setDataReady(false);
        setFetchError(false);

        const fetchAll = async () => {
            try {
                // Fetch paralel semua endpoint publik
                // Route: GET /wisata, /berita, /pengumuman, /pelayanan, /events
                const [wisataRes, beritaRes, pengumumanRes, pelayananRes, eventRes] = await Promise.allSettled([
                    api.get('/wisata'),
                    api.get('/berita'),
                    api.get('/pengumuman'),
                    api.get('/pelayanan'),
                    api.get('/events'),
                ]);

                if (cancelled) return;

                // Unwrap response — format: { success: true, data: [...] } atau langsung array
                const unwrap = (res) => {
                    if (res.status !== 'fulfilled') return [];
                    const d = res.value?.data;
                    if (Array.isArray(d)) return d;
                    if (Array.isArray(d?.data)) return d.data;
                    return [];
                };

                const wisata     = normalizeWisata(unwrap(wisataRes));
                const berita     = normalizeBerita(unwrap(beritaRes));
                const pengumuman = normalizePengumuman(unwrap(pengumumanRes));
                const pelayanan  = normalizePelayanan(unwrap(pelayananRes));
                const event      = normalizeEvent(unwrap(eventRes));

                const merged = [...wisata, ...berita, ...event, ...pengumuman, ...pelayanan];
                setAllItems(merged);
                setCounts({
                    semua:      merged.length,
                    wisata:     wisata.length,
                    berita:     berita.length,
                    event:      event.length,
                    pengumuman: pengumuman.length,
                    pelayanan:  pelayanan.length,
                });
                setDataReady(true);
            } catch (err) {
                if (!cancelled) {
                    console.error('Search fetch error:', err);
                    setFetchError(true);
                    setDataReady(true);
                }
            }
        };

        fetchAll();
        return () => { cancelled = true; };
    }, []); // sekali saja saat mount

    // ── Sync input dengan URL param q ──────────────────────────
    useEffect(() => { setInputVal(query); }, [query]);

    // ── Filter client-side setelah data siap ──────────────────
    const results = dataReady ? filterItems(allItems, query, kategori) : [];

    // ── Count per kategori untuk sidebar badge ─────────────────
    // Hitung berdasarkan filter query saat ini (tanpa filter kategori)
    const filteredCounts = dataReady
        ? {
            semua:      filterItems(allItems, query, 'semua').length,
            wisata:     filterItems(allItems, query, 'wisata').length,
            berita:     filterItems(allItems, query, 'berita').length,
            event:      filterItems(allItems, query, 'event').length,
            pengumuman: filterItems(allItems, query, 'pengumuman').length,
            pelayanan:  filterItems(allItems, query, 'pelayanan').length,
        }
        : { semua: 0, wisata: 0, berita: 0, event: 0, pengumuman: 0, pelayanan: 0 };

    function doSearch() {
        const params = { cat: kategori };
        if (inputVal.trim()) params.q = inputVal.trim();
        setSearchParams(params);
    }

    function setKat(kat) {
        const params = { cat: kat };
        if (query) params.q = query;
        setSearchParams(params);
    }

    const kategoriList = [
        { key: 'semua',      label: 'Semua',       icon: 'fa-th' },
        { key: 'wisata',     label: 'Wisata',       icon: 'fa-mountain' },
        { key: 'berita',     label: 'Berita',       icon: 'fa-newspaper' },
        { key: 'event',      label: 'Event',        icon: 'fa-calendar-alt' },
        { key: 'pelayanan',  label: 'Pelayanan',    icon: 'fa-hands-helping' },
        { key: 'pengumuman', label: 'Pengumuman',   icon: 'fa-bullhorn' },
    ];

    const headingText = () => {
        const catLabel = CAT_META[kategori]?.label;
        if (query && catLabel)  return <>Hasil "<span style={{ color: 'var(--teal-300)' }}>{query}</span>" di {catLabel}</>;
        if (query)              return <>Hasil pencarian untuk "<span style={{ color: 'var(--teal-300)' }}>{query}</span>"</>;
        if (catLabel)           return <>Semua {catLabel}</>;
        return 'Cari Informasi Purbalingga';
    };

    const summaryText = () => {
        const catLabel = CAT_META[kategori]?.label;
        if (query && catLabel)  return `Ditemukan ${results.length} hasil untuk "${query}" di ${catLabel}`;
        if (query)              return `Ditemukan ${results.length} hasil untuk "${query}"`;
        if (catLabel)           return `Menampilkan ${results.length} ${catLabel.toLowerCase()} tersedia`;
        return `Menampilkan ${results.length} konten`;
    };

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

            {/* ── Search Header ── */}
            <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '48px 0 40px' }}>
                <div className="container">
                    <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--teal-300)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                            <i className="fas fa-search" style={{ marginRight: 6 }} />Pencarian
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,34px)', color: 'white', marginBottom: 28, lineHeight: 1.3 }}>
                            {headingText()}
                        </h1>

                        {/* Search box */}
                        <div style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 60, padding: 5, display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                                placeholder="Ketik kata kunci..."
                                style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 24px', fontSize: 16, outline: 'none', color: 'white' }}
                            />
                            {inputVal && (
                                <button
                                    onClick={() => { setInputVal(''); setSearchParams({ cat: kategori }); }}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', padding: '0 8px', fontSize: 16 }}
                                >
                                    <i className="fas fa-times" />
                                </button>
                            )}
                            <button
                                onClick={doSearch}
                                style={{ background: 'var(--teal-500)', border: 'none', borderRadius: 50, padding: '12px 28px', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginRight: 4, fontSize: 14 }}
                            >
                                <i className="fas fa-search" /> Cari
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container" style={{ marginTop: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>

                    {/* ── Sidebar filter ── */}
                    <aside style={{ position: 'sticky', top: 100 }}>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>
                                <i className="fas fa-filter" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Filter Kategori
                            </div>
                            {kategoriList.map((k) => {
                                const isActive = kategori === k.key;
                                // Gunakan filteredCounts (hasil filter query tapi tanpa filter kategori)
                                const count = filteredCounts[k.key] ?? 0;
                                return (
                                    <button
                                        key={k.key}
                                        onClick={() => setKat(k.key)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            width: '100%', padding: '12px 20px',
                                            background: isActive ? 'var(--teal-50)' : 'transparent',
                                            borderLeft: isActive ? '3px solid var(--teal-500)' : '3px solid transparent',
                                            border: 'none', borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                                            fontFamily: 'var(--font-body)',
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--teal-700)' : 'var(--text-dark)' }}>
                                            <i className={`fas ${k.icon}`} style={{ width: 16, color: isActive ? 'var(--teal-600)' : 'var(--text-muted)', fontSize: 13 }} />
                                            {k.label}
                                        </span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700,
                                            background: isActive ? 'var(--teal-600)' : 'var(--border)',
                                            color: isActive ? 'white' : 'var(--text-muted)',
                                            borderRadius: 50, padding: '2px 8px', minWidth: 24, textAlign: 'center',
                                        }}>
                                            {dataReady ? count : '...'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Error notice */}
                        {fetchError && (
                            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#dc2626', display: 'flex', gap: 8 }}>
                                <i className="fas fa-exclamation-circle" style={{ marginTop: 2 }} />
                                Gagal memuat data dari server.
                            </div>
                        )}
                    </aside>

                    {/* ── Hasil ── */}
                    <div>
                        {/* Ringkasan */}
                        {dataReady && results.length > 0 && (
                            <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fas fa-info-circle" style={{ color: 'var(--teal-500)' }} />
                                {summaryText()}
                            </div>
                        )}

                        {/* Loading skeletons */}
                        {!dataReady && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {/* Hasil / empty */}
                        {dataReady && (
                            results.length === 0
                                ? <EmptyState query={query} kategori={kategori} />
                                : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {results.map((r, i) => (
                                            <ResultCard key={`${r.type}-${r.id ?? i}`} result={r} query={query} />
                                        ))}
                                    </div>
                                )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}