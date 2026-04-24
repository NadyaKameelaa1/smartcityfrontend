// src/components/Footer.jsx
import { Link } from 'react-router-dom';

const footerLinks = {
    layanan: [
        { label: 'LPSE',             href: 'https://lpse.purbalinggakab.go.id' },
        { label: 'PPID',             href: 'https://ppid.purbalinggakab.go.id' },
        { label: 'Open Data',        href: 'https://data.purbalinggakab.go.id' },
        { label: 'JDIH',             href: 'https://jdih.purbalinggakab.go.id' },
        { label: 'Lapor Mas Bupati', href: 'https://lapor.go.id' },
    ],
    informasi: [
        { label: 'Profil Daerah',  href: '/#profil' },
        { label: 'Berita Terkini', href: '/berita' },
        { label: 'Pengumuman',     href: '/pengumuman' },
        { label: 'Event & Agenda', href: '/#event' },
        { label: 'Statistik',      href: '/#statistik' },
    ],
    wisata: [
        { label: 'Destinasi Wisata',  href: '/#wisata' },
        { label: 'Peta Wisata',       href: '/peta' },
        { label: 'Beli Tiket',        href: '/tiket' },
        { label: 'Kuliner Lokal',     href: '/#wisata' },
        { label: 'Kampung Wisata',    href: '/#wisata' },
    ],
};

const socials = [
    { icon: 'fa-facebook-f',  href: '#', label: 'Facebook' },
    { icon: 'fa-instagram',   href: '#', label: 'Instagram' },
    { icon: 'fa-twitter',     href: '#', label: 'Twitter' },
    { icon: 'fa-youtube',     href: '#', label: 'YouTube' },
    { icon: 'fa-tiktok',      href: '#', label: 'TikTok' },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div>
                        <div className="footer-logo">
                            <div className="footer-logo-emblem">
                                <i className="fas fa-city" />
                            </div>
                            <span className="footer-logo-title">Purbalingga</span>
                        </div>
                        <p className="footer-brand-desc">
                            Portal resmi informasi publik Kabupaten Purbalingga. Melayani masyarakat dengan informasi yang akurat, transparan, dan mudah diakses.
                        </p>
                        <div className="footer-socials">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    className="footer-social"
                                    aria-label={s.label}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <i className={`fab ${s.icon}`} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Layanan */}
                    <div>
                        <div className="footer-col-title">Layanan</div>
                        <ul className="footer-links">
                            {footerLinks.layanan.map((l) => (
                                <li key={l.label}>
                                    <a href={l.href} target={l.href.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                                        <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Informasi */}
                    <div>
                        <div className="footer-col-title">Informasi</div>
                        <ul className="footer-links">
                            {footerLinks.informasi.map((l) => (
                                <li key={l.label}>
                                    <Link to={l.href}>
                                        <i className="fas fa-chevron-right" style={{ fontSize: 9 }} />
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kontak */}
                    <div>
                        <div className="footer-col-title">Kontak</div>
                        <div className="footer-contact-items">
                            {[
                                { icon: 'fa-map-marker-alt', text: 'Jl. Lets Jend. S. Parman No.1, Purbalingga, Jawa Tengah 53316' },
                                { icon: 'fa-phone',          text: '(0281) 891016' },
                                { icon: 'fa-envelope',       text: 'info@purbalinggakab.go.id' },
                                { icon: 'fa-globe',          text: 'www.purbalinggakab.go.id' },
                            ].map((item) => (
                                <div className="footer-contact-item" key={item.icon}>
                                    <i className={`fas ${item.icon}`} />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom">
                    <span>© {currentYear} Pemerintah Kabupaten Purbalingga. All rights reserved.</span>
                    <div className="footer-bottom-links">
                        <Link to="/privasi">Kebijakan Privasi</Link>
                        <Link to="/syarat">Syarat & Ketentuan</Link>
                        <Link to="/peta">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}