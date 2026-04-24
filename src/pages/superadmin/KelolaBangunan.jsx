import { useState, useEffect, useRef } from "react";
import SuperAdminLayout from "./SuperAdminLayout";
import api from "../../api/axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PER_PAGE = 10;
const STATUS_LIST = ["aktif", "nonaktif", "draft"];

// Definisikan field metadata berdasarkan kategori (bisa dipindah ke file config)
const METADATA_SCHEMA = {
  "Sekolah": [
    { key: "akreditasi", label: "Akreditasi", type: "text", placeholder: "Contoh: A" },
    { key: "npsn", label: "NPSN", type: "text" },
    { key: "jenjang", label: "Jenjang", type: "select", options: ["SD", "SMP", "SMA", "SMK"] }
  ],
  "Rumah Sakit": [
    { key: "jumlah_bed", label: "Jumlah Bed", type: "number" },
    { key: "tipe_rs", label: "Tipe RS", type: "text", placeholder: "Contoh: Tipe C" }
  ],
  "CCTV": [
    { key: "provider", label: "Provider", type: "text" },
    { key: "url_stream", label: "URL Stream", type: "text" }
  ]
};

const EMPTY_FORM = {
  nama: "", category_id: "", kecamatan_id: "", desa_id: "",
  alamat: "", deskripsi: "", kontak: "", website: "",
  status: "draft", thumbnail: null,
  // Data untuk table map_markers
  latitude: -7.4478, // Default Purbalingga
  longitude: 109.3444,
  metadata: {} 
};

// Komponen Helper untuk klik di peta
function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function KelolaBangunan() {
  const [buildings, setBuildings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]); // Kecamatan
  const [villages, setVillages] = useState([]); // Desa
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [bRes, gRes, cRes, dRes, vRes] = await Promise.all([
        api.get("/super-admin/buildings"),
        api.get("/super-admin/building-groups"),
        api.get("/super-admin/building-categories"),
        api.get("/super-admin/districts"), // Data dari CSV yang sudah di-import ke DB
        api.get("/super-admin/villages"),
      ]);
      setBuildings(bRes.data.data || []);
      setGroups(gRes.data.data || []);
      setCategories(cRes.data.data || []);
      setDistricts(dRes.data.data || []);
      setVillages(vRes.data.data || []);
    } catch (err) {
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFormChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleMetadataChange = (key, val) => {
    setForm(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: val }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Append data building
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'metadata') fd.append(k, JSON.stringify(v));
        else if (v !== null) fd.append(k, v);
      });

      if (editTarget) {
        fd.append("_method", "PUT");
        await api.post(`/super-admin/buildings/${editTarget.id}`, fd);
        showToast("Bangunan berhasil diperbarui");
      } else {
        await api.post("/super-admin/buildings", fd);
        showToast("Bangunan berhasil ditambahkan");
      }
      setModalOpen(false);
      fetchInitialData();
    } catch (e) {
      showToast("Gagal menyimpan data", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Logika Cascading Dropdown Desa berdasarkan Kecamatan
  const filteredVillages = villages.filter(v => v.kecamatan_id == form.kecamatan_id);

  // Cari skema metadata berdasarkan kategori yang sedang dipilih
  const selectedCategoryName = categories.find(c => c.id == form.category_id)?.nama;
  const activeMetadataFields = METADATA_SCHEMA[selectedCategoryName] || [];

  return (
    <SuperAdminLayout>
      {/* Gunakan style CSS yang kamu berikan sebelumnya di sini */}
      <div className="kw-page">
        <div className="kw-toolbar">
          <div className="kw-search-wrap">
            <i className="fa-solid fa-magnifying-glass kw-search-icon" />
            <input 
              className="kw-search-input" 
              placeholder="Cari nama bangunan..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <button className="kw-add-btn" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>
            <i className="fa-solid fa-plus" /> Tambah Bangunan
          </button>
        </div>

        {/* Modal Form */}
        {modalOpen && (
          <div className="kw-modal-overlay">
            <div className="kw-modal" style={{ maxWidth: '800px' }}>
              <div className="kw-modal-header">
                <div className="kw-modal-header-left">
                  <div className="kw-modal-header-icon"><i className="fa-solid fa-city" /></div>
                  <div>
                    <div className="kw-modal-title">{editTarget ? 'Edit' : 'Tambah'} Bangunan</div>
                    <div className="kw-modal-sub">Input data bangunan Smart City Purbalingga</div>
                  </div>
                </div>
                <button className="kw-modal-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark" /></button>
              </div>

              <div className="kw-modal-body">
                <div className="kw-modal-section-label">Informasi Dasar</div>
                <div className="kw-field">
                  <label className="kw-label">Nama Bangunan <span className="kw-required">*</span></label>
                  <input 
                    className="kw-input" 
                    value={form.nama} 
                    onChange={(e) => handleFormChange('nama', e.target.value)} 
                  />
                </div>

                <div className="kw-field-row">
                  <div className="kw-field">
                    <label className="kw-label">Kategori</label>
                    <select 
                      className="kw-select" 
                      value={form.category_id} 
                      onChange={(e) => handleFormChange('category_id', e.target.value)}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                  </div>
                  <div className="kw-field">
                    <label className="kw-label">Status</label>
                    <select className="kw-select" value={form.status} onChange={(e) => handleFormChange('status', e.target.value)}>
                      {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="kw-modal-section-label">Lokasi & Pemetaan</div>
                <div className="kw-field-row">
                  <div className="kw-field">
                    <label className="kw-label">Kecamatan</label>
                    <select 
                      className="kw-select" 
                      value={form.kecamatan_id} 
                      onChange={(e) => handleFormChange('kecamatan_id', e.target.value)}
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                    </select>
                  </div>
                  <div className="kw-field">
                    <label className="kw-label">Desa</label>
                    <select 
                      className="kw-select" 
                      value={form.desa_id} 
                      onChange={(e) => handleFormChange('desa_id', e.target.value)}
                      disabled={!form.kecamatan_id}
                    >
                      <option value="">Pilih Desa</option>
                      {filteredVillages.map(v => <option key={v.id} value={v.id}>{v.nama}</option>)}
                    </select>
                  </div>
                </div>

                {/* Leaflet Map Picker */}
                <div className="kw-field">
                  <label className="kw-label">Tentukan Titik Koordinat (Klik di Peta)</label>
                  <div style={{ height: '250px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <MapContainer center={[form.latitude, form.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker 
                        position={[form.latitude, form.longitude]} 
                        setPosition={(pos) => {
                          handleFormChange('latitude', pos[0]);
                          handleFormChange('longitude', pos[1]);
                        }} 
                      />
                    </MapContainer>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                     <code style={{ fontSize: '11px', background: '#eee', padding: '2px 6px' }}>Lat: {form.latitude}</code>
                     <code style={{ fontSize: '11px', background: '#eee', padding: '2px 6px' }}>Lng: {form.longitude}</code>
                  </div>
                </div>

                {/* Dynamic Metadata Section */}
                {activeMetadataFields.length > 0 && (
                  <>
                    <div className="kw-modal-section-label">Detail Spesifik ({selectedCategoryName})</div>
                    <div className="kw-field-row">
                      {activeMetadataFields.map(field => (
                        <div className="kw-field" key={field.key}>
                          <label className="kw-label">{field.label}</label>
                          {field.type === 'select' ? (
                            <select 
                              className="kw-select" 
                              onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                            >
                              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type={field.type} 
                              className="kw-input" 
                              placeholder={field.placeholder}
                              onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="kw-modal-footer">
                <button className="kw-modal-cancel" onClick={() => setModalOpen(false)}>Batal</button>
                <button className="kw-modal-submit" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <div className="kw-spinner" /> : <i className="fa-solid fa-floppy-disk" />} Simpan Bangunan
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Table List (Sama seperti contoh KelolaWisata kamu) */}
        {/* ... render table buildings ... */}
      </div>
    </SuperAdminLayout>
  );
}