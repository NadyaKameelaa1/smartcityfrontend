// src/pages/WisataDetail.jsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
// import { wisataData } from '../data/mockData';
import api from '../api/axios';
import WisataCard from '../components/WisataCard';

const formatRupiah = (n) => {
    if (n === undefined || n === null) return 'Hubungi Petugas'; // Proteksi jika data kosong
    if (n === 0) return 'Gratis';
    return 'Rp ' + n.toLocaleString('id-ID');
};
const formatJam = (jam) => {
    if (!jam) return '';
    return jam.substring(0, 5).replace(':', '.');
};

const BASE_IMAGE_URL = 'http://192.168.40.128:8000/storage/';

export default function WisataDetail() {
    const { slug }   = useParams();
    const navigate   = useNavigate();
    const [imgIdx, setImgIdx] = useState(0);

    // Cari wisata berdasarkan slug (atau id sebagai fallback)
    const [w, setWisata] = useState(null);
    const [lainnya, setLainnya] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const w = wisataData.find(d => d.slug === slug || String(d.id) === slug);

    useEffect(() => {
        // setLoading(true);
        // Fetch detail wisata berdasarkan slug
        api.get(`/wisata/${slug}`)
            .then(res => {
                setWisata(res.data.data);
                // Fetch wisata lainnya untuk rekomendasi
                return api.get('/wisata');
            })
            .then(res => {
                // Filter agar wisata yang sedang dibuka tidak muncul di rekomendasi
                const all = res.data.data || res.data;
                setLainnya(all.filter(d => d.slug !== slug).slice(0, 3));
                // setLoading(false);
            })
            .catch(err => {
                console.error("Gagal load detail:", err);
                // setLoading(false);
            });
            
        // Reset scroll ke atas saat slug ganti
        window.scrollTo(0, 0);
    }, [slug]);

    if (!w) {
        return (
            <div style={{
                minHeight: '80vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 90
            }}>
                {/* <FadeIn>
                <i className="fas fa-map-signs" style={{ fontSize: 48, color: 'var(--teal-200)' }} />
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--dark)' }}>Wisata tidak ditemukan</h2>
                
                </FadeIn> */}
            </div>
        );
    }

    function useFadeIn() {
        const ref = useRef(null);
        useEffect(() => {
            const el = ref.current;
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
                { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
            );
            obs.observe(el);
            return () => obs.disconnect();
        }, []);
        return ref;
    }

    function FadeIn({ children, className = '' }) {
        const ref = useFadeIn();
        return <div ref={ref} className={`fade-in-up ${className}`}>{children}</div>;
    }

    // Galeri: pakai gambar utama + galeri tambahan kalau ada
    const galeri = [w.thumbnail];

    // Wisata lain (exclude current)
    // const lainnya = wisataData.filter(d => d.id !== w.id).slice(0, 3);

    const details = [
        { icon: 'fa-clock', label: 'Jam Operasional', val: w.jam_buka && w.jam_tutup ? `${formatJam(w.jam_buka)} – ${formatJam(w.jam_tutup)} WIB` : '08.00 – 17.00 WIB' },
        { icon: 'fa-map-marker-alt',label: 'Alamat',        val: w.alamat_lengkap || 'Purbalingga'           },
        { icon: 'fa-concierge-bell',label: 'Fasilitas',     val: w.fasilitas  || 'Tersedia'          },
        { icon: 'fa-phone',         label: 'Kontak',        val: w.kontak     || '-'                 },
    ];

    return (
        <>
            <style>{`
                .wd-page {
                    min-height: 100vh;
                    background: var(--cream);
                }

                /* ── Hero ── */
                .wd-hero {
                    position: relative;
                    height: 70vh;
                    min-height: 460px;
                    max-height: 680px;
                    overflow: hidden;
                    background: var(--teal-950);
                }
                .wd-hero__img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: opacity .4s ease;
                }
                .wd-hero__overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(10,29,61,.15) 0%,
                        rgba(10,29,61,.1)  40%,
                        rgba(10,29,61,.85) 100%
                    );
                }
                .wd-hero__back {
                    position: absolute; top: 96px; left: 0; right: 0; z-index: 5;
                }
                .wd-hero__back-inner {
                    display: flex; align-items: center;
                }
                .wd-back-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 8px 18px; border-radius: 50px;
                    background: rgba(255,255,255,.12);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,.2);
                    color: white; font-size: 13px; font-weight: 600;
                    text-decoration: none; transition: var(--transition);
                    font-family: var(--font-body);
                    cursor: pointer;
                }
                .wd-back-btn:hover {
                    background: rgba(255,255,255,.22);
                }
                .wd-hero__info {
                    position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
                    padding: 32px 0 36px;
                }
                .wd-hero__badge {
                    display: inline-block;
                    background: var(--teal-500); color: white;
                    padding: 4px 14px; border-radius: 50px;
                    font-size: 11px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 1.5px;
                    margin-bottom: 10px;
                }
                .wd-hero__title {
                    font-family: var(--font-display);
                    font-size: clamp(28px, 5vw, 48px);
                    font-weight: 700; color: white;
                    margin-bottom: 10px; line-height: 1.15;
                }
                .wd-hero__meta {
                    display: flex; align-items: center; gap: 20px;
                    font-size: 14px; color: rgba(255,255,255,.85);
                    flex-wrap: wrap;
                }
                .wd-hero__meta span { display: flex; align-items: center; gap: 6px; }
                .wd-hero__meta .star { color: #f59e0b; }

                /* Galeri thumbnail */
                .wd-thumbs {
                    position: absolute; bottom: 24px; right: 0; z-index: 5;
                    display: flex; gap: 8px;
                }
                .wd-thumb {
                    width: 60px; height: 44px; border-radius: 8px;
                    overflow: hidden; cursor: pointer;
                    border: 2px solid transparent;
                    transition: var(--transition); opacity: .7;
                    flex-shrink: 0;
                }
                .wd-thumb.active { border-color: white; opacity: 1; }
                .wd-thumb:hover  { opacity: 1; }
                .wd-thumb img    { width: 100%; height: 100%; object-fit: cover; }

                /* ── Main layout ── */
                .wd-layout {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 32px;
                    padding: 40px 0 80px;
                }

                /* ── Konten kiri ── */
                .wd-main {}
                .wd-section-title {
                    font-family: var(--font-display);
                    font-size: 18px; font-weight: 700;
                    color: var(--dark); margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid var(--teal-100);
                    display: flex; align-items: center; gap: 10px;
                }
                .wd-section-title i { color: var(--teal-500); font-size: 16px; }

                .wd-desc {
                    font-size: 15px; color: var(--text-muted);
                    line-height: 1.85; margin-bottom: 32px;
                }

                /* Detail grid */
                .wd-details {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 14px; margin-bottom: 32px;
                }
                .wd-detail-item {
                    display: flex; align-items: flex-start; gap: 12px;
                    padding: 16px; background: white;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                .wd-detail-icon {
                    width: 36px; height: 36px; border-radius: 10px;
                    background: var(--teal-50); border: 1px solid var(--teal-100);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--teal-600); font-size: 13px; flex-shrink: 0;
                }
                .wd-detail-label {
                    font-size: 11px; font-weight: 600; text-transform: uppercase;
                    letter-spacing: .5px; color: var(--text-muted); margin-bottom: 4px;
                }
                .wd-detail-val {
                    font-size: 14px; font-weight: 600; color: var(--dark); line-height: 1.4;
                }

                /* Galeri grid */
                .wd-gallery {
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    gap: 10px; margin-bottom: 32px;
                }
                .wd-gallery-item {
                    aspect-ratio: 4/3; border-radius: var(--radius-sm);
                    overflow: hidden; cursor: pointer;
                }
                .wd-gallery-item img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform .4s ease;
                }
                .wd-gallery-item:hover img { transform: scale(1.07); }

                /* Ulasan / review placeholder */
                .wd-rating-bar {
                    display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
                }
                .wd-rating-bar__label { font-size: 13px; color: var(--text-muted); width: 24px; text-align: right; }
                .wd-rating-bar__track {
                    flex: 1; height: 8px; background: var(--teal-50);
                    border-radius: 50px; overflow: hidden;
                    border: 1px solid var(--teal-100);
                }
                .wd-rating-bar__fill {
                    height: 100%; background: #f59e0b; border-radius: 50px;
                }
                .wd-rating-bar__count { font-size: 12px; color: var(--text-muted); width: 32px; }

                /* Wisata lainnya */
                .wd-other-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
                }

                /* ── Sidebar kanan ── */
                .wd-sidebar {
                    position: sticky; top: 100px;
                    display: flex; flex-direction: column; gap: 16px;
                    align-self: start;
                }

                /* Tiket card */
                .wd-ticket {
                    background: var(--teal-950);
                    border-radius: var(--radius-lg);
                    padding: 24px; color: white;
                    box-shadow: var(--shadow-lg);
                }
                .wd-ticket__head {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 12px; font-weight: 700;
                    letter-spacing: 1px; text-transform: uppercase;
                    color: var(--teal-300); margin-bottom: 20px;
                    padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,.1);
                }
                .wd-ticket__prices {
                    display: flex; gap: 0; margin-bottom: 20px;
                }
                .wd-ticket__price-item {
                    flex: 1; text-align: center; padding: 12px 0;
                }
                .wd-ticket__price-item + .wd-ticket__price-item {
                    border-left: 1px solid rgba(255,255,255,.1);
                }
                .wd-ticket__price-label {
                    font-size: 11px; opacity: .6;
                    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
                }
                .wd-ticket__price-val {
                    font-family: var(--font-display);
                    font-size: 16px; font-weight: 700; color: white;
                }
                .wd-ticket__price-val.foreign {
                    font-size: 13px;
                }
                .wd-btn-primary {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 13px;
                    border-radius: var(--radius-md);
                    background: var(--gold); color: white;
                    font-family: var(--font-body); font-size: 14px; font-weight: 700;
                    border: none; cursor: pointer; transition: var(--transition);
                    text-decoration: none; margin-bottom: 10px;
                }
                .wd-btn-primary:hover { background: #c49842; transform: translateY(-2px); }
                .wd-btn-ghost {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 11px;
                    border-radius: var(--radius-md);
                    background: rgba(255,255,255,.08);
                    border: 1px solid rgba(255,255,255,.15);
                    color: rgba(255,255,255,.8);
                    font-family: var(--font-body); font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: var(--transition); text-decoration: none;
                }
                .wd-btn-ghost:hover { background: rgba(255,255,255,.15); color: white; }

                /* Info card */
                .wd-info-card {
                    background: white; border-radius: var(--radius-lg);
                    border: 1px solid var(--border); padding: 20px;
                    box-shadow: var(--shadow-sm);
                }
                .wd-info-card__title {
                    font-size: 12px; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 1px; color: var(--teal-700);
                    margin-bottom: 14px; padding-bottom: 10px;
                    border-bottom: 1px solid var(--border);
                    display: flex; align-items: center; gap: 8px;
                }
                .wd-info-row {
                    display: flex; align-items: center; gap: 10px; margin-top: 10px;
                }
                .wd-info-ico {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: var(--teal-50); display: flex; align-items: center;
                    justify-content: center; color: var(--teal-600); font-size: 12px; flex-shrink: 0;
                }
                .wd-info-label { font-size: 11px; color: var(--text-muted); }
                .wd-info-val   { font-size: 13px; font-weight: 600; color: var(--dark); }

                /* ── Responsive ── */
                @media (max-width: 1024px) {
                    .wd-layout { grid-template-columns: 1fr; }
                    .wd-sidebar { position: static; }
                    .wd-hero { height: 55vw; min-height: 320px; }
                }
                @media (max-width: 640px) {
                    .wd-details     { grid-template-columns: 1fr; }
                    .wd-gallery     { grid-template-columns: repeat(2, 1fr); }
                    .wd-other-grid  { grid-template-columns: 1fr; }
                    .wd-thumbs      { display: none; }
                    .wd-hero__title { font-size: 24px; }
                }
            `}</style>

            <div className="wd-page">
                {/* ── Hero ── */}
                <div className="wd-hero">
                    <img
                        src={`${BASE_IMAGE_URL}${galeri[imgIdx]}`}
                        alt={w.nama}
                        className="wd-hero__img"
                        key={imgIdx}
                    />
                    <div className="wd-hero__overlay" />

                    {/* Tombol kembali */}
                    <div className="wd-hero__back">
                        <div className="container wd-hero__back-inner">
                            <button className="wd-back-btn" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left" /> Kembali
                            </button>
                        </div>
                    </div>

                    <div className="wd-hero__info">
                        <div className="container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
                                <div>
                                    <span className="wd-hero__badge">{w.kategori}</span>
                                    <h1 className="wd-hero__title">{w.nama}</h1>
                                    <div className="wd-hero__meta">
                                        <span><i className="fas fa-map-marker-alt" /> {w.alamat_lengkap}</span>
                                        <span>
                                            <i className="fas fa-star star" />
                                            {w.average_rating} ({w.total_reviews} ulasan)
                                        </span>
                                        <span>
                                            <i className="fas fa-clock" /> 
                                            {w.jam_buka && w.jam_tutup 
                                                ? `${formatJam(w.jam_buka)} – ${formatJam(w.jam_tutup)} WIB` 
                                                : '08.00 – 17.00 WIB'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="wd-layout">
                        <div className="wd-main">
                            <h2 className="wd-section-title">
                                <i className="fas fa-info-circle" /> Tentang {w.nama}
                            </h2>
                            <p className="wd-desc">{w.deskripsi}</p>

                            <h2 className="wd-section-title">
                                <i className="fas fa-list-ul" /> Informasi Lengkap
                            </h2>
                            <div className="wd-details">
                                {details.map(d => (
                                    <div className="wd-detail-item" key={d.label}>
                                        <div className="wd-detail-icon"><i className={`fas ${d.icon}`} /></div>
                                        <div>
                                            <div className="wd-detail-label">{d.label}</div>
                                            <div className="wd-detail-val">{d.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h2 className="wd-section-title" style={{ marginTop: 32 }}>
                                <i className="fas fa-star" /> Ulasan Pengunjung
                            </h2>
                            <div className="wd-info-card" style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--dark)' }}>{w.average_rating || '0'}</div>
                                    <div style={{ color: '#f59e0b', fontSize: 14 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`${i < Math.floor(w.average_rating) ? 'fas' : 'far'} fa-star`} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{w.total_reviews || 0} Ulasan</div>
                                </div>
                                
                                <div style={{ flex: 1 }}>
                                    {/* Contoh Bar Rating (Bisa kamu buat dinamis jika ada data per bintang) */}
                                    {[5, 4, 3, 2, 1].map(num => (
                                        <div className="wd-rating-bar" key={num}>
                                            <div className="wd-rating-bar__label">{num}</div>
                                            <div className="wd-rating-bar__track">
                                                <div className="wd-rating-bar__fill" style={{ width: num === 5 ? '80%' : num === 4 ? '15%' : '5%' }} />
                                            </div>
                                            <div className="wd-rating-bar__count">{num === 5 ? '80' : '0'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                            {/* Rekomendasi Wisata Lainnya pakai komponen WisataCard agar konsisten */}
                            <h2 className="wd-section-title" style={{ marginTop: 40 }}>
                                <i className="fas fa-map-marked-alt" /> Wisata Lainnya
                            </h2>
                            <div className="wd-other-grid">
                                {lainnya.map(lain => (
                                    <WisataCard key={lain.id} w={lain} />
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Kanan */}
                        <div className="wd-sidebar">
                            <div className="wd-ticket">
                                <div className="wd-ticket__head">
                                    <i className="fas fa-ticket-alt" /> Harga Tiket Masuk
                                </div>
                                <div className="wd-ticket__prices" style={{ flexDirection: 'column', gap: '10px' }}>
                                    {w.prices && w.prices.length > 0 ? (
                                        w.prices.map((p, idx) => (
                                            <div key={idx} style={{ 
                                                borderBottom: '1px solid rgba(255,255,255,0.1)', 
                                                paddingBottom: '10px',
                                                textAlign: 'left' 
                                            }}>
                                                <div style={{ fontSize: '11px', color: 'var(--teal-300)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {p.day_type === 'weekday' ? 'Senin - Jumat' : p.day_type === 'weekend' ? 'Sabtu - Minggu' : 'Hari Libur'}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                    <span style={{ fontSize: '13px' }}>Dewasa:</span>
                                                    <span className="wd-ticket__price-val">{formatRupiah(p.harga_dewasa)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '13px' }}>Anak:</span>
                                                    <span className="wd-ticket__price-val">{formatRupiah(p.harga_anak)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="wd-ticket__price-val">Harga belum tersedia</div>
                                    )}
                                </div>
                                <Link to={`/tiket?id=${w.id}`} className="wd-btn-primary">
                                    <i className="fas fa-shopping-cart" /> Beli Tiket Sekarang
                                </Link>
                                <Link 
                                    to={`/peta?nama=${encodeURIComponent(w.nama)}&lat=${w.marker?.lat}&lng=${w.marker?.lng}`} 
                                    className="wd-btn-ghost"
                                >
                                    <i className="fas fa-map-marked-alt" /> Lihat di Peta
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}