import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../api/axios"; // sesuaikan path axios kamu

// ── Style ──────────────────────────────────────────────────────────────────
const css = `
  .iw-page { animation: fadeInUp .45s ease both; }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  /* Hero card */
  .iw-hero {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    height: 340px;
    background: var(--teal-950);
    box-shadow: 0 8px 40px rgba(64,114,175,.18);
    margin-bottom: 28px;
  }
  .iw-hero__img {
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: .55;
    transition: transform .5s ease;
  }
  .iw-hero:hover .iw-hero__img { transform: scale(1.03); }
  .iw-hero__overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(10,29,61,.96) 0%, rgba(10,29,61,.3) 60%, transparent 100%);
  }
  .iw-hero__body {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 32px 36px;
    display: flex; align-items: flex-end; justify-content: space-between; gap: 20px;
  }
  .iw-hero__badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 14px; border-radius: 50px;
    background: var(--teal-500); color: white;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 10px;
  }
  .iw-hero__name {
    font-family: var(--font-display);
    font-size: clamp(22px, 3vw, 34px);
    font-weight: 700; color: white; line-height: 1.2;
    margin-bottom: 8px;
  }
  .iw-hero__loc {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; color: rgba(255,255,255,.7);
  }
  .iw-hero__loc i { color: var(--teal-300); }
  .iw-hero__rating {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
    border-radius: 16px; padding: 16px 22px; text-align: center;
    backdrop-filter: blur(10px);
    flex-shrink: 0;
  }
  .iw-hero__rating-num {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 700; color: white; line-height: 1;
  }
  .iw-hero__rating-stars { color: #f59e0b; font-size: 11px; }
  .iw-hero__rating-label { font-size: 11px; color: rgba(255,255,255,.55); margin-top: 2px; }

  /* Info cards row */
  .iw-info-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .iw-info-card {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border);
    padding: 20px 18px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: flex-start; gap: 14px;
    transition: var(--transition);
  }
  .iw-info-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .iw-info-card__icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: var(--teal-50);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; color: var(--teal-600); flex-shrink: 0;
  }
  .iw-info-card__label {
    font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
    color: var(--text-muted); margin-bottom: 4px; font-weight: 600;
  }
  .iw-info-card__val {
    font-size: 15px; font-weight: 700; color: var(--dark); line-height: 1.3;
  }

  /* Description */
  .iw-desc-card {
    background: white;
    border-radius: 20px;
    border: 1px solid var(--border);
    padding: 28px 30px;
    box-shadow: var(--shadow-sm);
    margin-bottom: 28px;
  }
  .iw-desc-card__title {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700; color: var(--dark);
    margin-bottom: 14px; display: flex; align-items: center; gap: 9px;
  }
  .iw-desc-card__title i { color: var(--teal-500); font-size: 16px; }
  .iw-desc-text {
    font-size: 14.5px; color: var(--text-muted); line-height: 1.8;
  }

  /* Harga tiket grid */
  .iw-ticket-section {
    background: linear-gradient(135deg, var(--teal-800), var(--teal-950));
    border-radius: 20px; padding: 28px 30px;
    box-shadow: var(--shadow-lg);
    margin-bottom: 28px;
  }
  .iw-ticket-section__title {
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: white;
    margin-bottom: 18px; display: flex; align-items: center; gap: 9px;
  }
  .iw-ticket-section__title i { color: var(--teal-300); }
  .iw-ticket-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  .iw-ticket-item {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px; padding: 18px 20px;
    display: flex; align-items: center; gap: 16px;
  }
  .iw-ticket-item__icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; color: var(--teal-300); flex-shrink: 0;
  }
  .iw-ticket-item__label { font-size: 11px; color: rgba(255,255,255,.5); margin-bottom: 4px; }
  .iw-ticket-item__price {
    font-family: var(--font-display);
    font-size: 19px; font-weight: 700; color: white;
  }

  /* Skeleton loader */
  .iw-skeleton { animation: shimmer 1.4s ease infinite; }
  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: .4; }
  }
  .iw-skel-block {
    background: var(--teal-100); border-radius: 12px;
  }

  /* Empty / Error */
  .iw-empty {
    text-align: center; padding: 80px 0;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .iw-empty i { font-size: 48px; color: var(--teal-200); }
  .iw-empty p { font-size: 15px; color: var(--text-muted); }

  @media (max-width: 768px) {
    .iw-info-row { grid-template-columns: repeat(2, 1fr); }
    .iw-ticket-row { grid-template-columns: 1fr; }
    .iw-hero { height: 240px; }
    .iw-hero__body { padding: 20px; flex-direction: column; align-items: flex-start; }
    .iw-hero__rating { flex-direction: row; padding: 10px 16px; gap: 10px; }
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────
const rupiah = (n) =>
  "Rp " + Number(n).toLocaleString("id-ID");

const ratingStars = (r) => {
  const full = Math.round(r || 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
};

// ── Component ──────────────────────────────────────────────────────────────
export default function InformasiWisata() {
  const [wisata, setWisata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWisata();
  }, []);

//   const fetchWisata = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // endpoint: GET /api/admin/wisata → data wisata milik staff yg login
//       const res = await api.get("/admin/wisata");
//       setWisata(res.data.data || res.data);
//     } catch (err) {
//       setError("Gagal memuat data wisata. Silakan coba lagi.");
//     } finally {
//       setLoading(false);
//     }
//   };

const fetchWisata = async () => {
    setLoading(true);
    setError(null);
    try {
      // endpoint: GET /api/admin/wisata → data wisata milik staff yg login
      const res = await api.get("/admin/wisata");
      setWisata(res.data.data || res.data);
    } catch (err) {
      // ERROR DIABAIKAN UNTUK SEMENTARA & MENGGUNAKAN MOCK DATA AGAR TAMPILAN MUNCUL
      console.warn("API Belum siap, menggunakan mock data...");
      
      const mockData = {
        id: "WST-001",
        nama_wisata: "Owabong Waterpark",
        kategori: "Wisata Air",
        alamat: "Jl. Raya Bojongsari, Purbalingga",
        kecamatan: "Bojongsari",
        jam_buka: "08.00 – 17.00 WIB",
        rating: 4.8,
        deskripsi: "Owabong (Obyek Wisata Air Bojongsari) adalah destinasi wisata air keluarga terbesar di Jawa Tengah yang menawarkan berbagai wahana seru seperti Olympic Pool, Waterboom, dan kolam arus yang bersumber langsung dari mata air alami.",
        harga_dewasa: 35000,
        harga_anak: 25000,
        foto_url: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1200&auto=format&fit=crop"
      };

      setWisata(mockData); 
      // setError("Gagal memuat data wisata. Silakan coba lagi."); // Baris ini dikomen dulu
    } finally {
      setLoading(false);
    }
  };

  // ── Skeleton ──
  if (loading) {
    return (
      <AdminLayout>
        <style>{css}</style>
        <div className="iw-page iw-skeleton">
          <div className="iw-skel-block" style={{ height: 340, marginBottom: 28 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="iw-skel-block" style={{ height: 82 }} />
            ))}
          </div>
          <div className="iw-skel-block" style={{ height: 160, marginBottom: 28 }} />
          <div className="iw-skel-block" style={{ height: 140 }} />
        </div>
      </AdminLayout>
    );
  }

  // ── Error ──
  if (error || !wisata) {
    return (
      <AdminLayout>
        <style>{css}</style>
        <div className="iw-empty">
          <i className="fa-solid fa-triangle-exclamation" />
          <p>{error || "Data wisata tidak ditemukan."}</p>
          <button
            onClick={fetchWisata}
            style={{
              padding: "10px 24px", borderRadius: 50, border: "1.5px solid var(--teal-400)",
              background: "white", color: "var(--teal-700)", fontFamily: "var(--font-body)",
              fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}
          >
            <i className="fa-solid fa-rotate-right" style={{ marginRight: 7 }} />
            Coba Lagi
          </button>
        </div>
      </AdminLayout>
    );
  }

  const foto = wisata.foto_url || wisata.gambar || "https://images.unsplash.com/photo-1570659274893-f8fc88e2d1de?w=1200&q=80";

  return (
    <AdminLayout>
      <style>{css}</style>
      <div className="iw-page">

        {/* ── Section label ── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "var(--teal-600)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <i className="fa-solid fa-mountain-sun" />
            Informasi Wisata
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--dark)" }}>
            Data Destinasi Wisata Anda
          </div>
        </div>

        {/* ── Hero Image ── */}
        <div className="iw-hero">
          <img src={foto} alt={wisata.nama_wisata} className="iw-hero__img" />
          <div className="iw-hero__overlay" />
          <div className="iw-hero__body">
            <div>
              <div className="iw-hero__badge">
                <i className="fa-solid fa-map-pin" />
                {wisata.kategori || "Wisata Alam"}
              </div>
              <div className="iw-hero__name">{wisata.nama_wisata}</div>
              <div className="iw-hero__loc">
                <i className="fa-solid fa-location-dot" />
                {wisata.alamat || wisata.lokasi || "Purbalingga, Jawa Tengah"}
              </div>
            </div>
            {wisata.rating && (
              <div className="iw-hero__rating">
                <div className="iw-hero__rating-num">{Number(wisata.rating).toFixed(1)}</div>
                <div className="iw-hero__rating-stars">{ratingStars(wisata.rating)}</div>
                <div className="iw-hero__rating-label">Rating</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Info cards ── */}
        <div className="iw-info-row">
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-tag" /></div>
            <div>
              <div className="iw-info-card__label">Kategori</div>
              <div className="iw-info-card__val">{wisata.kategori || "—"}</div>
            </div>
          </div>
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-location-dot" /></div>
            <div>
              <div className="iw-info-card__label">Lokasi</div>
              <div className="iw-info-card__val">{wisata.kecamatan || wisata.desa || "Purbalingga"}</div>
            </div>
          </div>
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-clock" /></div>
            <div>
              <div className="iw-info-card__label">Jam Buka</div>
              <div className="iw-info-card__val">{wisata.jam_buka || "08.00 – 17.00"}</div>
            </div>
          </div>
          <div className="iw-info-card">
            <div className="iw-info-card__icon"><i className="fa-solid fa-id-card" /></div>
            <div>
              <div className="iw-info-card__label">ID Wisata</div>
              <div className="iw-info-card__val">{wisata.id || "—"}</div>
            </div>
          </div>
        </div>

        {/* ── Deskripsi ── */}
        <div className="iw-desc-card">
          <div className="iw-desc-card__title">
            <i className="fa-solid fa-align-left" />
            Deskripsi Wisata
          </div>
          <p className="iw-desc-text">
            {wisata.deskripsi || "Deskripsi wisata belum tersedia."}
          </p>
        </div>

        {/* ── Harga Tiket ── */}
        <div className="iw-ticket-section">
          <div className="iw-ticket-section__title">
            <i className="fa-solid fa-ticket" />
            Informasi Harga Tiket
          </div>
          <div className="iw-ticket-row">
            <div className="iw-ticket-item">
              <div className="iw-ticket-item__icon"><i className="fa-solid fa-person" /></div>
              <div>
                <div className="iw-ticket-item__label">Tiket Dewasa</div>
                <div className="iw-ticket-item__price">
                  {wisata.harga_dewasa != null ? rupiah(wisata.harga_dewasa) : "Rp —"}
                </div>
              </div>
            </div>
            <div className="iw-ticket-item">
              <div className="iw-ticket-item__icon"><i className="fa-solid fa-child" /></div>
              <div>
                <div className="iw-ticket-item__label">Tiket Anak</div>
                <div className="iw-ticket-item__price">
                  {wisata.harga_anak != null ? rupiah(wisata.harga_anak) : "Rp —"}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}