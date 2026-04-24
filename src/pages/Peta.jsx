// src/pages/Peta.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { wisataData } from '../data/mockData';

// ─── Koordinat pusat Purbalingga ─────────────────────────────
const CENTER       = [-7.3906, 109.3647];
const ZOOM_DEFAULT = 12;
const ZOOM_FLY     = 16;

// ─── Mock data buildings ─────────────────────────────────────
const MOCK_GROUPS = [
    { id: 1, nama: 'Fasilitas Umum' },
    { id: 2, nama: 'Transportasi' },
    { id: 3, nama: 'Fasilitas Kesehatan' },
    { id: 4, nama: 'Destinasi Wisata' },
];

const MOCK_CATEGORIES = [
    { id: 1,  group_id: 1, nama: 'CCTV',               icon_marker: 'fa-video',          color_theme: '#2ecc71' },
    { id: 2,  group_id: 1, nama: 'Taman',               icon_marker: 'fa-tree',           color_theme: '#2ecc71' },
    { id: 3,  group_id: 1, nama: 'Wifi',                icon_marker: 'fa-wifi',           color_theme: '#2ecc71' },
    { id: 4,  group_id: 1, nama: 'Sarana Olahraga',     icon_marker: 'fa-running',        color_theme: '#2ecc71' },
    { id: 5,  group_id: 2, nama: 'Bus Stop',            icon_marker: 'fa-bus',            color_theme: '#3498db' },
    { id: 6,  group_id: 2, nama: 'Halte TJ',            icon_marker: 'fa-bus-alt',        color_theme: '#3498db' },
    { id: 7,  group_id: 3, nama: 'Rumah Sakit',         icon_marker: 'fa-hospital',       color_theme: '#e74c3c' },
    { id: 8,  group_id: 3, nama: 'Puskesmas',           icon_marker: 'fa-clinic-medical', color_theme: '#e74c3c' },
    { id: 9,  group_id: 3, nama: 'Klinik',              icon_marker: 'fa-stethoscope',    color_theme: '#e74c3c' },
    { id: 10, group_id: 3, nama: 'Lab Kesehatan',       icon_marker: 'fa-flask',          color_theme: '#e74c3c' },
    { id: 11, group_id: 4, nama: 'Wisata Alam',         icon_marker: 'fa-leaf',           color_theme: '#f1c40f' },
    { id: 12, group_id: 4, nama: 'Kuliner',             icon_marker: 'fa-utensils',       color_theme: '#f1c40f' },
    { id: 13, group_id: 4, nama: 'Belanja',             icon_marker: 'fa-shopping-bag',   color_theme: '#f1c40f' },
    { id: 14, group_id: 4, nama: 'Sejarah',             icon_marker: 'fa-monument',       color_theme: '#f1c40f' },
    { id: 15, group_id: 4, nama: 'Kebudayaan & Religi', icon_marker: 'fa-mosque',         color_theme: '#f1c40f' },
];

const MOCK_BUILDINGS = [
    {
        id: 1, category_id: 7, nama: 'RSUD dr. R. Goeteng Taroenadibrata',
        alamat: 'Jl. Tentara Pelajar No.1, Purbalingga',
        deskripsi: 'Rumah sakit umum daerah tipe B milik Pemerintah Kabupaten Purbalingga yang melayani masyarakat sejak 1927.',
        kontak: '(0281) 891016', website: 'https://rsud.purbalinggakab.go.id',
        thumbnail: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80',
        metadata: { jumlah_bed: 280, kelas: 'B', akreditasi: 'Paripurna' },
        lat: -7.3857, lng: 109.3621,
    },
    {
        id: 2, category_id: 8, nama: 'Puskesmas Purbalingga',
        alamat: 'Jl. Mayjend Sungkono, Purbalingga',
        deskripsi: 'Pusat kesehatan masyarakat tingkat kecamatan yang melayani wilayah Kecamatan Purbalingga.',
        kontak: '(0281) 891234', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
        metadata: { jenis: 'Rawat Inap', jam_buka: '07.00 – 14.00 WIB' },
        lat: -7.3912, lng: 109.3680,
    },
    {
        id: 3, category_id: 2, nama: 'Taman Usman Janatin',
        alamat: 'Alun-alun Purbalingga',
        deskripsi: 'Taman publik di jantung kota Purbalingga yang menjadi pusat kegiatan warga dan area bermain anak.',
        kontak: '-', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
        metadata: { luas: '2 ha', fasilitas: 'Jogging track, Playground, Gazebo' },
        lat: -7.3901, lng: 109.3648,
    },
    {
        id: 4, category_id: 5, nama: 'Terminal Bukateja',
        alamat: 'Jl. Raya Bukateja, Purbalingga',
        deskripsi: 'Terminal angkutan umum tipe C yang melayani rute dalam dan luar kota.',
        kontak: '(0281) 892000', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80',
        metadata: { tipe: 'Tipe C', kapasitas_bus: 20 },
        lat: -7.4102, lng: 109.4201,
    },
    {
        id: 5, category_id: 12, nama: 'Pasar Segamas',
        alamat: 'Jl. Komisaris Notosumarsono, Purbalingga',
        deskripsi: 'Pasar rakyat terbesar di Purbalingga dengan ratusan pedagang kuliner khas Banyumasan.',
        kontak: '(0281) 891500', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
        metadata: { jam_buka: '05.00 – 17.00 WIB', jumlah_pedagang: 450 },
        lat: -7.3880, lng: 109.3590,
    },
    {
        id: 6, category_id: 14, nama: 'Museum Jenderal Soedirman',
        alamat: 'Desa Bantarbarang, Rembang, Purbalingga',
        deskripsi: 'Museum untuk mengenang perjuangan Jenderal Besar Soedirman, pahlawan nasional kelahiran Purbalingga.',
        kontak: '(0281) 893456', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=400&q=80',
        metadata: { tiket_masuk: 'Rp 5.000', jam_buka: '08.00 – 16.00 WIB' },
        lat: -7.4234, lng: 109.3412,
    },
    {
        id: 7, category_id: 4, nama: 'GOR Mahesa Jenar',
        alamat: 'Jl. Mayjend Sungkono, Purbalingga',
        deskripsi: 'Gedung olahraga serbaguna milik Pemerintah Kabupaten Purbalingga untuk event olahraga regional.',
        kontak: '(0281) 891700', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
        metadata: { kapasitas: 3000, jenis: 'Indoor' },
        lat: -7.3940, lng: 109.3700,
    },
    {
        id: 8, category_id: 9, nama: 'Klinik Pratama Sehat Sejahtera',
        alamat: 'Jl. Letjen Suprapto No.12, Purbalingga',
        deskripsi: 'Klinik pratama swasta yang melayani pasien BPJS dan umum dengan fasilitas modern.',
        kontak: '(0281) 892345', website: null,
        thumbnail: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&q=80',
        metadata: { jam_buka: '07.00 – 21.00 WIB', layanan_bpjs: true },
        lat: -7.3870, lng: 109.3710,
    },
];

// ─── Helpers ─────────────────────────────────────────────────
const getCategoryById = (id) => MOCK_CATEGORIES.find(c => c.id === id);
const getGroupById    = (id) => MOCK_GROUPS.find(g => g.id === id);
const SIDEBAR_GROUPS  = MOCK_GROUPS.map(g => ({
    ...g,
    categories: MOCK_CATEGORIES.filter(c => c.group_id === g.id),
}));

// ─── Komponen: highlight teks yang cocok ─────────────────────
function Highlight({ text = '', query = '' }) {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark style={{ background: '#0d9488', color: 'white', borderRadius: 3, padding: '0 2px' }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </span>
    );
}

// ─── Komponen: badge kategori bangunan ───────────────────────
function CategoryBadge({ category }) {
    if (!category) return null;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
            background: category.color_theme + '28',
            color: category.color_theme,
            border: `1px solid ${category.color_theme}55`,
            flexShrink: 0, whiteSpace: 'nowrap',
        }}>
            <i className={`fas ${category.icon_marker}`} style={{ fontSize: 9 }} />
            {category.nama}
        </span>
    );
}

// ════════════════════════════════════════════════════════════
export default function Peta() {
    const [searchParams] = useSearchParams();
    const mapRef         = useRef(null);
    const instanceRef    = useRef(null);
    const markersRef     = useRef([]);
    const bldMarkersRef  = useRef([]);
    const searchWrapRef  = useRef(null);

    const [sidebarOpen,      setSidebarOpen]      = useState(true);
    const [query,            setQuery]            = useState('');
    const [searchFocused,    setSearchFocused]    = useState(false);
    const [activeCategories, setActiveCategories] = useState([]);

    // URL params
    const flyNama = searchParams.get('nama');
    const flyLat  = parseFloat(searchParams.get('lat'));
    const flyLng  = parseFloat(searchParams.get('lng'));
    const hasFly  = flyNama && !isNaN(flyLat) && !isNaN(flyLng);

    // ── Live search ──────────────────────────────────────────
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return { wisata: [], buildings: [], total: 0 };

        const wisata = wisataData.filter(w =>
            w.nama.toLowerCase().includes(q) ||
            (w.kecamatan || '').toLowerCase().includes(q) ||
            w.kategori.toLowerCase().includes(q) ||
            (w.lokasi || '').toLowerCase().includes(q)
        );

        const buildings = MOCK_BUILDINGS.filter(b => {
            const cat   = getCategoryById(b.category_id);
            const group = cat ? getGroupById(cat.group_id) : null;
            return (
                b.nama.toLowerCase().includes(q) ||
                b.alamat.toLowerCase().includes(q) ||
                b.deskripsi.toLowerCase().includes(q) ||
                (cat   && cat.nama.toLowerCase().includes(q)) ||
                (group && group.nama.toLowerCase().includes(q))
            );
        });

        return { wisata, buildings, total: wisata.length + buildings.length };
    }, [query]);

    const showDropdown = searchFocused && query.trim().length > 0;

    // ── Fly to koordinat + tutup dropdown ───────────────────
    const flyTo = (lat, lng) => {
        if (instanceRef.current) instanceRef.current.flyTo([lat, lng], ZOOM_FLY, { duration: 1.0 });
        setQuery('');
        setSearchFocused(false);
    };

    const toggleCategory = (catId) => {
        setActiveCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
    };

    // ── Init Leaflet ─────────────────────────────────────────
    useEffect(() => {
        const L = window.L;
        if (!L || !mapRef.current) return;

        if (instanceRef.current) {
            if (hasFly) instanceRef.current.flyTo([flyLat, flyLng], ZOOM_FLY, { duration: 1.2 });
            return;
        }

        const map = L.map(mapRef.current, {
            center: hasFly ? [flyLat, flyLng] : CENTER,
            zoom:   hasFly ? ZOOM_FLY : ZOOM_DEFAULT,
            zoomControl: false,
        });

        L.control.zoom({ position: 'bottomleft' }).addTo(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        if (!document.getElementById('peta-style')) {
            const style = document.createElement('style');
            style.id = 'peta-style';
            style.textContent = `
                @keyframes ping {
                    0%   { transform:scale(1);opacity:.8; }
                    75%  { transform:scale(2);opacity:0; }
                    100% { transform:scale(2);opacity:0; }
                }
                .bld-popup .leaflet-popup-content-wrapper {
                    padding:0;border-radius:14px;overflow:hidden;
                    border:1px solid rgba(255,255,255,.12);
                    box-shadow:0 12px 40px rgba(0,0,0,.55);
                    background:#0f1f3d;min-width:240px;max-width:280px;
                }
                .bld-popup .leaflet-popup-tip-container { display:none; }
                .bld-popup .leaflet-popup-content { margin:0; }
                .bld-popup .leaflet-popup-close-button {
                    color:rgba(255,255,255,.6)!important;font-size:18px!important;
                    top:8px!important;right:8px!important;z-index:10;
                }
                .bld-popup .leaflet-popup-close-button:hover { color:white!important; }
                .custom-popup .leaflet-popup-content-wrapper {
                    background:rgba(10,29,61,.92);backdrop-filter:blur(10px);
                    border:1px solid rgba(255,255,255,.12);border-radius:12px;
                    box-shadow:0 8px 32px rgba(0,0,0,.5);color:white;padding:0;
                }
                .custom-popup .leaflet-popup-tip { background:rgba(10,29,61,.92); }
                .custom-popup .leaflet-popup-content { margin:0; }
                .popup-inner { padding:16px 18px; }
                .popup-badge { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5eead4;font-weight:600;margin-bottom:4px; }
                .popup-title { font-size:15px;font-weight:700;margin-bottom:4px;color:white; }
                .popup-meta  { font-size:12px;color:rgba(255,255,255,.55);margin-bottom:10px; }
                .popup-row   { display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap; }
                .popup-price { font-size:13px;font-weight:700;color:#d4a853; }
                .popup-btn   { font-size:11px;font-weight:600;padding:6px 14px;background:#0d9488;color:white;border-radius:20px;text-decoration:none;display:inline-block; }
                .popup-btn:hover { background:#0f766e; }
                .leaflet-bottom.leaflet-left { bottom:24px;left:16px; }
                .leaflet-control-zoom { border:none!important; }
                .leaflet-control-zoom a {
                    background:rgba(10,29,61,.85)!important;color:white!important;
                    border:1px solid rgba(255,255,255,.15)!important;backdrop-filter:blur(6px);
                    margin-bottom:4px!important;border-radius:8px!important;
                    width:36px!important;height:36px!important;
                    line-height:36px!important;font-size:18px!important;
                }
            `;
            document.head.appendChild(style);
        }

        const makePin = (color, iconClass, isHighlight = false) => {
            const size = isHighlight ? 36 : 30;
            const half = size / 2;
            return L.divIcon({
                html: `
                    <div style="position:relative;width:${size}px;height:${size+10}px;">
                        <div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 12px ${color}88;position:absolute;top:0;left:0;"></div>
                        <div style="position:absolute;top:${half-9}px;left:${half-8}px;color:white;font-size:12px;z-index:2;text-shadow:0 1px 3px rgba(0,0,0,.4);"><i class="fas ${iconClass}"></i></div>
                        ${isHighlight ? `<div style="position:absolute;top:-6px;left:-6px;width:${size+12}px;height:${size+12}px;border-radius:50%;border:2px solid ${color};opacity:.5;animation:ping 2s infinite;"></div>` : ''}
                    </div>`,
                iconSize:    [size, size + 10],
                iconAnchor:  [half, size + 8],
                popupAnchor: [0, -(size + 8)],
                className: '',
            });
        };

        // Wisata markers
        wisataData.forEach((w) => {
            const isTarget = hasFly && w.nama === flyNama;
            const color    = isTarget ? '#d4a853' : '#0d9488';
            const marker   = L.marker([w.lat, w.lng], { icon: makePin(color, 'fa-mountain', isTarget) })
                .addTo(map)
                .bindPopup(`
                    <div class="popup-inner">
                        <div class="popup-badge">${w.kategori}</div>
                        <div class="popup-title">${w.nama}</div>
                        <div class="popup-meta">⭐ ${w.rating} · ${w.kecamatan}</div>
                        <div class="popup-row">
                            <span class="popup-price">Mulai Rp ${w.harga_anak.toLocaleString('id-ID')}</span>
                            <a href="/tiket?id=${w.id}" class="popup-btn">🎟 Beli Tiket</a>
                        </div>
                    </div>`, { className: 'custom-popup' });
            if (isTarget) marker.openPopup();
            markersRef.current.push({ marker, wisata: w });
        });

        // Building markers
        MOCK_BUILDINGS.forEach((b) => {
            const cat = getCategoryById(b.category_id);
            if (!cat) return;
            const marker = L.marker([b.lat, b.lng], { icon: makePin(cat.color_theme, cat.icon_marker) })
                .bindPopup(`
                    <div>
                        <div style="position:relative;height:130px;overflow:hidden;background:#1a2f5e;">
                            <img src="${b.thumbnail}" alt="${b.nama}" style="width:100%;height:100%;object-fit:cover;opacity:.85;" onerror="this.style.display='none'"/>
                            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,29,61,.9) 0%,transparent 60%);"></div>
                            <div style="position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;background:${cat.color_theme};color:${cat.group_id===4?'#1a1a1a':'white'};font-size:10px;font-weight:700;padding:3px 10px;border-radius:50px;letter-spacing:.5px;text-transform:uppercase;">
                                <i class="fas ${cat.icon_marker}" style="font-size:9px;"></i>${cat.nama}</div>
                            <div style="position:absolute;bottom:8px;left:12px;right:12px;font-size:13px;font-weight:700;color:white;line-height:1.3;">${b.nama}</div>
                        </div>
                        <div style="padding:12px 14px;">
                            <div style="display:flex;gap:6px;margin-bottom:8px;"><i class="fas fa-map-marker-alt" style="color:${cat.color_theme};font-size:11px;margin-top:2px;flex-shrink:0;"></i><span style="font-size:11.5px;color:rgba(255,255,255,.65);line-height:1.4;">${b.alamat}</span></div>
                            <p style="font-size:11.5px;color:rgba(255,255,255,.55);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${b.deskripsi}</p>
                            ${b.kontak&&b.kontak!=='-'?`<div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;"><i class="fas fa-phone" style="color:${cat.color_theme};font-size:10px;"></i><span style="font-size:11px;color:rgba(255,255,255,.6);">${b.kontak}</span></div>`:''}
                            ${Object.keys(b.metadata).length>0?`<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);margin-bottom:10px;">${Object.entries(b.metadata).slice(0,3).map(([k,v])=>`<div style="padding:3px 8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:5px;font-size:10px;color:rgba(255,255,255,.6);"><span style="opacity:.6;">${k.replace(/_/g,' ')}:</span><span style="font-weight:600;color:rgba(255,255,255,.85);margin-left:3px;">${v}</span></div>`).join('')}</div>`:''}
                            <div style="display:flex;gap:6px;">
                                ${b.website?`<a href="${b.website}" target="_blank" rel="noreferrer" style="flex:1;padding:7px 0;text-align:center;background:${cat.color_theme};color:${cat.group_id===4?'#1a1a1a':'white'};border-radius:8px;font-size:11px;font-weight:700;text-decoration:none;display:block;"><i class="fas fa-external-link-alt" style="margin-right:4px;"></i>Website</a>`:''}
                                <a href="https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}" target="_blank" rel="noreferrer" style="flex:1;padding:7px 0;text-align:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.8);border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;display:block;"><i class="fas fa-directions" style="margin-right:4px;"></i>Rute</a>
                            </div>
                        </div>
                    </div>`, { className: 'bld-popup', maxWidth: 280, minWidth: 240 });

            bldMarkersRef.current.push({ marker, building: b });
        });

        instanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }, []);

    // Building marker visibility
    useEffect(() => {
        bldMarkersRef.current.forEach(({ marker, building }) => {
            if (activeCategories.length === 0) {
                marker.remove();
            } else if (activeCategories.includes(building.category_id)) {
                if (instanceRef.current) marker.addTo(instanceRef.current);
            } else {
                marker.remove();
            }
        });
    }, [activeCategories]);

    // Sidebar resize
    useEffect(() => {
        if (instanceRef.current) setTimeout(() => instanceRef.current.invalidateSize(), 320);
    }, [sidebarOpen]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
        };
    }, []);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handler = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const SIDEBAR_W = 300;

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex' }}>

            {/* Map */}
            <div ref={mapRef} style={{ flex: 1, height: '100%' }} />

            {/* Header pill */}
            <div style={{
                position: 'absolute', top: 16, left: 16, zIndex: 1000,
                background: 'rgba(10,29,61,.85)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,.12)', borderRadius: 50,
                padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14,
                color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.4)',
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontSize: 13 }}>
                    <i className="fas fa-arrow-left" /> Kembali
                </Link>
                <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fas fa-map-marked-alt" style={{ color: '#5eead4' }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Peta Purbalingga</span>
                </div>
                {hasFly && (
                    <>
                        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.2)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#d4a853' }}>
                            <i className="fas fa-location-dot" /> {flyNama}
                        </div>
                    </>
                )}
            </div>

            {/* Toggle sidebar */}
            <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                    position: 'absolute', top: '50%', zIndex: 1001,
                    right: sidebarOpen ? SIDEBAR_W : 0,
                    transform: 'translateY(-50%)',
                    width: 28, height: 56,
                    background: 'rgba(10,29,61,.9)',
                    border: '1px solid rgba(255,255,255,.15)',
                    borderRadius: '8px 0 0 8px',
                    color: 'rgba(255,255,255,.8)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, transition: 'right .3s ease', backdropFilter: 'blur(8px)',
                }}
            >
                <i className={`fas fa-chevron-${sidebarOpen ? 'right' : 'left'}`} />
            </button>

            {/* ══════════════════════════════
                SIDEBAR
            ══════════════════════════════ */}
            <div style={{
                position: 'absolute', top: 0, zIndex: 1000,
                right: sidebarOpen ? 0 : -SIDEBAR_W,
                width: SIDEBAR_W, height: '100%',
                background: 'rgba(10,29,61,.93)', backdropFilter: 'blur(14px)',
                borderLeft: '1px solid rgba(255,255,255,.1)',
                display: 'flex', flexDirection: 'column',
                transition: 'right .3s ease', color: 'white',
            }}>

                {/* ── Search header ── */}
                <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#5eead4', marginBottom: 12 }}>
                        Jelajahi Peta
                    </div>

                    {/* Search wrap */}
                    <div ref={searchWrapRef} style={{ position: 'relative' }}>

                        {/* Input box */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: searchFocused ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.07)',
                            border: `1px solid ${searchFocused ? '#0d9488' : 'rgba(255,255,255,.1)'}`,
                            borderRadius: showDropdown ? '10px 10px 0 0' : 10,
                            padding: '9px 12px', transition: 'all .2s',
                        }}>
                            <i className="fas fa-search" style={{ color: searchFocused ? '#5eead4' : 'rgba(255,255,255,.35)', fontSize: 12, flexShrink: 0, transition: 'color .2s' }} />
                            <input
                                type="text"
                                placeholder="Cari lokasi, fasilitas, wisata..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                style={{ background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 13, width: '100%' }}
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(''); setSearchFocused(false); }}
                                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1, flexShrink: 0 }}
                                >
                                    <i className="fas fa-times" />
                                </button>
                            )}
                        </div>

                        {/* ── Dropdown ── */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
                                background: 'rgba(7,18,44,.98)',
                                border: '1px solid rgba(255,255,255,.1)',
                                borderTop: '1px solid rgba(13,148,136,.3)',
                                borderRadius: '0 0 12px 12px',
                                boxShadow: '0 16px 40px rgba(0,0,0,.6)',
                                maxHeight: 380, overflowY: 'auto',
                            }}>
                                {searchResults.total === 0 ? (

                                    /* Tidak ada hasil */
                                    <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 28, color: 'rgba(255,255,255,.1)', marginBottom: 10 }}>
                                            <i className="fas fa-search-minus" />
                                        </div>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>
                                            Tidak ditemukan untuk<br />
                                            <strong style={{ color: 'rgba(255,255,255,.7)' }}>"{query}"</strong>
                                        </div>
                                    </div>

                                ) : (
                                    <>
                                        {/* Total count */}
                                        <div style={{
                                            padding: '7px 14px',
                                            fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                                            textTransform: 'uppercase', color: 'rgba(255,255,255,.3)',
                                            borderBottom: '1px solid rgba(255,255,255,.06)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}>
                                            <span>Hasil pencarian</span>
                                            <span style={{ background: 'rgba(255,255,255,.08)', padding: '1px 8px', borderRadius: 50 }}>
                                                {searchResults.total} lokasi
                                            </span>
                                        </div>

                                        {/* ── Wisata ── */}
                                        {searchResults.wisata.length > 0 && (
                                            <>
                                                <div style={{
                                                    padding: '9px 14px 5px',
                                                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                                                    textTransform: 'uppercase', color: '#5eead4',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                }}>
                                                    <i className="fas fa-mountain" style={{ fontSize: 9 }} />
                                                    Destinasi Wisata
                                                    <span style={{ background: 'rgba(13,148,136,.2)', color: '#5eead4', borderRadius: 50, padding: '1px 7px', fontSize: 9, fontWeight: 700 }}>
                                                        {searchResults.wisata.length}
                                                    </span>
                                                </div>
                                                {searchResults.wisata.map(w => (
                                                    <button
                                                        key={`w-${w.id}`}
                                                        onClick={() => flyTo(w.lat, w.lng)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 10,
                                                            width: '100%', padding: '8px 14px',
                                                            background: 'transparent', border: 'none',
                                                            cursor: 'pointer', textAlign: 'left',
                                                            borderBottom: '1px solid rgba(255,255,255,.04)',
                                                            transition: 'background .12s',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,148,136,.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        {/* Thumbnail */}
                                                        <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,.06)' }}>
                                                            <img src={w.gambar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                                                                <Highlight text={w.nama} query={query} />
                                                            </div>
                                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                <i className="fas fa-map-marker-alt" style={{ marginRight: 4, color: '#5eead4', fontSize: 9 }} />
                                                                <Highlight text={w.kecamatan || w.lokasi || ''} query={query} />
                                                            </div>
                                                        </div>
                                                        <span style={{ fontSize: 10, color: '#5eead4', background: 'rgba(13,148,136,.15)', border: '1px solid rgba(13,148,136,.3)', borderRadius: 50, padding: '2px 8px', flexShrink: 0 }}>
                                                            Wisata
                                                        </span>
                                                    </button>
                                                ))}
                                            </>
                                        )}

                                        {/* ── Buildings ── */}
                                        {searchResults.buildings.length > 0 && (
                                            <>
                                                <div style={{
                                                    padding: '9px 14px 5px',
                                                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                                                    textTransform: 'uppercase', color: '#93c5fd',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    borderTop: searchResults.wisata.length > 0 ? '1px solid rgba(255,255,255,.05)' : 'none',
                                                }}>
                                                    <i className="fas fa-building" style={{ fontSize: 9 }} />
                                                    Fasilitas & Lokasi
                                                    <span style={{ background: 'rgba(147,197,253,.12)', color: '#93c5fd', borderRadius: 50, padding: '1px 7px', fontSize: 9, fontWeight: 700 }}>
                                                        {searchResults.buildings.length}
                                                    </span>
                                                </div>
                                                {searchResults.buildings.map(b => {
                                                    const cat = getCategoryById(b.category_id);
                                                    return (
                                                        <button
                                                            key={`b-${b.id}`}
                                                            onClick={() => flyTo(b.lat, b.lng)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 10,
                                                                width: '100%', padding: '8px 14px',
                                                                background: 'transparent', border: 'none',
                                                                cursor: 'pointer', textAlign: 'left',
                                                                borderBottom: '1px solid rgba(255,255,255,.04)',
                                                                transition: 'background .12s',
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            {/* Ikon kategori */}
                                                            <div style={{
                                                                width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                                                                background: cat ? cat.color_theme + '22' : 'rgba(255,255,255,.06)',
                                                                border: cat ? `1px solid ${cat.color_theme}33` : 'none',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <i className={`fas ${cat?.icon_marker || 'fa-building'}`} style={{ color: cat?.color_theme || 'white', fontSize: 15 }} />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                                                                    <Highlight text={b.nama} query={query} />
                                                                </div>
                                                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    <i className="fas fa-map-marker-alt" style={{ marginRight: 4, color: cat?.color_theme || '#93c5fd', fontSize: 9 }} />
                                                                    <Highlight text={b.alamat} query={query} />
                                                                </div>
                                                            </div>
                                                            {cat && <CategoryBadge category={cat} />}
                                                        </button>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {/* Footer tip */}
                                        <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,.05)', fontSize: 10, color: 'rgba(255,255,255,.2)', textAlign: 'center' }}>
                                            <i className="fas fa-mouse-pointer" style={{ marginRight: 4 }} />
                                            Klik hasil untuk langsung menuju lokasi
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Kategori grid ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>

                    {activeCategories.length === 0 && (
                        <div style={{ margin: '0 12px 12px', padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>
                            <i className="fas fa-info-circle" style={{ marginRight: 5, color: '#5eead4' }} />
                            Klik ikon di bawah untuk menampilkan marker di peta
                        </div>
                    )}

                    {SIDEBAR_GROUPS.map((group) => (
                        <div key={group.id} style={{ marginBottom: 4 }}>
                            <div style={{ padding: '8px 16px 6px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
                                {group.nama}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '0 12px 12px' }}>
                                {group.categories.map((cat) => {
                                    const isActive = activeCategories.includes(cat.id);
                                    const count    = MOCK_BUILDINGS.filter(b => b.category_id === cat.id).length;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            title={cat.nama}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                                                padding: '10px 4px 8px', borderRadius: 10,
                                                border: `1.5px solid ${isActive ? cat.color_theme : 'rgba(255,255,255,.09)'}`,
                                                background: isActive ? cat.color_theme + '28' : 'rgba(255,255,255,.04)',
                                                color: isActive ? cat.color_theme : 'rgba(255,255,255,.6)',
                                                cursor: 'pointer', transition: 'all .18s', outline: 'none',
                                                position: 'relative',
                                            }}
                                        >
                                            {count > 0 && (
                                                <div style={{
                                                    position: 'absolute', top: -5, right: -5,
                                                    width: 16, height: 16, borderRadius: '50%',
                                                    background: isActive ? cat.color_theme : 'rgba(255,255,255,.18)',
                                                    color: isActive ? (cat.group_id === 4 ? '#1a1a1a' : 'white') : 'rgba(255,255,255,.8)',
                                                    fontSize: 9, fontWeight: 700,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {count}
                                                </div>
                                            )}
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: isActive ? cat.color_theme + '44' : 'rgba(255,255,255,.07)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, transition: 'all .18s',
                                            }}>
                                                <i className={`fas ${cat.icon_marker}`} />
                                            </div>
                                            <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.3, fontWeight: isActive ? 600 : 400 }}>
                                                {cat.nama}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '0 12px' }} />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.07)',
                    fontSize: 11, color: 'rgba(255,255,255,.3)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d9488' }} />
                        {wisataData.length} destinasi wisata
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ecc71' }} />
                        {MOCK_BUILDINGS.length} bangunan
                    </div>
                </div>
            </div>
        </div>
    );
}