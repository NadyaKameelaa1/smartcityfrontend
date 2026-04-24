// src/pages/RiwayatTiket.jsx
import { useState, useMemo, useEffect, useRef } from 'react';

// ─── Mock Data ────────────────────────────────────────────────
const mockOrders = [
    {
        id: 1, order_code: 'PBG-2025-001234',
        wisata: { nama: 'Gua Lawa', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', kategori: 'Alam' },
        tanggal_kunjungan: '2025-05-10', jumlah_anak: 2, jumlah_dewasa: 2, total_harga: 80000,
        status_tiket: 'Aktif', metode_pembayaran: 'Transfer Bank', catatan: '',
        created_at: '2025-04-28T10:30:00Z',
        items: [{ jenis: 'dewasa', jumlah: 2, harga_satuan: 25000, subtotal: 50000 }, { jenis: 'anak', jumlah: 2, harga_satuan: 15000, subtotal: 30000 }],
    },
    {
        id: 2, order_code: 'PBG-2025-000987',
        wisata: { nama: 'Owabong Water Park', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', kategori: 'Taman Air' },
        tanggal_kunjungan: '2025-04-15', jumlah_anak: 1, jumlah_dewasa: 3, total_harga: 195000,
        status_tiket: 'Digunakan', metode_pembayaran: 'QRIS', catatan: 'Tolong siapkan loker ekstra',
        created_at: '2025-04-10T08:15:00Z',
        items: [{ jenis: 'dewasa', jumlah: 3, harga_satuan: 55000, subtotal: 165000 }, { jenis: 'anak', jumlah: 1, harga_satuan: 30000, subtotal: 30000 }],
    },
    {
        id: 3, order_code: 'PBG-2025-000654',
        wisata: { nama: 'Sanggaluri Park', thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80', kategori: 'Taman' },
        tanggal_kunjungan: '2025-03-20', jumlah_anak: 0, jumlah_dewasa: 2, total_harga: 60000,
        status_tiket: 'Digunakan', metode_pembayaran: 'Transfer Bank', catatan: '',
        created_at: '2025-03-18T14:00:00Z',
        items: [{ jenis: 'dewasa', jumlah: 2, harga_satuan: 30000, subtotal: 60000 }],
    },
    {
        id: 4, order_code: 'PBG-2025-000321',
        wisata: { nama: 'Curug Silawe', thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400&q=80', kategori: 'Alam' },
        tanggal_kunjungan: '2025-06-01', jumlah_anak: 0, jumlah_dewasa: 4, total_harga: 120000,
        status_tiket: 'Aktif', metode_pembayaran: 'QRIS', catatan: '',
        created_at: '2025-04-29T09:00:00Z',
        items: [{ jenis: 'dewasa', jumlah: 4, harga_satuan: 30000, subtotal: 120000 }],
    },
    {
        id: 5, order_code: 'PBG-2024-009876',
        wisata: { nama: 'Gua Lawa', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', kategori: 'Alam' },
        tanggal_kunjungan: '2024-12-25', jumlah_anak: 3, jumlah_dewasa: 2, total_harga: 105000,
        status_tiket: 'Digunakan', metode_pembayaran: 'Transfer Bank', catatan: '',
        created_at: '2024-12-20T11:00:00Z',
        items: [{ jenis: 'dewasa', jumlah: 2, harga_satuan: 25000, subtotal: 50000 }, { jenis: 'anak', jumlah: 3, harga_satuan: 15000, subtotal: 45000 }],
    },
];

// ─── Helpers ─────────────────────────────────────────────────
const formatRupiah   = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatTanggal  = (str) => new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDateTime = (str) => new Date(str).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_TIKET = {
    Aktif:     { label: 'Aktif',     color: 'var(--teal-700)', bg: 'var(--teal-50)', border: 'var(--teal-200)', icon: 'fa-ticket-alt' },
    Digunakan: { label: 'Digunakan', color: '#6b7280',         bg: '#f9fafb',        border: '#e5e7eb',         icon: 'fa-check' },
};

const FILTER_OPTIONS = [
    { value: 'semua',     label: 'Semua' },
    { value: 'Aktif',     label: 'Aktif' },
    { value: 'Digunakan', label: 'Digunakan' },
];

// ════════════════════════════════════════════════════════════
// REVIEW TOAST — notifikasi ulasan bintang di kiri bawah
// ════════════════════════════════════════════════════════════
function ReviewToast({ order, onClose, onSubmit }) {
    const [rating,    setRating]    = useState(0);
    const [hovered,   setHovered]   = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [visible,   setVisible]   = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    const doClose = () => { setVisible(false); setTimeout(onClose, 360); };

    const handleSubmit = () => {
        if (rating === 0) return;
        setSubmitted(true);
        setTimeout(() => { onSubmit(order.id, rating); doClose(); }, 1600);
    };

    const ratingLabels = ['', 'Sangat Buruk', 'Kurang Baik', 'Cukup', 'Baik', 'Sangat Baik!'];

    return (
        <div style={{
            position: 'fixed', bottom: 28, left: 28, zIndex: 9999,
            width: 316,
            transform: visible ? 'translateY(0)' : 'translateY(110%)',
            opacity:   visible ? 1 : 0,
            transition: 'transform .4s cubic-bezier(.34,1.5,.64,1), opacity .3s ease',
            pointerEvents: visible ? 'auto' : 'none',
        }}>
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 10px 48px rgba(0,0,0,.18), 0 2px 10px rgba(0,0,0,.08)', border: '1px solid var(--border)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))', padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fas fa-star" style={{ color: '#fbbf24', fontSize: 15 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Bagaimana kunjunganmu?</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>Rating {order.wisata.nama}</div>
                        </div>
                    </div>
                    <button onClick={doClose} style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '16px 18px 18px' }}>
                    {!submitted ? (
                        <>
                            {/* Wisata info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 12px', background: 'var(--cream)', borderRadius: 10 }}>
                                <img src={order.wisata.thumbnail} alt="" style={{ width: 44, height: 44, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.wisata.nama}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                                        <i className="fas fa-calendar-check" style={{ marginRight: 4, color: 'var(--teal-500)' }} />
                                        {formatTanggal(order.tanggal_kunjungan)}
                                    </div>
                                </div>
                            </div>

                            {/* Stars */}
                            <div style={{ textAlign: 'center', marginBottom: 14 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Ketuk bintang untuk memberi rating</div>
                                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const filled = star <= (hovered || rating);
                                        return (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHovered(star)}
                                                onMouseLeave={() => setHovered(0)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 2px', lineHeight: 1, transform: filled ? 'scale(1.18)' : 'scale(1)', transition: 'transform .12s' }}
                                            >
                                                <i className={filled ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: 30, color: filled ? '#f59e0b' : '#d1d5db', transition: 'color .12s', filter: filled ? 'drop-shadow(0 2px 5px rgba(245,158,11,.4))' : 'none' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Rating label */}
                                <div style={{ fontSize: 13, fontWeight: 700, height: 18, color: rating > 0 ? '#f59e0b' : 'transparent', transition: 'color .2s' }}>
                                    {ratingLabels[hovered || rating] || '‎'}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={doClose} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    Nanti
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={rating === 0}
                                    style={{ flex: 2, padding: '9px 0', borderRadius: 10, border: 'none', background: rating > 0 ? 'linear-gradient(135deg,var(--teal-600),var(--teal-700))' : '#e5e7eb', fontSize: 13, fontWeight: 700, color: rating > 0 ? 'white' : '#9ca3af', cursor: rating > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .2s' }}
                                >
                                    <i className="fas fa-paper-plane" style={{ fontSize: 11 }} /> Kirim Ulasan
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Submitted */
                        <div style={{ textAlign: 'center', padding: '6px 0 4px' }}>
                            <div style={{ fontSize: 38, marginBottom: 8 }}>🎉</div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--dark)', marginBottom: 5 }}>Terima kasih!</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>Ulasanmu membantu wisatawan lain menentukan pilihan.</div>
                            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 12 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <i key={s} className={s <= rating ? 'fas fa-star' : 'far fa-star'} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db', fontSize: 22 }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// E-TICKET MODAL — tampil dan bisa diunduh
// ════════════════════════════════════════════════════════════
function ETicketModal({ order, onClose }) {
    const ticketRef = useRef(null);
    const isUsed    = order.status_tiket === 'Digunakan';

    const tglFormatted = new Date(order.tanggal_kunjungan + 'T12:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const handleDownload = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head>
            <title>E-Ticket ${order.order_code}</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', sans-serif; background: #f3f4f6; display: flex; flex-direction: column; align-items: center; padding: 32px 16px; min-height: 100vh; }
                .ticket { background: white; border: 2px dashed #0d9488; border-radius: 18px; padding: 28px 24px; max-width: 440px; width: 100%; position: relative; }
                .badge { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); background: #0f766e; color: white; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 5px 20px; border-radius: 0 0 12px 12px; white-space: nowrap; }
                .code { text-align: center; margin: 18px 0; }
                .code-label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
                .code-val { font-family: monospace; font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #0f766e; }
                .row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: #f0fdf4; border-radius: 10px; margin-bottom: 8px; }
                .row-icon { width: 30px; height: 30px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .row-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
                .row-val { font-size: 13px; font-weight: 600; color: #1e3c6d; }
                .status-badge { text-align: center; margin-top: 14px; }
                .status-badge span { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: 700; background: #f0fdf4; color: #0f766e; border: 1px solid #6ee7b7; }
                .print-btn { margin-top: 24px; display: block; width: 100%; max-width: 440px; padding: 12px 0; background: #0d9488; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
                @media print { .print-btn { display: none; } body { background: white; padding: 0; } }
            </style></head><body>
            <div class="ticket">
                <div class="badge">E-TICKET</div>
                <div class="code"><div class="code-label">Kode Booking</div><div class="code-val">${order.order_code}</div></div>
                ${[
                    ['fa-mountain',    'Destinasi',         order.wisata.nama],
                    ['fa-calendar',    'Tanggal Kunjungan', tglFormatted],
                    ['fa-users',       'Pengunjung',        `${order.jumlah_dewasa} Dewasa${order.jumlah_anak > 0 ? `, ${order.jumlah_anak} Anak` : ''}`],
                    ['fa-credit-card', 'Metode Pembayaran', order.metode_pembayaran],
                    ['fa-money-bill',  'Total',             formatRupiah(order.total_harga)],
                ].map(([ico, lbl, val]) => `
                    <div class="row">
                        <div class="row-icon"><i class="fas ${ico}" style="color:#0d9488;font-size:11px;"></i></div>
                        <div><div class="row-label">${lbl}</div><div class="row-val">${val}</div></div>
                    </div>`).join('')}
                <div class="status-badge"><span><i class="fas fa-ticket-alt"></i> Tiket Aktif — Berlaku Sekali Pakai</span></div>
            </div>
            <button class="print-btn" onclick="window.print()">🖨️ Print / Simpan sebagai PDF</button>
            </body></html>`);
        win.document.close();
    };

    return (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-wrap" style={{ maxWidth: 500 }}>
                <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times" /></button>
                <div className="modal" style={{ borderRadius: 'var(--radius-xl)' }}>

                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-file-alt" style={{ color: 'white', fontSize: 16 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 700 }}>E-Ticket Digital</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'white', fontWeight: 700 }}>{order.wisata.nama}</div>
                        </div>
                    </div>

                    <div style={{ padding: '22px 26px 26px' }}>

                        {/* Tiket card */}
                        <div ref={ticketRef} style={{ background: isUsed ? '#f9fafb' : 'white', border: `2px dashed ${isUsed ? '#d1d5db' : 'var(--teal-300)'}`, borderRadius: 16, padding: '22px 20px', position: 'relative', overflow: 'hidden', marginBottom: 18, opacity: isUsed ? 0.65 : 1 }}>

                            {/* Top label */}
                            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: isUsed ? '#9ca3af' : 'var(--teal-600)', color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 16px', borderRadius: '0 0 10px 10px', whiteSpace: 'nowrap' }}>
                                {isUsed ? 'SUDAH DIGUNAKAN' : 'E-TICKET'}
                            </div>

                            {/* Watermark */}
                            {isUsed && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-25deg)', fontSize: 44, fontWeight: 900, color: 'rgba(0,0,0,.05)', letterSpacing: 6, userSelect: 'none', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                                    DIGUNAKAN
                                </div>
                            )}

                            {/* Kode */}
                            <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 18 }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Kode Booking</div>
                                <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, letterSpacing: 4, color: isUsed ? '#9ca3af' : 'var(--teal-700)' }}>
                                    {order.order_code}
                                </div>
                            </div>

                            {/* Info rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { icon: 'fa-mountain',    label: 'Destinasi',         val: order.wisata.nama },
                                    { icon: 'fa-calendar',    label: 'Tanggal Kunjungan', val: tglFormatted },
                                    { icon: 'fa-users',       label: 'Pengunjung',        val: `${order.jumlah_dewasa} Dewasa${order.jumlah_anak > 0 ? `, ${order.jumlah_anak} Anak` : ''}` },
                                    { icon: 'fa-credit-card', label: 'Metode Pembayaran', val: order.metode_pembayaran },
                                    { icon: 'fa-money-bill',  label: 'Total',             val: formatRupiah(order.total_harga) },
                                ].map((row) => (
                                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: isUsed ? '#f3f4f6' : 'var(--teal-50)', borderRadius: 9 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 7, background: isUsed ? '#e5e7eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <i className={`fas ${row.icon}`} style={{ color: isUsed ? '#9ca3af' : 'var(--teal-600)', fontSize: 11 }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{row.label}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: isUsed ? '#6b7280' : 'var(--dark)' }}>{row.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Status */}
                            <div style={{ marginTop: 14, textAlign: 'center' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: isUsed ? '#f3f4f6' : 'var(--teal-50)', color: isUsed ? '#6b7280' : 'var(--teal-700)', border: `1px solid ${isUsed ? '#e5e7eb' : 'var(--teal-200)'}` }}>
                                    <i className={`fas ${isUsed ? 'fa-ban' : 'fa-shield-alt'}`} />
                                    {isUsed ? 'Tiket telah digunakan' : 'Berlaku sekali pakai'}
                                </span>
                            </div>
                        </div>

                        {/* Disclaimer jika sudah digunakan */}
                        {isUsed && (
                            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#b91c1c', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
                                <i className="fas fa-ban" style={{ marginTop: 1, flexShrink: 0 }} />
                                <span>Tiket ini sudah digunakan dan tidak dapat dipakai kembali.</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            {!isUsed && (
                                <button onClick={handleDownload} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '11px 0' }}>
                                    <i className="fas fa-download" /> Unduh E-Ticket
                                </button>
                            )}
                            <button className="btn btn-outline" style={{ flex: isUsed ? 2 : 1, justifyContent: 'center', fontSize: 13, padding: '11px 0' }} onClick={onClose}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// DETAIL MODAL
// ════════════════════════════════════════════════════════════
function DetailModal({ order, onClose, onShowETicket }) {
    if (!order) return null;
    const st     = STATUS_TIKET[order.status_tiket] || STATUS_TIKET.Aktif;
    const isUsed = order.status_tiket === 'Digunakan';
    const [showDisabledTip, setShowDisabledTip] = useState(false);

    return (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-wrap" style={{ maxWidth: 680 }}>
                <button className="modal-close-btn" onClick={onClose}><i className="fas fa-times" /></button>
                <div className="modal" style={{ borderRadius: 'var(--radius-xl)' }}>

                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, var(--teal-800), var(--teal-950))', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 700, marginBottom: 8 }}>
                                <i className="fas fa-ticket-alt" style={{ marginRight: 6 }} />Riwayat Tiket
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 4 }}>{order.wisata.nama}</div>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontFamily: 'monospace', letterSpacing: 1 }}>{order.order_code}</div>
                        </div>
                    </div>

                    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Status badge */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                <i className={`fas ${st.icon}`} /> Tiket: {st.label}
                            </span>
                        </div>

                        {/* Info grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { icon: 'fa-calendar-check', label: 'Tanggal Kunjungan', value: formatTanggal(order.tanggal_kunjungan) },
                                { icon: 'fa-credit-card',    label: 'Metode Bayar',      value: order.metode_pembayaran },
                                { icon: 'fa-clock',          label: 'Tanggal Pesan',     value: formatDateTime(order.created_at) },
                                { icon: 'fa-tag',            label: 'Kategori Wisata',   value: order.wisata.kategori },
                            ].map((item) => (
                                <div key={item.label} style={{ padding: '14px 16px', background: 'var(--teal-50)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <i className={`fas ${item.icon}`} style={{ color: 'var(--teal-500)' }} />{item.label}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Rincian tiket */}
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                                <i className="fas fa-list" style={{ color: 'var(--teal-500)', marginRight: 8 }} />Rincian Tiket
                            </div>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                    <thead>
                                        <tr style={{ background: 'var(--teal-50)' }}>
                                            {['Jenis', 'Jumlah', 'Harga/Tiket', 'Subtotal'].map((h) => (
                                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--teal-700)', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, i) => (
                                            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px 14px', textTransform: 'capitalize', fontWeight: 500 }}>{item.jenis}</td>
                                                <td style={{ padding: '12px 14px' }}>{item.jumlah} orang</td>
                                                <td style={{ padding: '12px 14px' }}>{formatRupiah(item.harga_satuan)}</td>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--teal-700)' }}>{formatRupiah(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: '2px solid var(--teal-200)', background: 'var(--teal-50)' }}>
                                            <td colSpan={3} style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>Total</td>
                                            <td style={{ padding: '12px 14px', fontWeight: 900, fontSize: 16, color: 'var(--teal-700)' }}>{formatRupiah(order.total_harga)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Catatan */}
                        {order.catatan && (
                            <div style={{ padding: '14px 16px', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: 13, color: '#92400e' }}>
                                <i className="fas fa-sticky-note" style={{ marginRight: 8 }} /><strong>Catatan:</strong> {order.catatan}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>

                            {/* ── Tombol Lihat E-Ticket ── */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => { if (!isUsed) { onShowETicket(order); } }}
                                    onMouseEnter={() => isUsed && setShowDisabledTip(true)}
                                    onMouseLeave={() => setShowDisabledTip(false)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 7,
                                        padding: '9px 18px', borderRadius: 50,
                                        fontSize: 13, fontWeight: 600,
                                        cursor: isUsed ? 'not-allowed' : 'pointer',
                                        background: isUsed ? '#f3f4f6' : 'var(--teal-600)',
                                        color: isUsed ? '#9ca3af' : 'white',
                                        border: `1.5px solid ${isUsed ? '#e5e7eb' : 'var(--teal-600)'}`,
                                        transition: 'all .2s',
                                    }}
                                >
                                    <i className={`fas ${isUsed ? 'fa-ban' : 'fa-file-alt'}`} />
                                    {isUsed ? 'E-Ticket Tidak Tersedia' : 'Lihat E-Ticket'}
                                </button>

                                {/* Tooltip saat disabled */}
                                {isUsed && showDisabledTip && (
                                    <div style={{ position: 'absolute', bottom: '115%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.82)', color: 'white', fontSize: 11, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>
                                        <i className="fas fa-info-circle" style={{ marginRight: 5 }} />Tiket sudah digunakan — tidak dapat dibuka kembali
                                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '5px solid transparent', borderTopColor: 'rgba(0,0,0,.82)' }} />
                                    </div>
                                )}
                            </div>

                            <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={onClose}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// ORDER CARD
// ════════════════════════════════════════════════════════════
function OrderCard({ order, onClick }) {
    const st         = STATUS_TIKET[order.status_tiket] || STATUS_TIKET.Aktif;
    const totalOrang = (order.jumlah_anak || 0) + (order.jumlah_dewasa || 0);
    const isUsed     = order.status_tiket === 'Digunakan';

    return (
        <div onClick={onClick} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'var(--transition)', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
            <div style={{ position: 'relative', height: 140, overflow: 'hidden', flexShrink: 0 }}>
                <img src={order.wisata.thumbnail} alt={order.wisata.nama} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isUsed ? 'grayscale(35%)' : 'none', transition: 'filter .3s' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,29,61,.7) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}`, backdropFilter: 'blur(8px)' }}>
                    <i className={`fas ${st.icon}`} /> {st.label}
                </div>
                <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 11, fontWeight: 600, color: 'white', background: 'var(--teal-600)', padding: '4px 10px', borderRadius: 50, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {order.wisata.kategori}
                </div>
            </div>
            <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--dark)', marginBottom: 4, lineHeight: 1.3 }}>{order.wisata.nama}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: 1 }}>{order.order_code}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        { icon: 'fa-calendar-check', text: formatTanggal(order.tanggal_kunjungan) },
                        { icon: 'fa-users',          text: `${totalOrang} orang` },
                        { icon: 'fa-credit-card',    text: order.metode_pembayaran },
                    ].map((item) => (
                        <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                            <i className={`fas ${item.icon}`} style={{ color: 'var(--teal-400)', width: 14, textAlign: 'center' }} /> {item.text}
                        </div>
                    ))}
                </div>
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--teal-700)' }}>{formatRupiah(order.total_harga)}</div>
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function RiwayatTiket() {
    const [filter,       setFilter]       = useState('semua');
    const [search,       setSearch]       = useState('');
    const [selected,     setSelected]     = useState(null);
    const [eTicketOrder, setETicketOrder] = useState(null);
    const [reviewToast,  setReviewToast]  = useState(null);
    const [reviewedIds,  setReviewedIds]  = useState(new Set());

    // Tampilkan review toast otomatis untuk tiket "Digunakan" pertama yang belum direview
    useEffect(() => {
        const reviewable = mockOrders.find(o => o.status_tiket === 'Digunakan' && !reviewedIds.has(o.id));
        if (reviewable && !reviewToast) {
            const t = setTimeout(() => setReviewToast(reviewable), 1400);
            return () => clearTimeout(t);
        }
    }, [reviewedIds]);

    const handleReviewSubmit = (orderId, rating) => {
        console.log(`⭐ Review: order ${orderId}, rating ${rating}/5`);
        setReviewedIds(prev => new Set([...prev, orderId]));
        setReviewToast(null);
    };

    const handleReviewClose = () => {
        if (reviewToast) setReviewedIds(prev => new Set([...prev, reviewToast.id]));
        setReviewToast(null);
    };

    const filtered = useMemo(() => {
        let data = [...mockOrders];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(o => o.wisata.nama.toLowerCase().includes(q) || o.order_code.toLowerCase().includes(q));
        }
        if (filter !== 'semua') data = data.filter(o => o.status_tiket === filter);
        return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [search, filter]);

    const stats = useMemo(() => ({
        total:          mockOrders.length,
        aktif:          mockOrders.filter(o => o.status_tiket === 'Aktif').length,
        sudahDigunakan: mockOrders.filter(o => o.status_tiket === 'Digunakan').length,
    }), []);

    return (
        <div className="page-riwayat" style={{ background: 'var(--cream)', minHeight: '100vh' }}>

            {/* ── Hero ── */}
            <div className="page-hero-v2 page-hero-v2--riwayat" style={{ background: 'linear-gradient(135deg, #102d4d 0%, #1e3c6d 55%, #284d83 100%)' }}>
                <div className="page-hero-v2__overlay" />
                <div className="page-hero-v2__pattern" />
                <div className="page-hero-v2__deco">{Array.from({ length: 25 }).map((_, i) => <span key={i} />)}</div>
                <div className="container page-hero-v2__content">
                    <div className="page-hero-v2__label"><i className="fas fa-ticket-alt" /> Tiket Saya</div>
                    <h1 className="page-hero-v2__title">Riwayat Tiket</h1>
                    <p className="page-hero-v2__desc">Kelola dan pantau semua tiket wisata yang pernah kamu pesan di Purbalingga Smart City.</p>
                    <div className="page-hero-v2__search">
                        <i className="fas fa-search page-hero-v2__search-icon" />
                        <input type="text" placeholder="Cari nama wisata atau kode order..." value={search} onChange={(e) => setSearch(e.target.value)} className="page-hero-v2__search-input" />
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="container page-body">

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Total Pesanan',   value: stats.total,          icon: 'fa-receipt',      color: 'var(--teal-600)' },
                        { label: 'Tiket Aktif',     value: stats.aktif,          icon: 'fa-ticket-alt',   color: '#16a34a' },
                        { label: 'Sudah Digunakan', value: stats.sudahDigunakan, icon: 'fa-check-circle', color: '#6b7280' },
                    ].map((s) => (
                        <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 18 }} />
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--dark)', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="page-toolbar">
                    <div className="page-filter-tabs">
                        {FILTER_OPTIONS.map((f) => (
                            <button key={f.value} className={`page-filter-tab${filter === f.value ? ' active' : ''}`} onClick={() => setFilter(f.value)}>{f.label}</button>
                        ))}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length} pesanan ditemukan</div>
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="page-empty">
                        <i className="fas fa-ticket-alt" />
                        <p>Tidak ada tiket yang sesuai filter.</p>
                        <button className="btn btn-outline" onClick={() => { setFilter('semua'); setSearch(''); }}>Reset Filter</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {filtered.map(order => <OrderCard key={order.id} order={order} onClick={() => setSelected(order)} />)}
                    </div>
                )}

                {/* CTA */}
                <div style={{ marginTop: 48, background: 'linear-gradient(135deg, var(--teal-700), var(--teal-900))', borderRadius: 'var(--radius-xl)', padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--teal-300)', fontWeight: 700, marginBottom: 8 }}><i className="fas fa-map-marked-alt" style={{ marginRight: 6 }} />Destinasi Wisata</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 6 }}>Mau liburan lagi ke Purbalingga?</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>Temukan dan pesan tiket wisata favoritmu sekarang.</div>
                    </div>
                    <a href="/wisata" className="btn btn-gold" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                        <i className="fas fa-ticket-alt" /> Pesan Tiket Baru
                    </a>
                </div>
            </div>

            {/* ── Modals & Toasts ── */}
            {selected && (
                <DetailModal
                    order={selected}
                    onClose={() => setSelected(null)}
                    onShowETicket={(order) => { setSelected(null); setETicketOrder(order); }}
                />
            )}

            {eTicketOrder && (
                <ETicketModal order={eTicketOrder} onClose={() => setETicketOrder(null)} />
            )}

            {reviewToast && (
                <ReviewToast order={reviewToast} onClose={handleReviewClose} onSubmit={handleReviewSubmit} />
            )}
        </div>
    );
}