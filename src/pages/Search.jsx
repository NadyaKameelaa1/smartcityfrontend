// src/pages/Search.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { wisataData, beritaData, pengumumanData, eventData, pelayananData } from '../data/mockData';

const formatTanggal = (str) =>
    new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Meta per kategori ─────────────────────────────────────────
const CAT_META = {
    wisata:     { label: 'Wisata',      icon: 'fa-mountain',      color: 'var(--teal-600)' },
    berita:     { label: 'Berita',      icon: 'fa-newspaper',     color: '#4072af' },
    event:      { label: 'Event',       icon: 'fa-calendar-alt',  color: '#16a34a' },
    pengumuman: { label: 'Pengumuman',  icon: 'fa-bullhorn',      color: '#d4a853' },
    pelayanan:  { label: 'Pelayanan',   icon: 'fa-hands-helping', color: '#7c3aed' },
};

// ── Search engine lokal ───────────────────────────────────────
// Sekarang bekerja dalam dua mode:
//   1. query kosong  → kembalikan SEMUA item dalam kategori (browse mode)
//   2. query ada     → filter berdasarkan keyword (search mode)
function searchAll(query, kategori) {
    const q = query.toLowerCase().trim();
    const matchStr = (str) => !q || str?.toLowerCase().includes(q);

    const results = [];

    if (kategori === 'semua' || kategori === 'wisata') {
        wisataData.forEach((w) => {
            if (matchStr(w.nama) || matchStr(w.deskripsi) || matchStr(w.lokasi) || matchStr(w.kategori)) {
                results.push({
                    type: 'wisata', typeLabel: 'Wisata',
                    icon: 'fa-mountain', color: 'var(--teal-600)',
                    data: w, title: w.nama, desc: w.deskripsi,
                    href: `/wisata/${w.slug || w.id}`, img: w.gambar,
                    meta: w.lokasi,
                });
            }
        });
    }
    if (kategori === 'semua' || kategori === 'berita') {
        beritaData.forEach((b) => {
            if (matchStr(b.judul) || matchStr(b.excerpt) || matchStr(b.kategori)) {
                results.push({
                    type: 'berita', typeLabel: 'Berita',
                    icon: 'fa-newspaper', color: '#4072af',
                    data: b, title: b.judul, desc: b.excerpt,
                    href: `/berita/${b.slug}`, img: b.gambar,
                    meta: formatTanggal(b.tanggal),
                });
            }
        });
    }
    if (kategori === 'semua' || kategori === 'pengumuman') {
        pengumumanData.forEach((p) => {
            if (matchStr(p.judul) || matchStr(p.isi) || matchStr(p.instansi)) {
                results.push({
                    type: 'pengumuman', typeLabel: 'Pengumuman',
                    icon: 'fa-bullhorn', color: '#d4a853',
                    data: p, title: p.judul, desc: p.isi,
                    href: `/pengumuman/${p.id}`, img: null,
                    meta: formatTanggal(p.tanggal),
                });
            }
        });
    }
    if (kategori === 'semua' || kategori === 'event') {
        eventData.forEach((e) => {
            if (matchStr(e.nama) || matchStr(e.kategori) || matchStr(e.lokasi)) {
                results.push({
                    type: 'event', typeLabel: 'Event',
                    icon: 'fa-calendar-alt', color: '#16a34a',
                    data: e, title: e.nama, desc: `${e.lokasi} · ${e.jam}`,
                    href: null, img: e.gambar,
                    meta: formatTanggal(e.tanggal),
                });
            }
        });
    }
    if (kategori === 'semua' || kategori === 'pelayanan') {
        pelayananData.forEach((p) => {
            if (matchStr(p.nama) || matchStr(p.deskripsi)) {
                results.push({
                    type: 'pelayanan', typeLabel: 'Pelayanan',
                    icon: 'fa-hands-helping', color: '#7c3aed',
                    data: p, title: p.nama, desc: p.deskripsi,
                    href: p.url, img: null,
                    meta: null,
                });
            }
        });
    }

    return results;
}

// Hitung jumlah item per kategori (untuk badge filter sidebar)
function countByKat(query, kat) {
    if (kat === 'semua') return searchAll(query, 'semua').length;
    return searchAll(query, kat).length;
}

// ── Highlight keyword ─────────────────────────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim()) return <>{text}</>;
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

// ── Result Card ───────────────────────────────────────────────
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
            {/* Gambar atau icon */}
            {result.img ? (
                <img
                    src={result.img} alt={result.title}
                    style={{ width: 88, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
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

    if (result.href) {
        const isExternal = result.href.startsWith('http');
        return isExternal
            ? <a href={result.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
            : <Link to={result.href} style={{ textDecoration: 'none' }}>{inner}</Link>;
    }
    return inner;
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ query, kategori }) {
    const catLabel = CAT_META[kategori]?.label || '';
    return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fas fa-search-minus" style={{ fontSize: 48, color: 'var(--teal-200)', marginBottom: 16 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--dark)', marginBottom: 8 }}>Tidak ada hasil</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                {query
                    ? `Tidak ada hasil untuk "${query}"${catLabel ? ` di kategori ${catLabel}` : ''}. Coba kata kunci lain.`
                    : `Belum ada data untuk kategori ${catLabel}.`
                }
            </p>
        </div>
    );
}

// ── Main Search Page ──────────────────────────────────────────
export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [inputVal, setInputVal] = useState(() => searchParams.get('q') || '');

    const query    = searchParams.get('q') || '';
    const kategori = searchParams.get('cat') || 'semua';

    // Selalu jalankan search (dengan atau tanpa query)
    const results = searchAll(query, kategori);

    useEffect(() => {
        setInputVal(query);
    }, [query]);

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

    // Label untuk heading
    const headingText = () => {
        const catLabel = CAT_META[kategori]?.label;
        if (query && catLabel)  return <>Hasil "<span style={{ color: 'var(--teal-300)' }}>{query}</span>" di {catLabel}</>;
        if (query)              return <>Hasil pencarian untuk "<span style={{ color: 'var(--teal-300)' }}>{query}</span>"</>;
        if (catLabel)           return <>Semua {catLabel}</>;
        return 'Cari Informasi Purbalingga';
    };

    // Teks ringkasan jumlah hasil
    const summaryText = () => {
        const catLabel = CAT_META[kategori]?.label;
        if (query && catLabel)  return `Ditemukan ${results.length} hasil untuk "${query}" di ${catLabel}`;
        if (query)              return `Ditemukan ${results.length} hasil untuk "${query}"`;
        if (catLabel)           return `Menampilkan ${results.length} ${catLabel.toLowerCase()} tersedia`;
        return `Menampilkan ${results.length} konten`;
    };

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>

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
                                style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 24px', fontSize: 16, outline: 'none', color:'white' }}
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
                                const count    = countByKat(query, k.key);
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
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* ── Hasil ── */}
                    <div>
                        {/* Ringkasan */}
                        {results.length > 0 && (
                            <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fas fa-info-circle" style={{ color: 'var(--teal-500)' }} />
                                {summaryText()}
                            </div>
                        )}

                        {/* Daftar hasil / empty state */}
                        {results.length === 0 ? (
                            <EmptyState query={query} kategori={kategori} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {results.map((r, i) => (
                                    <ResultCard key={i} result={r} query={query} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}