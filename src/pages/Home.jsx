import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Home() {
  const [location, setLocation] = useState("india");
  const [detecting, setDetecting] = useState(false);

  const categories = [
    { title: "Home Cleaning", key: "Cleaning", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952" },
    { title: "Electrician", key: "Electrician", img: "https://i.postimg.cc/s2dBNzKj/electrician-working-on-electrical-panel-circuit-breaker-box.jpg" },
    { title: "Plumber", key: "Plumber", img: "https://i.postimg.cc/0Nn801Bt/Local-Plumber-Broomall-WM-Henderson-Photo.jpg" },
    { title: "AC & Appliances", key: "Appliances", img: "https://i.postimg.cc/q7v7Y7yf/hvac-technician-performing-air-conditioner-600nw-2488702851.webp" },
    { title: "Salon & Beauty (Women)", key: "Beauty", img: "https://i.postimg.cc/XJF6DM2x/Beauty-Salon-And-Spa.webp" },
    { title: "Men's Salon & Grooming", key: "Men", img: "https://i.postimg.cc/3x3QzW8C/mens-salon.jpg" },
    { title: "Painting & Wall Care", key: "Painting", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705" },
    { title: "Carpentry", key: "Carpentry", img: "https://i.postimg.cc/nVCd48RB/679c741cfd2f81997c15fb20-Featured-image.jpg" },
    { title: "Home Maintenance", key: "Maintenance", img: "https://images.unsplash.com/photo-1533451230409-6d21b7f7b284" },
    { title: "Pest Control", key: "Pest", img: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4" },
    { title: "More Services", key: "All", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" }
  ];

  // emoji icons used for compact mobile tiles (keeps assets lightweight and consistent)
  const ICONS = {
    Cleaning: '🧹',
    Electrician: '💡',
    Plumber: '🚰',
    Appliances: '❄️',
    Beauty: '💄',
    Men: '💈',
    Painting: '🎨',
    Carpentry: '🪚',
    Maintenance: '🔧',
    Pest: '🐜',
    All: '⋯'
  };

  // small sample services (used in modal quick-list)
  const SAMPLE_SERVICES = [
    { id: "1", title: "Full Home Deep Cleaning", category: "Cleaning", price: 1999, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952" },
    { id: "2", title: "AC Service & Repair", category: "Appliances", price: 699, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b" },
    { id: "3", title: "Electrician Visit", category: "Electrician", price: 249, image: "https://images.unsplash.com/photo-1582719478250-cc970d17f9d4" },
    { id: "4", title: "Plumbing Service", category: "Plumber", price: 299, image: "https://images.unsplash.com/photo-1589929460218-da4ba9f483b3" }
  ];

  const SERVICES_BY_CATEGORY = {
    Cleaning: [
      { id: 'cl1', title: 'Full Home Deep Cleaning', price: 1999, image: 'https://img.icons8.com/fluency/96/broom.png' },
      { id: 'cl2', title: 'Kitchen Deep Cleaning', price: 899, image: 'https://img.icons8.com/fluency/96/kitchen.png' },
      { id: 'cl3', title: 'Bathroom & Toilet Cleaning', price: 499, image: 'https://img.icons8.com/fluency/96/bathtub.png' },
      { id: 'cl4', title: 'Sofa Cleaning', price: 569, image: 'https://img.icons8.com/fluency/96/sofa.png' },
      { id: 'cl5', title: 'Carpet Cleaning', price: 699, image: 'https://img.icons8.com/fluency/96/carpet.png' },
      { id: 'cl6', title: 'Mattress Cleaning', price: 499, image: 'https://img.icons8.com/fluency/96/mattress.png' },
      { id: 'cl7', title: 'Window & Glass Cleaning', price: 299, image: 'https://img.icons8.com/fluency/96/window.png' },
      { id: 'cl8', title: 'Water Tank Cleaning', price: 799, image: 'https://img.icons8.com/fluency/96/water-tap.png' },
      { id: 'cl9', title: 'Move-In / Move-Out Cleaning', price: 2499, image: 'https://img.icons8.com/fluency/96/moving-truck.png' },
      { id: 'cl10', title: 'Post-Construction Cleaning', price: 2999, image: 'https://img.icons8.com/fluency/96/construction.png' }
    ],

    Electrician: [
      { id: 'el1', title: 'Switch & Socket Repair', price: 199, image: 'https://img.icons8.com/fluency/96/switch.png' },
      { id: 'el2', title: 'Fan Installation / Repair', price: 299, image: 'https://img.icons8.com/fluency/96/ceiling-fan.png' },
      { id: 'el3', title: 'Light / Chandelier Installation', price: 399, image: 'https://img.icons8.com/fluency/96/lighting.png' },
      { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://img.icons8.com/fluency/96/fuse.png' },
      { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://img.icons8.com/fluency/96/inverter.png' },
      { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://img.icons8.com/fluency/96/doorbell.png' },
      { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://img.icons8.com/fluency/96/wiring.png' },
      { id: 'el8', title: 'Short Circuit Fix', price: 399, image: 'https://img.icons8.com/fluency/96/short-circuit.png' },
      { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://img.icons8.com/fluency/96/wrench.png' }
    ],

    Plumber: [
      { id: 'pl1', title: 'Tap & Mixer Repair', price: 199, image: 'https://img.icons8.com/fluency/96/faucet.png' },
      { id: 'pl2', title: 'Basin & Sink Installation', price: 499, image: 'https://img.icons8.com/fluency/96/sink.png' },
      { id: 'pl3', title: 'Toilet Repair / Installation', price: 599, image: 'https://img.icons8.com/fluency/96/toilet.png' },
      { id: 'pl4', title: 'Pipe Leakage Fix', price: 349, image: 'https://img.icons8.com/fluency/96/leak.png' },
      { id: 'pl5', title: 'Blockage Removal', price: 399, image: 'https://img.icons8.com/fluency/96/drain.png' },
      { id: 'pl6', title: 'Water Motor Installation', price: 999, image: 'https://img.icons8.com/fluency/96/water-pump.png' },
      { id: 'pl7', title: 'Overhead Tank Pipe Work', price: 699, image: 'https://img.icons8.com/fluency/96/water-tower.png' },
      { id: 'pl8', title: 'Bathroom Fittings Installation', price: 399, image: 'https://img.icons8.com/fluency/96/shower.png' },
      { id: 'pl9', title: 'Full Plumbing Inspection', price: 499, image: 'https://img.icons8.com/fluency/96/inspection.png' }
    ],

    Appliances: [
      { id: 'ap1', title: 'AC Service', price: 699, image: 'https://img.icons8.com/fluency/96/air-conditioner.png' },
      { id: 'ap2', title: 'AC Installation', price: 999, image: 'https://img.icons8.com/fluency/96/air-conditioner.png' },
      { id: 'ap3', title: 'AC Uninstallation', price: 399, image: 'https://img.icons8.com/fluency/96/air-conditioner.png' },
      { id: 'ap4', title: 'AC Gas Refill', price: 899, image: 'https://img.icons8.com/fluency/96/gas.png' },
      { id: 'ap5', title: 'AC General Service', price: 599, image: 'https://img.icons8.com/fluency/96/gear.png' },
      { id: 'ap6', title: 'AC Repair (Split / Window)', price: 799, image: 'https://img.icons8.com/fluency/96/repair.png' },

      { id: 'ap7', title: 'Refrigerator Repair', price: 699, image: 'https://img.icons8.com/fluency/96/fridge.png' },
      { id: 'ap8', title: 'Washing Machine Repair', price: 599, image: 'https://img.icons8.com/fluency/96/washing-machine.png' },
      { id: 'ap9', title: 'Microwave Repair', price: 399, image: 'https://img.icons8.com/fluency/96/microwave.png' },
      { id: 'ap10', title: 'Geyser Repair', price: 499, image: 'https://img.icons8.com/fluency/96/geyser.png' },
      { id: 'ap11', title: 'Chimney Repair', price: 499, image: 'https://img.icons8.com/fluency/96/chimney.png' },
      { id: 'ap12', title: 'RO / Water Purifier Service', price: 599, image: 'https://img.icons8.com/fluency/96/water-purifier.png' },
      { id: 'ap13', title: 'Dishwasher Repair', price: 699, image: 'https://img.icons8.com/fluency/96/dishwasher.png' }
    ],

    Beauty: [
      { id: 'b1', title: 'Haircut & Styling', price: 399, image: 'https://i.postimg.cc/vT5Q8hGg/salon-icon.png' },
      { id: 'b2', title: 'Hair Spa', price: 599, image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png' },
      { id: 'b3', title: 'Hair Color', price: 899, image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png' },
      { id: 'b4', title: 'Facial & Cleanup', price: 499, image: 'https://i.postimg.cc/0y7C2h1L/spa-icon.png' },
      { id: 'b5', title: 'Waxing (Full / Half)', price: 399, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' },
      { id: 'b6', title: 'Manicure & Pedicure', price: 499, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' },
      { id: 'b7', title: 'Threading', price: 199, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' },
      { id: 'b8', title: 'Bridal Makeup', price: 2499, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' },
      { id: 'b9', title: 'Party Makeup', price: 1499, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png' }
    ],

    Men: [
      { id: 'm1', title: 'Haircut', price: 299, image: 'https://img.icons8.com/fluency/96/haircut.png' },
      { id: 'm2', title: 'Beard Trim & Styling', price: 249, image: 'https://img.icons8.com/fluency/96/beard.png' },
      { id: 'm3', title: 'Shave', price: 199, image: 'https://img.icons8.com/fluency/96/shave.png' },
      { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png' },
      { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png' },
      { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png' }
    ],

    Painting: [
      { id: 'pt1', title: 'Interior Painting', price: 1999, image: 'https://img.icons8.com/fluency/96/paint-palette.png' },
      { id: 'pt2', title: 'Exterior Painting', price: 2999, image: 'https://img.icons8.com/fluency/96/paint-roller.png' },
      { id: 'pt3', title: 'Wall Texture & Designer Paint', price: 3499, image: 'https://img.icons8.com/fluency/96/wall.png' },
      { id: 'pt4', title: 'Waterproofing', price: 2499, image: 'https://img.icons8.com/fluency/96/waterproofing.png' },
      { id: 'pt5', title: 'Crack Filling & Putty Work', price: 999, image: 'https://img.icons8.com/fluency/96/putty-knife.png' },
      { id: 'pt6', title: 'Wallpaper Installation', price: 699, image: 'https://img.icons8.com/fluency/96/wallpaper.png' },
      { id: 'pt7', title: 'Wall Polishing', price: 899, image: 'https://img.icons8.com/fluency/96/polish.png' }
    ],

    Carpentry: [
      { id: 'cr1', title: 'Furniture Assembly', price: 499, image: 'https://img.icons8.com/fluency/96/assembly.png' },
      { id: 'cr2', title: 'Door & Window Repair', price: 399, image: 'https://img.icons8.com/fluency/96/door.png' },
      { id: 'cr3', title: 'Modular Kitchen Repair', price: 999, image: 'https://img.icons8.com/fluency/96/kitchen.png' },
      { id: 'cr4', title: 'Bed / Wardrobe Repair', price: 599, image: 'https://img.icons8.com/fluency/96/bed.png' },
      { id: 'cr5', title: 'Lock & Hinge Installation', price: 199, image: 'https://img.icons8.com/fluency/96/lock.png' },
      { id: 'cr6', title: 'Custom Furniture Work', price: 2499, image: 'https://img.icons8.com/fluency/96/custom-furniture.png' }
    ],

    Maintenance: [
      { id: 'mt1', title: 'Handyman Services', price: 399, image: 'https://img.icons8.com/fluency/96/handyman.png' },
      { id: 'mt2', title: 'Curtain Rod Installation', price: 199, image: 'https://img.icons8.com/fluency/96/curtain.png' },
      { id: 'mt3', title: 'TV Wall Mount Installation', price: 499, image: 'https://img.icons8.com/fluency/96/installation.png' },
      { id: 'mt4', title: 'Drilling & Hanging Work', price: 249, image: 'https://img.icons8.com/fluency/96/drill.png' },
      { id: 'mt5', title: 'Bathroom Accessories Installation', price: 299, image: 'https://img.icons8.com/fluency/96/accessories.png' }
    ],

    Pest: [
      { id: 'ps1', title: 'Cockroach Control', price: 499, image: 'https://img.icons8.com/fluency/96/bug.png' },
      { id: 'ps2', title: 'Termite Control', price: 999, image: 'https://img.icons8.com/fluency/96/termite.png' },
      { id: 'ps3', title: 'Bed Bug Treatment', price: 899, image: 'https://img.icons8.com/fluency/96/bed-bug.png' },
      { id: 'ps4', title: 'Mosquito Control', price: 399, image: 'https://img.icons8.com/fluency/96/mosquito.png' },
      { id: 'ps5', title: 'Rodent Control', price: 699, image: 'https://img.icons8.com/fluency/96/rat.png' },
      { id: 'ps6', title: 'General Pest Control', price: 599, image: 'https://img.icons8.com/fluency/96/pest-control.png' }
    ]
  };

  // offers data (used in Offers carousel)
  const OFFERS = [
    { id: 1, title: 'Winter Home Care Special', subtitle: 'Get 20% off on all services', discount: '20%', cta: 'Claim Offer', img: 'https://images.unsplash.com/photo-1549187774-b4e9f043d2e3' },
    { id: 2, title: 'Deep Sofa & Upholstery Cleaning', subtitle: 'Just ₹569 - Deep clean & sanitize', discount: 'Save ₹400', cta: 'Book Now', img: 'https://images.unsplash.com/photo-1560184897-6b2d3d8a2b88' },
    { id: 3, title: 'Salon Services for Women', subtitle: 'Hair, makeup, spa - all under one app', discount: 'Starting ₹199', cta: 'Explore', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' },
    { id: 4, title: 'AC Maintenance & Service', subtitle: 'Avoid summer breakdowns - preventive care', discount: 'Full inspection ₹599', cta: 'Schedule', img: 'https://images.unsplash.com/photo-1547407969-5a0fa7a36f3d' },
    { id: 5, title: 'Complete Kitchen Deep Clean', subtitle: 'Hygienic, sparkling, and organized', discount: 'Starting ₹899', cta: 'Book Now', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c' },
    { id: 6, title: 'Home Painting Services', subtitle: 'Interior & exterior - professional quality', discount: 'Free quote', cta: 'Get Quote', img: 'https://images.unsplash.com/photo-1600607686527-6fb886090705' }
  ];

  async function getLocation() {
    // keep existing behaviour (toasts already in place) and ensure detecting state stays consistent
    if (!navigator.geolocation) {
      addToast("Location not supported by browser", 'warning');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();

          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            "Your Area";

          setLocation(city);
        } catch {
          addToast("Location lookup failed", 'error');
        }

        setDetecting(false);
      },
      () => {
        addToast("Permission denied", 'warning');
        setDetecting(false);
      }
    );
  }

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);

  function openCategoryModal(catKey) {
    setModalCategory(catKey);
    setModalOpen(true);
  }

  function viewAllCategory(catKey) {
    setModalOpen(false);
    navigate(`/services?category=${encodeURIComponent(catKey)}`);
  }

  function handleAddToCart(service) {
    addToCart({ id: service.id, title: service.title, price: service.price, image: service.image });
    addToast(`${service.title} added to cart`, 'success');
    // keep modal open so user can add multiple services like UrbanCompany's quick modal
  }

  function checkoutFromModal() {
    setModalOpen(false);
    const isLoggedIn = localStorage.getItem('auth') === 'true';
    if (!isLoggedIn) {
      // redirect user to login and after login they will be sent to checkout
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  }

  // Refs & autoplay state for offers carousel
  const offersRef = useRef(null);
  const currentOfferRef = useRef(0);
  const isPausedRef = useRef(false);
  const [offerIndex, setOfferIndex] = useState(0);

  useEffect(() => {
    const wrap = offersRef.current;
    if (!wrap) return;

    const onEnter = () => (isPausedRef.current = true);
    const onLeave = () => (isPausedRef.current = false);

    const onScroll = () => {
      const left = wrap.scrollLeft;
      let nearest = 0;
      let min = Infinity;
      Array.from(wrap.children).forEach((c, idx) => {
        const delta = Math.abs(c.offsetLeft - left);
        if (delta < min) { min = delta; nearest = idx; }
      });
      currentOfferRef.current = nearest;
      setOfferIndex(nearest);
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('scroll', onScroll, { passive: true });

    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      const count = wrap.children.length || 1;
      const next = (currentOfferRef.current + 1) % count;
      const child = wrap.children[next];
      if (child) {
        wrap.scrollTo({ left: child.offsetLeft - 6, behavior: 'smooth' });
        currentOfferRef.current = next;
        setOfferIndex(next);
      }
    }, 3500);

    document.addEventListener('visibilitychange', () => {
      isPausedRef.current = document.hidden;
    });

    return () => {
      clearInterval(interval);
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('scroll', onScroll);
    };
  }, []);

  function scrollToOffer(i) {
    const wrap = offersRef.current;
    if (!wrap) return;
    const child = wrap.children[i];
    if (!child) return;
    wrap.scrollTo({ left: child.offsetLeft - 6, behavior: 'smooth' });
    currentOfferRef.current = i;
    setOfferIndex(i);
  }

  return (
    <div>

{/* HERO SECTION */}
<section className="container hero fade-in">
  <div>

    <span className="hero-badge">⭐ 50,000+ Happy Customers in {location}</span>

    <h1 className="hero-title">HomeService99: Trusted Home Services at Your Doorstep</h1>

    <p className="hero-subtitle">
      Book verified professionals for cleaning, repairs, beauty, and maintenance in minutes. Transparent pricing, quality guaranteed, and payment after service completion.
    </p>

    <div className="search-card">

      <div className="search-location" onClick={getLocation} style={{ cursor: "pointer" }} aria-hidden="false">
        {detecting ? "Detecting location..." : `${location} · Change`}
      </div>

      <div className="search-input">
        <input aria-label="Search services" placeholder="Search services (cleaning, AC repair, salon...)" />
      </div>

      <button type="button" className="btn-primary" onClick={() => navigate('/services')} aria-label="Find professionals">Find professionals</button>
    </div>

    <div className="search-helpers">
      <div className="search-pill">Background-verified experts</div>
      <div className="search-pill">Pay securely after service</div>
    </div>

    <div className="hero-metrics">
      <span>50k+ bookings completed</span>
      <span>4.8 average rating</span>
      <span>30 min avg. response</span>
    </div>

    <div className="category-card">
      <h3 className="category-card-title">What are you looking for?</h3>

      <div className="category-grid" aria-hidden={false}>
        {categories.slice(0, 9).map((c) => (
          <button key={c.key} className="category-tile" onClick={() => openCategoryModal(c.key)} aria-label={c.title}>
            <div className="category-icon" aria-hidden="true">{ICONS[c.key] || '🔧'}</div>
            <span>{c.title}</span>
          </button>
        ))}
      </div>
    </div>

  </div>

  <div>
    <div className="hero-mosaic">
      <div className="mosaic-item large">
        <img src="https://images.unsplash.com/photo-1544717305-2782549b5136" alt="Salon" />
      </div>
      <div className="mosaic-item">
        <img src="https://images.unsplash.com/photo-1600180758890-1f7a5f3f7d3b" alt="Massage" />
      </div>
      <div className="mosaic-item">
        <img src="https://images.unsplash.com/photo-1591012911202-8862c1e9a0c6" alt="Repair" />
      </div>
      <div className="mosaic-item wide">
        <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36" alt="AC service" />
      </div>
    </div>
  </div>
</section>

{/* CATEGORY QUICK-MODAL */}
{modalOpen && (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal modal-large">
      <div className="modal-header">
        <h3 style={{ margin: 0 }}>{modalCategory} Services <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}> - Select a service</span></h3>
        <button className="btn-outline" onClick={() => setModalOpen(false)} aria-label="Close modal">✕</button>
      </div>

      <div className="modal-grid">
        {(modalCategory === 'All' ? Object.values(SERVICES_BY_CATEGORY).flat() : (SERVICES_BY_CATEGORY[modalCategory] || SAMPLE_SERVICES)).map(s => (
          <div key={s.id} className="service-tile">
            <img src={s.image} alt={s.title} className="service-icon" />
            <div className="service-tile-body">
              <strong style={{ fontSize: 14 }}>{s.title}</strong>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Starting ₹{s.price}</div>
            </div>
            <div className="service-tile-actions">
              <button className="btn-outline" onClick={() => viewAllCategory(modalCategory)}>View</button>
              <button className="btn-primary" onClick={() => handleAddToCart(s)}>Add</button>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-footer" style={{ marginTop: 16 }}>
        <button className="btn-outline" onClick={() => { setModalOpen(false); navigate('/cart'); }}>View Cart</button>
        <button className="btn-primary" onClick={() => checkoutFromModal()}>Checkout</button>
      </div>
    </div>
  </div>
)}

{/* OFFERS & DISCOUNTS */}
<section className="container slide-up offers-section">
  <h2 className="section-title">Offers & discounts</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Grab limited-time deals and curated packages</p>

  <div className="offers-wrap">
    <button className="offers-nav left" aria-label="Scroll left" onClick={() => { offersRef.current?.scrollBy({ left: -320, behavior: 'smooth' }); }}>&#8249;</button>

    <div className="offers-scroll" role="list" ref={offersRef}>
      {OFFERS.map((offer) => (
        <div className="offer-card" key={offer.id} role="listitem">
          <img src={offer.img} alt={offer.title} />
          <div className="offer-body">
            <strong>{offer.title}</strong>
            <p className="offer-sub">{offer.subtitle}</p>
            <div style={{ marginTop: 8 }}>
              <button className="btn-outline">{offer.cta}</button>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button className="offers-nav right" aria-label="Scroll right" onClick={() => { offersRef.current?.scrollBy({ left: 320, behavior: 'smooth' }); }}>&#8250;</button>

    <div className="offers-indicators" aria-hidden={OFFERS.length <= 1}>
      {OFFERS.map((o, i) => (
        <button key={o.id} className={`dot ${i === offerIndex ? 'active' : ''}`} onClick={() => scrollToOffer(i)} aria-label={`Go to offer ${i + 1}`}></button>
      ))}
    </div>
  </div>
</section>

{/* BROWSE BY CATEGORY */}
<section className="container slide-up">
  <h2 className="section-title">Browse by category</h2>
  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
    Choose from a wide range of services
  </p>

  <div className="service-grid">
    {categories.map((item, index) => (
      <div key={index} className="service-card">
        <img src={item.img} alt={item.title} />
        <strong>{item.title}</strong>
        <span className="service-price">View services</span>
      </div>
    ))}
  </div>
</section>

{/* WHY CHOOSE US */}
<section className="container slide-up">
  <h2 className="section-title">Why 50,000+ Customers Trust HomeService99</h2>
  <div className="service-grid">
    {[
      { icon: "✓", title: "Background-Verified Experts", desc: "All professionals thoroughly screened and trained" },
      { icon: "₹", title: "Transparent Pricing", desc: "No hidden charges - what you see is what you pay" },
      { icon: "⏱", title: "On-Time Service", desc: "Average 30-min response time, professional reliability" },
      { icon: "🔒", title: "Safe & Secure", desc: "Secure payments, customer protection guarantee" },
      { icon: "⭐", title: "Quality Guaranteed", desc: "4.8+ average rating from verified customer reviews" },
      { icon: "📱", title: "Easy Booking", desc: "Book in seconds, track your service in real-time" }
    ].map((item, idx) => (
      <div key={idx} className="feature-card">
        <div className="feature-icon">{item.icon}</div>
        <strong>{item.title}</strong>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>{item.desc}</p>
      </div>
    ))}
  </div>
</section>



{/* TESTIMONIALS */}
<section className="container slide-up">
  <h2 className="section-title">Loved by 50,000+ Satisfied Customers</h2>
  <div className="testimonials-grid">
    {[
      {
        name: "Priya Sharma",
        city: "Mumbai",
        service: "Home Cleaning",
        rating: 5,
        text: "Outstanding cleaning service! The team was professional and thorough. My home feels brand new. Highly recommended!",
        avatar: "👩"
      },
      {
        name: "Rajesh Patel",
        city: "Bangalore",
        service: "AC Service",
        rating: 5,
        text: "Technician arrived on time and fixed my AC efficiently. Transparent pricing, no hidden charges. Perfect experience!",
        avatar: "👨"
      },
      {
        name: "Ankit Singh",
        city: "Delhi",
        service: "Electrical Repair",
        rating: 5,
        text: "Very professional electrician. Completed the work safely and quickly. Payment after service was convenient. Will definitely hire again!",
        avatar: "👨"
      },
      {
        name: "Aadhya Nair",
        city: "Hyderabad",
        service: "Plumbing",
        rating: 5,
        text: "Quick response, professional work, and affordable pricing. The plumber explained everything clearly before starting. Excellent service!",
        avatar: "👩"
      }
    ].map((review, idx) => (
      <div key={idx} className="testimonial-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "36px" }}>{review.avatar}</span>
          <div>
            <strong style={{ display: "block", fontSize: "14px" }}>{review.name}</strong>
            <small style={{ color: "#6b7280", fontSize: "12px" }}>{review.city} • {review.service}</small>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px", marginBottom: "10px" }}>
          {[...Array(review.rating)].map((_, i) => <span key={i}>⭐</span>)}
        </div>
        <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.5", fontStyle: "italic" }}>"{review.text}"</p>
      </div>
    ))}
  </div>
</section>

{/* HOW IT WORKS */}
<section className="container slide-up" style={{ marginTop: "60px" }}>
  <h2 className="section-title">How HomeService99 Works</h2>
  <div className="how-it-works-grid">
    {[
      { step: "1", icon: "🔍", title: "Browse Services", desc: "Explore thousands of services available in your area" },
      { step: "2", icon: "📅", title: "Select Time", desc: "Choose your preferred date and time for the service" },
      { step: "3", icon: "✓", title: "Confirm Booking", desc: "Complete details and confirm your appointment" },
      { step: "4", icon: "👨‍🔧", title: "Professional Arrives", desc: "Expert arrives at your doorstep on scheduled time" },
      { step: "5", icon: "⭐", title: "Service Completed", desc: "Service delivered with quality assurance" },
      { step: "6", icon: "💰", title: "Pay & Rate", desc: "Safe payment after service + leave your review" }
    ].map((item, idx) => (
      <div key={idx} className="how-it-works-card">
        <div className="how-step-circle">{item.step}</div>
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>{item.icon}</div>
        <strong>{item.title}</strong>
        <p style={{ fontSize: "13px", color: "#6b7280", textAlign: "center" }}>{item.desc}</p>
      </div>
    ))}
  </div>
</section>

{/* FAQ SECTION */}
<section className="container slide-up" style={{ marginTop: "60px", marginBottom: "60px" }}>
  <h2 className="section-title">Frequently Asked Questions</h2>
  <div className="faq-container">
    {[
      { 
        q: "Is it safe to book services through HomeService99?", 
        a: "Yes! All professionals are background-verified, trained, and insured. We guarantee customer safety and service quality. You can pay after the service is completed."
      },
      { 
        q: "What if the professional doesn't turn up?", 
        a: "If the professional doesn't arrive within 30 minutes of the scheduled time, you'll get a full refund or we'll reschedule at no extra cost."
      },
      { 
        q: "Can I cancel my booking?", 
        a: "Yes! You can cancel free of charge up to 3 hours before the scheduled service time. Cancellations after that may incur a small fee."
      },
      { 
        q: "How are prices determined?", 
        a: "Prices are transparent and vary based on service type, duration, and location. You'll see the exact cost before confirming your booking."
      },
      { 
        q: "What if I'm not satisfied with the service?", 
        a: "We have a 100% satisfaction guarantee. If you're unhappy, contact us within 24 hours for a rework or full refund."
      },
      { 
        q: "Can I book recurring services?", 
        a: "Yes! You can set up weekly, bi-weekly, or monthly recurring bookings for services like cleaning, laundry, and maintenance at special discounted rates."
      }
    ].map((item, idx) => (
      <div key={idx} className="faq-item">
        <details className="faq-details">
          <summary className="faq-question">
            <span>❓</span> {item.q}
          </summary>
          <p className="faq-answer">{item.a}</p>
        </details>
      </div>
    ))}
  </div>
</section>

{/* CTA SECTION */}
<section className="container slide-up" style={{ marginBottom: "40px" }}>
  <div className="cta-banner">
    <h2 style={{ margin: "0 0 12px 0", fontSize: "24px" }}>Ready to Get Started?</h2>
    <p style={{ margin: "0 0 20px 0", fontSize: "15px", color: "#6b7280" }}>Book your first service in seconds. No signup required for browsing.</p>
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <button className="btn-primary" onClick={() => navigate('/services')}>Browse Services</button>
      <button className="btn-outline" onClick={() => navigate('/about')}>Learn More</button>
    </div>
  </div>
</section>

    </div>
  );
}
