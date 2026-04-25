// src/pages/BeritaDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const formatTanggal = (str) => {
    if (!str) return '---';
    return new Date(str).toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
};

export default function BeritaDetail() {
    const { slug } = useParams();
    const [berita, setBerita] = useState(null);
    const [lainnya, setLainnya] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_IMAGE_URL = 'http://localhost:8000/storage/';

    useEffect(() => {
        setLoading(true);
        api.get(`/berita/${slug}`)
            .then(res => {
                setBerita(res.data.data);
                return api.get('/berita');
            })
            .then(res => {
                const listLainnya = res.data.data
                    .filter((b) => b.slug !== slug)
                    .slice(0, 4);
                setLainnya(listLainnya);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal memuat berita:", err);
                setLoading(false);
            });
    }, [slug]);

    if (loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Memuat berita...</div>
            </div>
        );
    }

    if (!berita) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 }}>
                <i className="fas fa-newspaper" style={{ fontSize: 48, color: 'var(--teal-300)' }} />
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Berita tidak ditemukan</h2>
                <Link to="/berita" className="btn btn-primary">Kembali ke Berita</Link>
            </div>
        );
    }

    // Fungsi pembantu untuk mengambil kalimat pertama saja
    // Cari titik pertama untuk memisahkan kalimat
    const fullContent = berita.konten || "";
    const firstDotIndex = fullContent.indexOf('.');

    let highlightText = fullContent;
    let remainingContent = "";

    if (firstDotIndex !== -1) {
        highlightText = fullContent.substring(0, firstDotIndex + 1);
        remainingContent = fullContent.substring(firstDotIndex + 1).trim();
    }

    const handleWhatsAppShare = () => {
        const url = window.location.href; // Mengambil link berita saat ini
        const text = `Baca berita terbaru: *${berita.judul}*\n\nCek selengkapnya di sini:\n${url}`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    };

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 32, flexWrap: 'wrap' }}>
                    <Link to="/" style={{ color: 'var(--teal-600)' }}>Beranda</Link>
                    <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                    <Link to="/berita" style={{ color: 'var(--teal-600)' }}>Berita</Link>
                    <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                    <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{berita.judul}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
                    <article>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
                            <img
                                src={`${BASE_IMAGE_URL}${berita.thumbnail}`}
                                alt={berita.judul}
                                style={{ width: '100%', aspectRatio: '16/6', objectFit: 'cover' }}
                            />

                            <div style={{ padding: '40px 48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                    <span className={`berita-tag tag-${berita.kategori}`}>
                                        <i className="fas fa-tag" /> {berita.kategori}
                                    </span>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <i className="fas fa-calendar" /> {formatTanggal(berita.published_at)}
                                    </span>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <i className="fas fa-user" /> {berita.publisher}
                                    </span>
                                </div>

                                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,3vw,32px)', color: 'var(--dark)', lineHeight: 1.3, marginBottom: 24 }}>
                                    {berita.judul}
                                </h1>

                                {/* MODIFIKASI: Mengambil kalimat pertama & Justify */}
                                <p style={{ 
                                    fontSize: 17, 
                                    color: 'var(--text-dark)', 
                                    lineHeight: 1.8, 
                                    fontWeight: 500, 
                                    borderLeft: '4px solid var(--teal-500)', 
                                    marginBottom: 28, 
                                    background: 'var(--teal-50)', 
                                    padding: '20px 24px 20px 32px', // Padding kiri 32px agar tidak nempel garis
                                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                    textAlign: 'justify' 
                                }}>
                                    {highlightText}
                                </p>

                                {/* MODIFIKASI: Konten Utama Justify */}
                                <div style={{ 
                                    fontSize: 15, 
                                    color: 'var(--text-muted)', 
                                    lineHeight: 1.9, 
                                    whiteSpace: 'pre-line',
                                    textAlign: 'justify' 
                                }}>
                                    {remainingContent}
                                </div>

                                <div style={{ 
                                    marginTop: 40, 
                                    paddingTop: 28, 
                                    borderTop: '1px solid var(--border)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 16, 
                                    flexWrap: 'wrap' 
                                }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Bagikan berita:</span>
                                    
                                    <button
                                        onClick={handleWhatsAppShare}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 10, 
                                            padding: '10px 20px', 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            background: '#25D366', // Warna asli WhatsApp
                                            color: 'white', 
                                            cursor: 'pointer', 
                                            fontSize: 14, 
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#128C7E';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = '#25D366';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="fab fa-whatsapp" style={{ fontSize: 18 }} />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    <aside style={{ position: 'sticky', top: 100 }}>
                        {/* Sidebar berita lainnya tetap sama */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', padding: 24, marginBottom: 20 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--dark)', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--border)' }}>
                                <i className="fas fa-newspaper" style={{ color: 'var(--teal-500)', marginRight: 8 }} />
                                Berita Lainnya
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {lainnya.map((b) => (
                                    <Link key={b.id} to={`/berita/${b.slug}`} style={{ display: 'flex', gap: 12, textDecoration: 'none' }}>
                                        <img
                                            src={`${BASE_IMAGE_URL}${b.thumbnail}`}
                                            alt={b.judul}
                                            style={{ width: 72, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                                        />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {b.judul}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                <i className="fas fa-calendar" /> {new Date(b.published_at).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to="/berita" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            <i className="fas fa-arrow-left" /> Semua Berita
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}