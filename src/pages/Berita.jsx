// src/pages/Berita.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios'; // Pastikan path axios benar

const formatTanggal = (str) => {
    if (!str) return '---';
    return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const KATEGORI = ['Semua', 'kecamatan', 'desa'];
const SORT_OPTIONS = [
    { value: 'terbaru',    label: 'Terbaru'    },
    { value: 'terpopuler', label: 'Terpopuler' },
];

export default function Berita() {
    const [beritaList, setBeritaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kategori, setKategori] = useState('Semua');
    const [sort, setSort] = useState('terbaru');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    
    const PER_PAGE = 9;
    const BASE_IMAGE_URL = 'http://192.168.40.128:8000/storage/';

    // 1. Fetch Data dari Backend
    useEffect(() => {
        setLoading(true);
        api.get('/berita')
            .then(res => {
                setBeritaList(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal ambil berita:", err);
                setLoading(false);
            });
    }, []);

    // 2. Logika Filter & Sort (Client-side)
    const filtered = useMemo(() => {
        let data = [...beritaList];
        
        if (search.trim())
            data = data.filter(b => b.judul.toLowerCase().includes(search.toLowerCase()));
        
        if (kategori !== 'Semua')
            data = data.filter(b => b.kategori === kategori);
        
        if (sort === 'terbaru') 
            data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        
        if (sort === 'terpopuler') 
            data.sort((a, b) => (b.views || 0) - (a.views || 0));
            
        return data;
    }, [search, kategori, sort, beritaList]);

    // Pemisahan Featured & Pagination
    const featured  = filtered[0]; // Berita pertama jadi featured
    const rest      = filtered.slice(1);
    const paginated = rest.slice(0, page * PER_PAGE);
    const hasMore   = paginated.length < rest.length;

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Memuat daftar berita...</div>
            </div>
        );
    }

    return (
        <div className="page-berita">
            {/* ── Hero (Tetap Sama) ── */}
            <div className="page-hero-v2 page-hero-v2--berita">
                <div className="page-hero-v2__overlay" />
                <div className="page-hero-v2__pattern" />
                <div className="container page-hero-v2__content">
                    <div className="page-hero-v2__label"><i className="fas fa-newspaper" /> Informasi Terkini</div>
                    <h1 className="page-hero-v2__title">Berita Purbalingga</h1>
                    <div className="page-hero-v2__search">
                        <i className="fas fa-search page-hero-v2__search-icon" />
                        <input
                            type="text"
                            placeholder="Cari judul berita..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="page-hero-v2__search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="container page-body">
                {/* Toolbar */}
                <div className="page-toolbar">
                    <div className="page-filter-tabs">
                        {KATEGORI.map(k => (
                            <button
                                key={k}
                                className={`page-filter-tab${kategori === k ? ' active' : ''}`}
                                onClick={() => { setKategori(k); setPage(1); }}
                            >
                                {k === 'Semua' ? 'Semua Berita' : `Berita ${k}`}
                            </button>
                        ))}
                    </div>
                    <div className="page-sort">
                        <select value={sort} onChange={e => setSort(e.target.value)} className="page-sort-select">
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Featured card */}
                {featured && (
                    <Link to={`/berita/${featured.slug}`} className="berita-featured-full" style={{ marginBottom: '48px' }}>
                        <img src={`${BASE_IMAGE_URL}${featured.thumbnail}`} alt={featured.judul} className="berita-featured-full__img" />
                        <div className="berita-featured-full__overlay" />
                        <div className="berita-featured-full__body">
                            <span className={`berita-tag tag-${featured.kategori}`} style={{ background: 'white', fontWeight: 'bold' }}>{featured.kategori}</span>
                            <h2 className="berita-featured-full__title">{featured.judul}</h2>
                            <p className="berita-featured-full__excerpt">
                                {featured.konten?.substring(0, 150)}...
                            </p>
                            <div className="berita-featured-full__meta">
                                <span><i className="fas fa-calendar" /> {formatTanggal(featured.published_at)}</span>
                                <span><i className="fas fa-eye" /> {featured.views?.toLocaleString('id-ID')} dibaca</span>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="page-empty">
                        <p>Tidak ada berita ditemukan.</p>
                    </div>
                ) : (
                    <>
                        <div className="berita-grid-full">
                            {paginated.map(b => (
                                <Link to={`/berita/${b.slug}`} key={b.id} className="berita-card-full">
                                    <div className="berita-card-full__img-wrap">
                                        <img src={`${BASE_IMAGE_URL}${b.thumbnail}`} alt={b.judul} className="berita-card-full__img" />
                                        <span className={`berita-tag tag-${b.kategori}`} style={{ background: 'white', fontWeight: 'bold' }}>{b.kategori}</span>
                                    </div>
                                    <div className="berita-card-full__body">
                                        <h3 className="berita-card-full__title">{b.judul}</h3>
                                        <p className="berita-card-full__excerpt">
                                            {b.konten?.substring(0, 100)}...
                                        </p>
                                        <div className="berita-card-full__meta">
                                            <span><i className="fas fa-calendar" /> {formatTanggal(b.published_at)}</span>
                                            <span><i className="fas fa-eye" /> {b.views?.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {hasMore && (
                            <div style={{ textAlign: 'center', marginTop: 40 }}>
                                <button className="btn btn-outline" onClick={() => setPage(p => p + 1)}>
                                    Muat Lebih Banyak
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}