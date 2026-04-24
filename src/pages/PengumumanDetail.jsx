// src/pages/PengumumanDetail.jsx
import { useParams, Link } from 'react-router-dom';
import { pengumumanData } from '../data/mockData';
import api from '../api/axios';
import { useEffect, useState } from 'react';

const formatTanggal = (str) => {
    if (!str) return '-';
    const date = new Date(str);
    // Cek apakah date valid
    if (isNaN(date.getTime())) return str; 
    
    return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
};

const prioritasConfig = {
    mendesak:   { label: 'Prioritas Mendesak', color: '#f87171', bg: '#fef2f2'},
    sedang: { label: 'Prioritas Sedang', color: '#fbbf24', bg: '#fffbeb' },
    umum:    { label: 'Prioritas Umum', color: '#4ade80', bg: 'var(--teal-50)'},
};

export default function PengumumanDetail() {
    const { slug } = useParams();
    const [pengumuman, setPengumuman] = useState(null);
    const [lainnya, setLainnya] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        // Fetch data pengumuman berdasarkan slug
        api.get(`/pengumuman/${slug}`)
            .then(res => {
                if (isMounted) {
                    // Ambil data dari response API (biasanya res.data.data)
                    setPengumuman(res.data.data);
                    return api.get('/pengumuman');
                }
            })
            .then(res => {
                if (isMounted && res) {
                    // Filter sidebar agar tidak menampilkan pengumuman yang sedang dibuka
                    const list = res.data.data
                        .filter(p => p.slug !== slug)
                        .slice(0, 4);
                    setLainnya(list);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Gagal mengambil detail:", err);
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [slug]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader">Memuat informasi...</div>
            </div>
        );
    }

    if (!pengumuman) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 100 }}>
                <i className="fas fa-bullhorn" style={{ fontSize: 48, color: 'var(--teal-300)' }} />
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Pengumuman tidak ditemukan</h2>
                <Link to="/pengumuman" className="btn btn-primary">Kembali ke Pengumuman</Link>
            </div>
        );
    }

    const prio = prioritasConfig[pengumuman.prioritas] || prioritasConfig.umum;

    return (
        <div style={{ paddingTop: 90, paddingBottom: 80, background: 'var(--cream)', minHeight: '100vh' }}>
            <div className="container">
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 32, flexWrap: 'wrap' }}>
                    <Link to="/" style={{ color: 'var(--teal-600)' }}>Beranda</Link>
                    <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                    <Link to="/pengumuman" style={{ color: 'var(--teal-600)' }}>Pengumuman</Link>
                    <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                    <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>{pengumuman.judul}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
                    {/* ── KONTEN UTAMA ── */}
                    <article>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
                            {/* Header berwarna */}
                            <div style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))', padding: '40px 48px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                    <span style={{ background: prio.bg, color: prio.color, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600 }}>
                                        <i className="fas fa-circle" style={{ fontSize: 8, marginRight: 5 }} />{prio.label}
                                    </span>
                                    
                                    {Number(pengumuman.penting) === 1 && (
                                        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600 }}>
                                            <i className="fas fa-exclamation-circle" style={{ marginRight: 5 }} />Penting
                                        </span>
                                    )}
                                </div>

                                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,3vw,28px)', color: 'white', lineHeight: 1.3, marginBottom: 16 }}>
                                    {pengumuman.judul}
                                </h1>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'rgba(255,255,255,.65)', flexWrap: 'wrap' }}>
                                    <span><i className="fas fa-calendar" style={{ marginRight: 5 }} />{formatTanggal(pengumuman.tanggal_mulai)}</span>
                                    <span><i className="fas fa-building" style={{ marginRight: 5 }} />{pengumuman.publisher}</span>
                                </div>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '40px 48px' }}>
                                <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.9, textAlign: 'justify' }}>
                                    <p style={{ marginBottom: 16, fontSize: 16, color: 'var(--text-dark)' }}>{pengumuman.isi}</p>
                                    <p style={{ marginBottom: 16 }}>
                                        Demikian pengumuman ini disampaikan untuk diketahui dan diindahkan oleh seluruh pihak yang berkepentingan. Apabila ada pertanyaan lebih lanjut, dapat menghubungi instansi terkait.
                                    </p>
                                    <p>
                                        Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
                                    </p>
                                </div>

                                {/* Informasi Instansi */}
                                <div style={{ marginTop: 36, padding: 20, background: 'var(--teal-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--teal-100)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 48, height: 48, background: 'var(--teal-600)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className="fas fa-building" style={{ color: 'white', fontSize: 20 }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark)' }}>Diterbitkan oleh: {pengumuman.publisher}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                                            Pemerintah Kabupaten Purbalingga · {(pengumuman.tanggal_mulai)}
                                        </div>
                                    </div>
                                </div>

                                {/* Unduh lampiran (placeholder) */}
                                {pengumuman.attachment_url && (
                                    <div style={{ marginTop: 28 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 12 }}>
                                            <i className="fas fa-paperclip" style={{ color: 'var(--teal-500)', marginRight: 6 }} />Lampiran
                                        </div>
                                        <a
                                            href={pengumuman.attachment_url}
                                            target="_blank" // Membuka di tab baru
                                            rel="noopener noreferrer" // Keamanan saat membuka tab baru
                                            style={{ 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                gap: 8, 
                                                padding: '10px 20px', 
                                                background: 'white', 
                                                border: '1.5px solid var(--border)', 
                                                borderRadius: 'var(--radius-sm)', 
                                                fontSize: 13, 
                                                fontWeight: 600, 
                                                color: 'var(--teal-700)', 
                                                textDecoration: 'none', 
                                                transition: 'all .2s' 
                                            }}
                                        >
                                            <i className="fas fa-file-pdf" style={{ color: '#ef4444' }} />
                                            Unduh Dokumen Pengumuman
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>

                    {/* ── SIDEBAR ── */}
                    <aside style={{ position: 'sticky', top: 100 }}>
                        {/* Pengumuman Lainnya */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', padding: 24, marginBottom: 20 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--dark)', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--border)' }}>
                                <i className="fas fa-bullhorn" style={{ color: 'var(--teal-500)', marginRight: 8 }} />
                                Pengumuman Lainnya
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {lainnya.map((p, i) => {
                                    const pc = prioritasConfig[p.prioritas] || prioritasConfig.umum;
                                    return (
                                        <Link
                                            key={p.id}
                                            to={`/pengumuman/${p.slug}`}
                                            style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < lainnya.length - 1 ? '1px solid var(--border)' : 'none', textDecoration: 'none', alignItems: 'flex-start' }}
                                        >
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc.color, flexShrink: 0, marginTop: 6 }} />
                                            <div>
                                                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {p.judul}
                                                </div>
                                                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                                                    <span><i className="fas fa-building" /> {p.publisher}</span>
                                                    <span><i className="fas fa-calendar" /> {new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pusat Pengaduan */}
                        <div style={{ background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))', borderRadius: 'var(--radius-lg)', padding: 24, color: 'white' }}>
                            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 16 }}>
                                <i className="fas fa-headset" style={{ marginRight: 8 }} />Butuh Bantuan?
                            </div>
                            <p style={{ fontSize: 13, opacity: .85, lineHeight: 1.7, marginBottom: 16 }}>Hubungi kami untuk pertanyaan seputar pengumuman ini.</p>
                            <a href="tel:02818901016" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,.15)', borderRadius: 8, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                                <i className="fas fa-phone" /> (0281) 891016
                            </a>
                            <a href="mailto:info@purbalinggakab.go.id" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(255,255,255,.15)', borderRadius: 8, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                                <i className="fas fa-envelope" /> Email Kami
                            </a>
                        </div>

                        <Link to="/pengumuman" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                            <i className="fas fa-arrow-left" /> Semua Pengumuman
                        </Link>
                    </aside>
                </div>
            </div>
        </div>
    );
}