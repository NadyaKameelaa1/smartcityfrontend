// src/pages/PejabatPage.jsx
import { useEffect, useRef } from 'react';
import { profilData } from '../data/mockData';

// ── Data statis OPD — sesuaikan dengan data asli dari DB (profil_pejabat) ───
const OPD = [
    { nama: 'Drs. H. Bambang Widianto, M.Si',     jabatan: 'Sekretaris Daerah',      foto: '/img/pejabat/sekda.jpg'    },
    { nama: 'Ir. Siti Rahayu, M.T.',              jabatan: 'Kepala Bappeda',          foto: '/img/pejabat/bappeda.jpg'  },
    { nama: 'Drs. Ahmad Fauzi, M.M.',             jabatan: 'Kepala Dinas Pendidikan', foto: '/img/pejabat/disdik.jpg'   },
    { nama: 'dr. Hj. Sri Wahyuni, M.Kes.',        jabatan: 'Kepala Dinas Kesehatan',  foto: '/img/pejabat/dinkes.jpg'   },
    { nama: 'Ir. Budi Santoso, M.T.',             jabatan: 'Kepala DPUPR',            foto: '/img/pejabat/dpupr.jpg'    },
    { nama: 'Hj. Rina Kusuma Dewi, S.E., M.Si.',  jabatan: 'Kepala Dinas Pariwisata', foto: '/img/pejabat/dispar.jpg'   },
];

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
function FadeIn({ children }) {
    const ref = useFadeIn();
    return <div ref={ref} className="fade-in-up">{children}</div>;
}

export default function PejabatPage() {
    const pemimpin = [profilData.bupati, profilData.wakil].filter(Boolean);

    const stats = [
        { num: 2,          label: 'Pimpinan Daerah'  },
        { num: OPD.length, label: 'Kepala OPD'        },
        { num: 18,         label: 'Kecamatan'         },
        { num: 239,        label: 'Desa / Kelurahan'  },
    ];

    return (
        <div className="page-pejabat">

            {/* ── Hero ── */}
            <div className="page-hero-v2 page-hero-v2--pejabat">
                <div className="page-hero-v2__overlay" />
                <div className="page-hero-v2__pattern" />
                <div className="page-hero-v2__deco">
                    {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                </div>
                <div className="container page-hero-v2__content">
                    <div className="page-hero-v2__label">
                        <i className="fas fa-user-tie" /> Pemerintahan
                    </div>
                    <h1 className="page-hero-v2__title">Profil Pejabat Daerah</h1>
                    <p className="page-hero-v2__desc">
                        Pemimpin dan pejabat yang mengabdi untuk Kabupaten Purbalingga yang maju dan sejahtera.
                    </p>
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

                {/* Pimpinan Utama */}
                <FadeIn>
                    <div className="page-section-label">
                        <i className="fas fa-star" /> Pimpinan Daerah
                    </div>
                    <div className="pejabat-grid" style={{ maxWidth: '100%', marginBottom: 56 }}>
                        {pemimpin.map(p => (
                            <div className="pejabat-card" key={p.nama}>
                                <div className="pejabat-photo">
                                    <img
                                        src={p.foto} alt={p.nama}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '3/2' }}
                                    />
                                </div>
                                <div className="pejabat-info">
                                    <div className="pejabat-jabatan">{p.jabatan}</div>
                                    <div className="pejabat-name">{p.nama}</div>
                                    <div className="pejabat-periode">{p.periode}</div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
                                        {p.deskripsi}
                                    </p>
                                    {p.visi && (
                                        <div style={{
                                            marginTop: 16, padding: '12px 16px',
                                            background: 'var(--teal-50)', borderRadius: 'var(--radius-md)',
                                            borderLeft: '3px solid var(--teal-500)'
                                        }}>
                                            <div style={{
                                                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: 1, color: 'var(--teal-700)', marginBottom: 6
                                            }}>Visi</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                                "{p.visi}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </FadeIn>

                {/* OPD */}
                <FadeIn>
                    <div className="page-section-label">
                        <i className="fas fa-sitemap" /> Kepala OPD
                    </div>
                    <div className="opd-grid">
                        {OPD.map(o => (
                            <div className="opd-card" key={o.nama}>
                                <div className="opd-card__photo">
                                    <img
                                        src={o.foto} alt={o.nama}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="opd-card__initials" style={{ display: 'none' }}>
                                        {o.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                                    </div>
                                </div>
                                <div className="opd-card__info">
                                    <div className="opd-card__jabatan">{o.jabatan}</div>
                                    <div className="opd-card__nama">{o.nama}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA kontak */}
                    <div className="pejabat-kontak-strip">
                        <div className="pejabat-kontak-strip__text">
                            <i className="fas fa-envelope" /> Ingin menghubungi pejabat atau instansi terkait?
                        </div>
                        <a
                            href="https://purbalinggakab.go.id/kontak"
                            target="_blank" rel="noreferrer"
                            className="btn btn-primary"
                        >
                            <i className="fas fa-paper-plane" /> Hubungi Pemkab
                        </a>
                    </div>
                </FadeIn>

            </div>
        </div>
    );
}