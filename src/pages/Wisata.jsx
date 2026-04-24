// src/pages/Wisata.jsx
import { useState, useMemo,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wisataData } from '../data/mockData';
import api from '../api/axios';
import WisataCard from '../components/WisataCard'; // Import komponen baru

const formatRupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

const KATEGORI = ['Semua', 'Alam', 'Rekreasi', 'Budaya', 'Religi', 'Kuliner', 'Edukasi'];
const SORT_OPTIONS = [
    { value: 'rating', label: 'Rating Tertinggi' },
    { value: 'harga',  label: 'Harga Terendah'   },
    { value: 'nama',   label: 'Nama A–Z'          },
];


export default function Wisata() {
    const navigate   = useNavigate();
    const [wisataData, setWisataData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kategori, setKategori] = useState('Semua');
    const [sort, setSort] = useState('rating');
    const [search, setSearch] = useState('');

    // Fetch data dari API Laravel
    useEffect(() => {
        api.get('/wisata')
            .then(res => {
                setWisataData(res.data.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal fetch data:", err);
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        let data = [...wisataData];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(w =>
                w.nama.toLowerCase().includes(q) || w.alamat_lengkap?.toLowerCase().includes(q)
            );
        }
        if (kategori !== 'Semua') data = data.filter(w => w.kategori === kategori);
        
        // Sorting logic tetap sama
        if (sort === 'rating') data.sort((a, b) => b.rating - a.rating);
        if (sort === 'harga') data.sort((a, b) => a.harga_anak - b.harga_anak);
        if (sort === 'nama') data.sort((a, b) => a.nama.localeCompare(b.nama));
        
        return data;
    }, [search, kategori, sort, wisataData]);

    
    const stats = [
        { num: wisataData.length,                                    label: 'Total Destinasi'  },
        { num: [...new Set(wisataData.map(w => w.kategori))].length, label: 'Kategori Wisata'  },
        { num: '18',                                                 label: 'Kecamatan'        },
        { num: '4.8',                                                label: 'Rata-rata Rating' },
    ];

    if (loading) return <div className="container" style={{padding: '100px 0'}}>Loading destinasi...</div>;

    return (
        <div className="page-wisata">

            {/* ── Hero ── */}
            <div className="page-hero-v2 page-hero-v2--wisata">
                <div className="page-hero-v2__overlay" />
                <div className="page-hero-v2__pattern" />
                <div className="page-hero-v2__deco">
                    {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                </div>
                <div className="container page-hero-v2__content">
                    <div className="page-hero-v2__label">
                        <i className="fas fa-mountain" /> Pariwisata
                    </div>
                    <h1 className="page-hero-v2__title">Destinasi Wisata Purbalingga</h1>
                    <p className="page-hero-v2__desc">
                        Jelajahi keindahan alam, budaya, dan kuliner Kabupaten Purbalingga yang memukau.
                    </p>
                    <div className="page-hero-v2__search">
                        <i className="fas fa-search page-hero-v2__search-icon" />
                        <input
                            type="text"
                            placeholder="Cari destinasi atau lokasi..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="page-hero-v2__search-input"
                        />
                    </div>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="page-stats-strip">
                <div className="container">
                    <div className="page-stats-strip__inner">
                        {stats.map(s => (
                            <div className="page-stats-strip__item" key={s.label}>
                                <div className="page-stats-strip__num">{s.num}</div>
                                <div className="page-stats-strip__label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container page-body">

                {/* Toolbar */}
                <div className="page-toolbar">
                    <div className="page-filter-tabs">
                        {KATEGORI.map(k => (
                            <button
                                key={k}
                                className={`page-filter-tab${kategori === k ? ' active' : ''}`}
                                onClick={() => setKategori(k)}
                            >{k}</button>
                        ))}
                    </div>
                    <div className="page-sort">
                        <i className="fas fa-sort-amount-down" />
                        <select value={sort} onChange={e => setSort(e.target.value)} className="page-sort-select">
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                <p className="page-count">{filtered.length} destinasi ditemukan</p>

                {filtered.length === 0 ? (
                    <div className="page-empty">
                        <i className="fas fa-mountain" />
                        <p>Tidak ada destinasi yang cocok dengan filter.</p>
                        <button className="btn btn-outline" onClick={() => { setSearch(''); setKategori('Semua'); }}>
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="wisata-grid">
                        {filtered.map(w => (
                            <WisataCard key={w.id} w={w} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}