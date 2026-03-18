import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import {
  buildServicesUrl,
  parseServicesParams,
  isValidCategory,
  normalizeCategoryKey,
} from "../utils/serviceRouting";
import "../styles/services-layout.css";

const SERVICES_PAGE_BANNER = new URL(
  "../assets/images/banner1.png",
  import.meta.url
).href;



// Complete service database with categories and subcategories
const SERVICES_DATA = {
  Cleaning: {
    icon: '🧹',
    label: 'Home Cleaning',
    subcategories: {
      'Home Cleaning': [
        { id: 'cl1', title: 'Full Home Deep Cleaning', price: 1999, image: 'https://i.postimg.cc/jdFmRtz7/Gemini-Generated-Image-kwxs91kwxs91kwxs.png', duration: '4-5 hrs', rating: 4.8, reviews: 2840, features: ['Complete cleaning of 1-3 BHK homes', 'Includes all rooms and furniture', 'Professional-grade cleaning products', 'Dust-free finish guaranteed'] },
        { id: 'cl2', title: 'Kitchen Deep Cleaning', price: 899, image: 'https://i.postimg.cc/HkSxYJ6n/Gemini-Generated-Image-20t86s20t86s20t8.png', duration: '2-3 hrs', rating: 4.7, reviews: 1920, features: ['Degreasing of all kitchen surfaces', 'Thorough oven and chimney cleaning', 'Cabinet and counter organization', 'Sink and appliance polish'] },
        { id: 'cl3', title: 'Bathroom & Toilet Cleaning', price: 499, image: 'https://i.postimg.cc/9f8JYBJQ/Gemini-Generated-Image-isvbauisvbauisvb.png', duration: '1-1.5 hrs', rating: 4.9, reviews: 3120, features: ['Deep sanitization with disinfectants', 'Scrubbing and polishing all tiles', 'Unclogging drainage if needed', 'Drain pipe cleaning'] },
        { id: 'cl4', title: 'Sofa Cleaning', price: 569, image: 'https://i.postimg.cc/rpNLV7V3/Gemini-Generated-Image-fw4oj8fw4oj8fw4o.png', duration: '1-2 hrs', rating: 4.6, reviews: 1540, features: ['Fabric-safe dry cleaning method', 'Stain removal treatment', 'Professional odor elimination', 'Protective coating application'] },
        { id: 'cl5', title: 'Carpet Cleaning', price: 699, image: 'https://i.postimg.cc/R0XbbmV3/Gemini-Generated-Image-x3ihmvx3ihmvx3ih.png', duration: '1.5-2 hrs', rating: 4.7, reviews: 1680, features: ['Wet and dry cleaning options', 'Stain and odor removal', 'Allergen elimination', 'Fast drying technology'] }
      ],
      'Specific Cleaning': [
        { id: 'cl6', title: 'Mattress Cleaning', price: 499, image: 'https://i.postimg.cc/nV0BjLSc/Gemini-Generated-Image-h4zojbh4zojbh4zo.png', duration: '1-1.5 hrs', rating: 4.5, reviews: 980, features: ['Dust mite and allergen removal', 'Anti-bacterial treatment', 'Moisture extraction', 'Quick drying process'] },
        { id: 'cl7', title: 'Window & Glass Cleaning', price: 299, image: 'https://i.postimg.cc/sgyMTdLz/Gemini-Generated-Image-93bou793bou793bo.png', duration: '1-1.5 hrs', rating: 4.8, reviews: 1240, features: ['Streak-free glass finish', 'Frame and sill cleaning', 'Squeegee technique for perfection', 'Water spot prevention'] },
        { id: 'cl8', title: 'Water Tank Cleaning', price: 799, image: 'https://i.postimg.cc/Dz6Lryfs/Gemini-Generated-Image-nx1iasnx1iasnx1i.png', duration: '2-3 hrs', rating: 4.6, reviews: 1420, features: ['Complete tank drainage and sediment removal', 'Bacteria and algae elimination', 'Expert inspection for cracks', 'Sanitization with approved chemicals'] }
      ]
    }
  },
  Electrician: {
    icon: '⚡',
    label: 'Electrician',
    subcategories: {
      'Switch & Socket': [
        { id: 'el1', title: 'Switch & Socket Repair', price: 199, image: 'https://i.postimg.cc/hGmtLKL3/Gemini-Generated-Image-w66mf8w66mf8w66m.png', duration: '30 mins', rating: 4.8, reviews: 2950, features: ['Expert fault diagnosis', 'Complete replacement if needed', 'Safety testing included', 'Branded parts used'] },
        { id: 'el2', title: 'Fan Installation / Repair', price: 299, image: 'https://i.postimg.cc/v8NCs5FK/Gemini-Generated-Image-bx1oyjbx1oyjbx1o.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2100, features: ['Installation for all fan types', 'Balance and noise reduction', 'Speed controller setup', 'Warranty documentation'] },
        { id: 'el3', title: 'Light / Chandelier Installation', price: 399, image: 'https://i.postimg.cc/1t2xJFyG/Gemini-Generated-Image-4krxr54krxr54krx.png', duration: '1-2 hrs', rating: 4.9, reviews: 1850, features: ['Professional fitting and positioning', 'Electrical connection verification', 'LED bulb compatibility check', 'Safety certification'] },
        { id: 'el8', title: 'Short Circuit Fix', price: 399, image: 'https://i.postimg.cc/W1BkLWX2/Gemini-Generated-Image-419nud419nud419n.png', duration: '1-2 hrs', rating: 4.6, reviews: 1620, features: ['Complete circuit testing', 'Root cause identification', 'Safe earthing arrangement', 'Safety switches installation'] }
      ],
      'Fan': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ],
      'Light': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ],
      'Wiring': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ],
      'Doorbell & security': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ],
      'MCB/fuse': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ],
      'Appliances': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ],
      'Book a consultation': [
        { id: 'el4', title: 'MCB / Fuse Repair', price: 499, image: 'https://i.postimg.cc/ncQVbH5D/Gemini-Generated-Image-36zmzq36zmzq36zm.png', duration: '1 hr', rating: 4.7, reviews: 1340, features: ['Professional panel inspection', 'Old fuse replacement with MCB', 'Load distribution optimization', 'Safety compliance check'] },
        { id: 'el5', title: 'Inverter & UPS Installation', price: 799, image: 'https://i.postimg.cc/sgmgKTqp/Gemini-Generated-Image-g6mtfog6mtfog6mt.png', duration: '2-3 hrs', rating: 4.8, reviews: 2240, features: ['Battery backup setup', 'Automatic switching mechanism', 'Load capacity adjustment', '3-year warranty included'] },
        { id: 'el6', title: 'Doorbell Installation', price: 249, image: 'https://i.postimg.cc/0jyfMWTn/Gemini-Generated-Image-9oknt09oknt09okn.png', duration: '45 mins', rating: 4.9, reviews: 1680, features: ['Professional wiring and setup', 'Volume and tone adjustment', 'Safe low-voltage installation', 'Tested before completion'] },
        { id: 'el7', title: 'Wiring & Rewiring', price: 999, image: 'https://i.postimg.cc/8cf70LMC/Gemini-Generated-Image-tamxt5tamxt5tamx.png', duration: '4-6 hrs', rating: 4.6, reviews: 1920, features: ['Complete electrical audit', 'Branded copper wires used', 'Safety switches on all circuits', 'Installation certificate provided'] },
        { id: 'el9', title: 'Appliance Electrical Issues', price: 499, image: 'https://i.postimg.cc/Kjh1CRNp/Gemini-Generated-Image-ftxwwlftxwwlftxw.png', duration: '1-2 hrs', rating: 4.7, reviews: 1480, features: ['Multi-brand appliance support', 'Plug and socket repair', 'Electrical connection setup', 'Safety grounding included'] }
      ]

    }
  },
  Plumber: {
    icon: '🔧',
    label: 'Plumber',
    subcategories: {
      'Plumbing Repairs': [
        { id: 'pl1', title: 'Tap & Mixer', price: 199, image: 'https://i.postimg.cc/jSnLqHF2/Gemini-Generated-Image-v6q2mfv6q2mfv6q2.png', duration: '30-45 mins', rating: 4.8, reviews: 2560, features: ['Quick leak detection', 'All tap types supported', 'O-ring replacement included', 'Water pressure check'] },
        { id: 'pl4', title: 'Leakage & Connections', price: 349, image: 'https://i.postimg.cc/TYC42mD6/Gemini-Generated-Image-ao0q82ao0q82ao0q.png', duration: '45-60 mins', rating: 4.9, reviews: 2180, features: ['Leak detection and repair', 'Pipe joining techniques', 'Water sealing guarantee', 'Quick-dry compounds used'] },
        { id: 'pl5', title: 'Drainage & Blockage', price: 399, image: 'https://i.postimg.cc/7Y6NVR5C/Gemini-Generated-Image-oz6j8voz6j8voz6j.png', duration: '1 hr', rating: 4.7, reviews: 1840, features: ['Professional plumbing snake used', 'Complete drain flushing', 'Preventive measures advised', 'Eco-friendly solutions'] }
      ],
      'Installation Services': [
        { id: 'pl2', title: 'Basin & Sink', price: 499, image: 'https://i.postimg.cc/xTwbzpH3/Gemini-Generated-Image-plfkrcplfkrcplfk.png', duration: '1-2 hrs', rating: 4.6, reviews: 1620, features: ['Proper outlet installation', 'Sealant application', 'Water pressure check', 'Bracket and support fitting'] },
        { id: 'pl3', title: 'Toilet', price: 599, image: 'https://i.postimg.cc/FK8KM7ZP/Gemini-Generated-Image-kd6smxkd6smxkd6s.png', duration: '1-2 hrs', rating: 4.8, reviews: 2040, features: ['Cistern fitting and testing', 'Flush mechanism repair', 'Seat fitting included', 'Water level adjustment'] },
        { id: 'pl6', title: 'Water Tank & Motor', price: 999, image: 'https://i.postimg.cc/8C83xGv7/Gemini-Generated-Image-7ra0kk7ra0kk7ra0.png', duration: '2-3 hrs', rating: 4.7, reviews: 1950, features: ['Motor capacity assessment', 'Professional piping work', 'Pressure switch installation', 'Performance guarantee'] },
        { id: 'pl7', title: 'Bath & Shower', price: 699, image: 'https://i.postimg.cc/GtkJ80tp/Gemini-Generated-Image-tgktfetgktfetgkt.png', duration: '2-3 hrs', rating: 4.6, reviews: 1380, features: ['Tank connection setup', 'Overflow pipe arrangement', 'Float valve installation', 'Anti-flood measures'] },
        { id: 'pl8', title: 'Bath Accessories', price: 399, image: 'https://i.postimg.cc/50568fBR/Gemini-Generated-Image-1lac7b1lac7b1lac.png', duration: '1-2 hrs', rating: 4.9, reviews: 1720, features: ['Towel rod installation', 'Soap dispenser fitting', 'Mirror mounting', 'Waterproof sealing'] },
        { id: 'pl9', title: 'Book a Consultation', price: 499, image: 'https://i.postimg.cc/qBSvghHV/Gemini-Generated-Image-x069nvx069nvx069.png', duration: '1-2 hrs', rating: 4.8, reviews: 1640, features: ['Complete water system check', 'Pressure and flow testing', 'Written report provided', 'Maintenance recommendations'] }
      ]
    }
  },
  Appliances: {
    icon: '❄️',
    label: 'AC & Appliances',
    subcategories: {
      'Super saver packages': [
        {
          id: 'ap-wm-pack-1',
          title: 'Washing Machine Super Saver Package',
          price: 1199,
          image: 'https://img.icons8.com/fluency/96/discount.png',
          duration: '2 visits',
          rating: 4.8,
          reviews: 1320,
          badge: '25% OFF',
          features: [
            '2 scheduled maintenance visits',
            'Deep drum + filter cleaning',
            'Priority technician support',
            'Cost-effective annual care'
          ]
        }
      ],
      'Service': [
        {
          id: 'ap-wm-service-1',
          title: 'Washing Machine Servicing',
          price: 399,
          image: 'https://img.icons8.com/fluency/96/washing-machine.png',
          duration: '45-60 mins',
          rating: 4.7,
          reviews: 2410,
          features: [
            'General checkup and cleaning',
            'Inlet and outlet inspection',
            'Drum balancing and cycle test',
            'Performance optimization'
          ]
        },
        {
          id: 'ap-wm-service-2',
          title: 'Washing Machine Deep Cleaning',
          price: 499,
          image: 'https://img.icons8.com/fluency/96/washing-machine.png',
          duration: '60-75 mins',
          rating: 4.8,
          reviews: 1910,
          features: [
            'Deep drum and detergent tray cleaning',
            'Inlet and outlet pipe cleaning',
            'Filter unclogging and hygiene wash',
            'Odor and residue removal'
          ]
        },
        {
          id: 'ap-wm-service-3',
          title: 'Washing Machine Performance Tune-up',
          price: 549,
          image: 'https://img.icons8.com/fluency/96/repair.png',
          duration: '60 mins',
          rating: 4.7,
          reviews: 1430,
          features: [
            'Spin and vibration calibration',
            'Motor and belt health check',
            'Water flow optimization',
            'Noise reduction tuning'
          ]
        }
      ],
      'Services': [
        {
          id: 'ap1',
          title: 'Foam-jet AC service',
          price: 599,
          image: 'https://img.icons8.com/fluency/96/air-conditioner.png',
          duration: '1-1.5 hrs',
          rating: 4.77,
          reviews: 1900000,
          promoTag: 'Free gas check',
          description: 'Deep cleans AC vents for efficient cooling',
          features: [
            'Applicable for both window & split ACs',
            'Indoor unit deep cleaning with foam and jet spray',
            'Filter and cooling coil hygiene cleaning',
            'Basic performance check after service'
          ],
          options: 6,
          subServices: [
            { id: 'ap1-opt-1', title: '1 AC', price: 599, oldPrice: null, subtitle: null, discountText: null },
            { id: 'ap1-opt-2', title: '2 ACs', price: 1098, oldPrice: 1198, subtitle: '(₹549/AC)', discountText: '8% off' },
            { id: 'ap1-opt-3', title: '3 ACs', price: 1497, oldPrice: 1797, subtitle: '(₹499/AC)', discountText: '17% off' },
            { id: 'ap1-opt-4', title: '4 ACs', price: 1896, oldPrice: 2396, subtitle: '(₹474/AC)', discountText: '21% off' },
            { id: 'ap1-opt-5', title: '5 ACs', price: 2295, oldPrice: 2995, subtitle: '(₹459/AC)', discountText: '23% off' },
            { id: 'ap1-opt-6', title: '6 ACs', price: 2694, oldPrice: 3594, subtitle: '(₹449/AC)', discountText: '25% off' }
          ],
          reviewBreakdown: [
            { stars: 5, count: 214000 },
            { stars: 4, count: 108000 },
            { stars: 3, count: 24000 },
            { stars: 2, count: 16000 },
            { stars: 1, count: 58000 }
          ],
          customerReviews: [
            {
              id: 'ap1-r1',
              user: 'Anis Momin',
              rating: 5,
              date: 'Mar 1, 2026',
              text: 'This was my second service and technician did a perfect deep clean. Cooling improved immediately and he explained each step clearly.'
            },
            {
              id: 'ap1-r2',
              user: 'Sharad Kulshrestha',
              rating: 5,
              date: 'Mar 1, 2026',
              text: 'Service was on time, neatly done, and no unnecessary upsell. Very satisfied with behavior and work quality.'
            },
            {
              id: 'ap1-r3',
              user: 'Richa Verma',
              rating: 4,
              date: 'Feb 28, 2026',
              text: 'Good experience overall. Cooling and airflow improved after foam-jet service and team was professional.'
            }
          ]
        },
        { id: 'ap2', title: 'AC Installation', price: 999, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '2-3 hrs', rating: 4.8, reviews: 2840, features: ['Professional wall mounting', 'Copper piping installation', 'Electrical connection setup', 'Gas charging included'] },
        { id: 'ap3', title: 'AC Uninstallation', price: 399, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '1-1.5 hrs', rating: 4.6, reviews: 1520, features: ['Safe gas recovery', 'Proper disposal of unit', 'Wall hole sealing', 'Clean installation area'] },
        { id: 'ap4', title: 'AC Gas Refill', price: 899, image: 'https://img.icons8.com/fluency/96/gas.png', duration: '30-45 mins', rating: 4.9, reviews: 4100, features: ['Genuine R22/R410A gas used', 'Pressure optimization', 'Leak detection included', 'Performance testing'] },
        { id: 'ap5', title: 'AC General Service', price: 599, image: 'https://img.icons8.com/fluency/96/gear.png', duration: '1 hr', rating: 4.5, reviews: 2150, features: ['Complete system checkup', 'Capacitor testing', 'Thermostat calibration', 'Electrical safety check'] },
        { id: 'ap6', title: 'AC Repair (Split/Window)', price: 799, image: 'https://img.icons8.com/fluency/96/repair.png', duration: '1-2 hrs', rating: 4.8, reviews: 2960, features: ['Fault diagnosis and repair', 'All AC brands supported', 'Genuine spare parts', 'Warranty on service'] }
      ],
      'Repair & Gas Refill': [
        { id: 'ap7', title: 'Refrigerator Repair', price: 699, image: 'https://img.icons8.com/fluency/96/fridge.png', duration: '1-2 hrs', rating: 4.6, reviews: 1880, features: ['Cooling system check', 'Compressor repair/replacement', 'Door seal replacement', 'Temperature calibration'] },
        { id: 'ap8', title: 'Washing Machine Repair', price: 599, image: 'https://img.icons8.com/fluency/96/washing-machine.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2640, features: ['Drum and motor repair', 'Water inlet cleaning', 'Drain pipe unclogging', 'Spin cycle testing'] },
        { id: 'ap8a', title: 'Washing Machine Water Leakage Repair', price: 649, image: 'https://img.icons8.com/fluency/96/washing-machine.png', duration: '1-1.5 hrs', rating: 4.8, reviews: 1730, features: ['Leak source identification', 'Pipe and seal replacement', 'Drain path correction', 'Final leak test included'] },
        { id: 'ap8b', title: 'Washing Machine Not Spinning Fix', price: 699, image: 'https://img.icons8.com/fluency/96/repair.png', duration: '1-2 hrs', rating: 4.7, reviews: 1590, features: ['Motor and capacitor diagnosis', 'Belt and drum inspection', 'Control board basic checks', 'Spin cycle restore testing'] },
        { id: 'ap9', title: 'Microwave Repair', price: 399, image: 'https://img.icons8.com/fluency/96/microwave.png', duration: '1 hr', rating: 4.8, reviews: 1420, features: ['Heating element repair', 'Control panel testing', 'Door mechanism check', 'Safety interlock test'] },
        { id: 'ap10', title: 'Geyser Repair', price: 499, image: 'https://img.icons8.com/fluency/96/geyser.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2180, features: ['Heating element replacement', 'Thermostat repair', 'Pipe connection check', 'Temperature testing'] }
      ],
      'Install/uninst': [
        { id: 'ap11', title: 'Refrigerator Installation', price: 799, image: 'https://img.icons8.com/fluency/96/fridge.png', duration: '1-2 hrs', rating: 4.7, reviews: 1280, features: ['Positioning and leveling', 'Power and safety checks', 'Cooling performance verification', 'Demo after setup'] },
        { id: 'ap12', title: 'Washing Machine Installation', price: 499, image: 'https://img.icons8.com/fluency/96/washing-machine.png', duration: '45-60 mins', rating: 4.8, reviews: 2060, features: ['Inlet and outlet setup', 'Drain alignment and testing', 'Spin balance setup', 'Basic demo included'] },
        { id: 'ap13', title: 'Washing Machine Uninstallation', price: 349, image: 'https://img.icons8.com/fluency/96/washing-machine.png', duration: '30-45 mins', rating: 4.7, reviews: 1410, features: ['Safe disconnection', 'Water line closure', 'Drain and cable packing support', 'Area cleanup'] },
        { id: 'ap14', title: 'Microwave Installation', price: 399, image: 'https://img.icons8.com/fluency/96/microwave.png', duration: '30-45 mins', rating: 4.7, reviews: 980, features: ['Positioning and wiring check', 'Socket load verification', 'Function test run', 'Usage guidance'] },
        { id: 'ap15', title: 'Geyser Installation', price: 699, image: 'https://img.icons8.com/fluency/96/geyser.png', duration: '1-1.5 hrs', rating: 4.8, reviews: 1720, features: ['Wall mounting support', 'Inlet/outlet connection', 'Thermostat and leakage test', 'Heating test run'] }
      ]
    }
  },
Beauty: {
  icon: '💄',
  label: 'Salon & Beauty (Women)',
  subcategories: {

    'Super saver packages': [
      {
        id: 'sb1',
        title: 'Complete Beauty Package',
        price: 1999,
        image: 'https://i.postimg.cc/9FJ9Z7pZ/offer.png',
        duration: '3-4 hrs',
        rating: 4.9,
        reviews: 2200,
        badge: '25% OFF',
        features: ['Full body care combo', 'Facial + Waxing + Cleanup', 'Best value package']
      }
    ],

    // ===================== WAXING =====================
    'Waxing': [
      {
        id: 'wx1',
        title: 'Roll-on Waxing (Full arms, legs & underarms)',
        price: 1699,
        oldPrice: 1808,
        image: 'https://i.postimg.cc/1z2GkH3Z/waxing.png',
        duration: '60 mins',
        rating: 4.9,
        reviews: 141000,
        badge: 'Price drop',
        features: [
          'Roll-on wax options',
          'Gentle peel-off wax for underarms'
        ],
        options: 2
      },
      {
        id: 'wx2',
        title: 'RICA / Honey Wax (Full arms & legs)',
        price: 1039,
        oldPrice: 1499,
        image: 'https://i.postimg.cc/q7n7P1Cw/spa-wax.png',
        duration: '55 mins',
        rating: 4.9,
        reviews: 140000,
        badge: 'New launch',
        features: [
          'RICA / Aloe wax',
          'Covers full legs & arms'
        ],
        options: 4
      },
      {
        id: 'wx3',
        title: 'Full arms & underarms waxing',
        price: 599,
        image: 'https://i.postimg.cc/3rWc0Rk7/armswax.png',
        duration: '30 mins',
        rating: 4.9,
        reviews: 129000,
        options: 6
      },
      {
        id: 'wx4',
        title: 'Full legs waxing',
        price: 539,
        image: 'https://i.postimg.cc/d3FGyLz1/legwax.png',
        duration: '30 mins',
        rating: 4.9,
        reviews: 197000,
        options: 6
      },
      {
        id: 'wx5',
        title: 'Full body waxing',
        price: 1799,
        image: 'https://i.postimg.cc/QtGZhXLM/bodywax.png',
        duration: '75 mins',
        rating: 4.9,
        reviews: 12000,
        options: 6
      },
      {
        id: 'wx6',
        title: 'Underarms waxing',
        price: 219,
        image: 'https://i.postimg.cc/DZ09ShC3/underarmwax.png',
        duration: '15 mins',
        rating: 4.9,
        reviews: 27000,
        options: 2
      }
    ],

    // ===================== FACIAL =====================
  'Korean facial': [
  {
    id: 'kr1',
    title: 'Korean Glass Skin Facial',
    price: 2099,
    image: 'https://i.postimg.cc/T3mCkmJL/korean-glass.jpg',
    duration: '1 hr 20 mins',
    rating: 4.87,
    reviews: 27000,
    badge: 'Bestseller',
    skinType: 'Normal to oily skin',
    ingredient: 'Bio peptides',
    features: [
      'Boosts collagen & deeply hydrates the skin',
      'Includes back, leg & hand massage'
    ],
    options: 1
  },

  {
    id: 'kr2',
    title: 'KGlow Age-Rewind Facial',
    price: 1899,
    image: 'https://i.postimg.cc/6qkCRwFT/kglow.jpg',
    duration: '1 hr 20 mins',
    rating: 4.85,
    reviews: 11000,
    skinType: 'All skin types',
    ingredient: 'Brown algae',
    features: [
      'Detoxifies & brightens the skin',
      'Includes back, leg & hand massage'
    ],
    options: 1
  },

  {
    id: 'kr3',
    title: 'Korean Sea-Algae Hydra-Boost Facial',
    price: 2299,
    image: 'https://i.postimg.cc/2yfx7KfZ/sea-algae.jpg',
    duration: '1 hr 20 mins',
    rating: 4.87,
    reviews: 10000,
    badge: 'Top pick',
    skinType: 'All skin types',
    ingredient: 'Sea algae',
    features: [
      'Improves hydration & strengthens skin barrier',
      'Includes back, leg & hand massage'
    ],
    options: 1
  }
]
,
    

    'Signature facials': [
  {
    id: 'sf1',
    brand: 'AINHOA',
    title: 'Ainhoa Signature Brightening Facial',
    price: 2499,
    image: 'https://i.postimg.cc/T1pR8K9D/ainhoa-brightening.jpg',
    duration: '1 hr 20 mins',
    rating: 4.91,
    reviews: 57000,
    skinType: 'All skin types',
    ingredient: 'Glycolic acid',
    features: [
      'Reduces pigmentation, dark spots & tan',
      'Includes scalp, hand & back massage'
    ]
  },

  {
    id: 'sf2',
    brand: 'CASMARA',
    title: 'Casmara Brightening Facial',
    price: 2399,
    image: 'https://i.postimg.cc/Y0C1c8vX/casmara-brightening.jpg',
    duration: '1 hr 20 mins',
    rating: 4.57,
    reviews: 34000,
    skinType: 'All skin types',
    ingredient: 'Sea algae',
    features: [
      'Targets dark spots & uneven tone',
      'Boosts natural glow'
    ]
  },

  {
    id: 'sf3',
    brand: 'AINHOA',
    title: 'Ainhoa Sensitive Skin Facial',
    price: 2499,
    image: 'https://i.postimg.cc/wv0Qn7vZ/ainhoa-sensitive.jpg',
    duration: '1 hr 20 mins',
    rating: 4.83,
    reviews: 26000,
    skinType: 'All skin types',
    ingredient: 'Vitamin A & E',
    features: [
      'Soothes dryness & restores skin balance',
      'Includes scalp, hand & back massage'
    ]
  },

  {
    id: 'sf4',
    brand: 'AINHOA',
    title: 'Ainhoa Oil-Control Facial',
    price: 2299,
    image: 'https://i.postimg.cc/ZRccx2gt/ainhoa-oilcontrol.jpg',
    duration: '1 hr 20 mins',
    rating: 4.88,
    reviews: 32000,
    skinType: 'Oily skin',
    ingredient: 'Glycolic acid',
    features: [
      'Controls excess oil & balances hydration',
      'Includes scalp, hand & back massage'
    ]
  },

  {
    id: 'sf5',
    brand: 'AINHOA',
    title: 'Ainhoa Multi-Peptide Anti-Ageing Facial',
    price: 2699,
    image: 'https://i.postimg.cc/jj5j9bq6/ainhoa-peptide.jpg',
    duration: '1 hr 20 mins',
    rating: 4.86,
    reviews: 23000,
    skinType: 'Dry skin',
    ingredient: 'Vegan collagen',
    features: [
      'Reduces fine lines & wrinkles',
      'Improves skin elasticity'
    ]
  },

  {
    id: 'sf6',
    brand: 'CASMARA',
    title: 'Casmara Anti-Ageing Facial',
    price: 2799,
    image: 'https://i.postimg.cc/vBW3tw9r/casmara-aging.jpg',
    duration: '1 hr 30 mins',
    rating: 4.78,
    reviews: 18000,
    skinType: 'Dry skin',
    ingredient: 'Goji berry',
    features: [
      'Reduces wrinkles & fine lines',
      'Improves skin firmness'
    ]
  },

  {
    id: 'sf7',
    brand: 'AINHOA',
    title: 'Ainhoa Hydraboost Facial',
    price: 2499,
    image: 'https://i.postimg.cc/k4Xr7D8S/ainhoa-hydraboost.jpg',
    duration: '1 hr 20 mins',
    rating: 4.90,
    reviews: 20000,
    skinType: 'Dry skin',
    ingredient: 'Vitamin B3 & E',
    features: [
      'Hydrates & plumps dry skin',
      'Includes scalp, hand & back massage'
    ]
  },

  {
    id: 'sf8',
    brand: 'CASMARA',
    title: 'Casmara Hydration Facial',
    price: 2599,
    image: 'https://i.postimg.cc/1zZJ2FZs/casmara-hydration.jpg',
    duration: '1 hr 30 mins',
    rating: 4.71,
    reviews: 19000,
    skinType: 'Dry skin',
    ingredient: 'Avocado & Linseed oil',
    features: [
      'Nourishes dry flaky skin',
      'Restores softness & glow'
    ]
  },

  {
    id: 'sf9',
    brand: 'O3+',
    title: 'O3+ Kumkumadi Ayurvedic Facial',
    price: 2199,
    image: 'https://i.postimg.cc/x8FK3pXx/o3-kumkumadi.jpg',
    duration: '1 hr 15 mins',
    rating: 4.93,
    reviews: 15000,
    skinType: 'All skin types',
    ingredient: 'Kumkumadi oil',
    features: [
      'Brightens & removes tan',
      'Ayurvedic glow therapy'
    ]
  },

  {
    id: 'sf10',
    brand: 'O3+',
    title: 'O3+ Radiance Luxury Facial',
    price: 2599,
    image: 'https://i.postimg.cc/9Fk1sJ0k/o3-radiance.jpg',
    duration: '1 hr 15 mins',
    rating: 4.89,
    reviews: 14000,
    skinType: 'Normal to dry skin',
    ingredient: 'Hyaluronic acid',
    features: [
      'Deep hydration & collagen synthesis',
      'Luxury spa experience'
    ]
  }
]
,

    // ===================== CLEANUP =====================
    'Cleanup': [
  {
    id: 'cl1',
    brand: 'Mintree',
    title: 'Hydra Mud Glow Cleanup',
    price: 1299,
    image: 'https://i.postimg.cc/VsS4x8Kf/mintree-hydra.jpg',
    duration: '45 mins',
    rating: 4.89,
    reviews: 4000,
    skinType: 'Dry skin',
    ingredient: 'Balneological peat',
    features: [
      'Deep cleanses the skin',
      'Boosts hydration'
    ]
  },

  {
    id: 'cl2',
    brand: 'Mintree',
    title: 'Detox Mud Cleanup',
    price: 1299,
    image: 'https://i.postimg.cc/k4zjrx8d/mintree-detox.jpg',
    duration: '45 mins',
    rating: 4.91,
    reviews: 1000,
    skinType: 'Oily skin',
    ingredient: 'Balneological peat',
    features: [
      'Deep cleanses the skin',
      'Controls excess oil'
    ]
  },

  {
    id: 'cl3',
    brand: 'CASMARA',
    title: 'Casmara Charcoal Detox Mask',
    price: 1299,
    image: 'https://i.postimg.cc/mZWT3jP8/casmara-charcoal.jpg',
    duration: '40 mins',
    rating: 4.87,
    reviews: 700,
    skinType: 'All skin types',
    ingredient: 'Charcoal',
    features: [
      'Removes impurities & detoxifies skin',
      'Includes dry head & palm massage'
    ]
  },

  {
    id: 'cl4',
    brand: 'REPECHAGE',
    title: 'Repechage Hydra-Boost Cleanup',
    price: 2199,
    image: 'https://i.postimg.cc/Jzpxj1yR/repechage-hydra.jpg',
    duration: '50 mins',
    rating: 4.89,
    reviews: 700,
    skinType: 'All skin types',
    ingredient: 'Hyaluronic acid',
    features: [
      'Combats dehydration & dullness',
      'Instant glow effect'
    ]
  },

  {
    id: 'cl5',
    brand: 'REPECHAGE',
    title: 'Repechage Brightening Cleanup',
    price: 1699,
    image: 'https://i.postimg.cc/6Qf1F2cz/repechage-brightening.jpg',
    duration: '50 mins',
    rating: 4.89,
    reviews: 1100,
    skinType: 'All skin types',
    ingredient: 'Lactic acid',
    features: [
      'Removes tan & brightens skin',
      'Improves uneven tone'
    ]
  },

  {
    id: 'cl6',
    brand: 'REPECHAGE',
    title: 'Repechage Oil-Control Cleanup',
    price: 1899,
    image: 'https://i.postimg.cc/W1bbV6mP/repechage-oilcontrol.jpg',
    duration: '50 mins',
    rating: 4.87,
    reviews: 400,
    skinType: 'Oily skin',
    ingredient: 'Salicylic acid',
    features: [
      'Cleans clogged pores',
      'Controls excess oil production'
    ]
  }
]
,

    // ===================== MANI PEDI =====================
    'Pedicure & manicure': [
  {
    id: 'pm1',
    title: 'Rejuvenating Mani-Pedi Duo',
    price: 2149,
    image: 'https://i.postimg.cc/qM0T2gY2/mani-pedi-duo.jpg',
    duration: '2 hrs 10 mins',
    rating: 4.87,
    reviews: 36000,
    features: [
      'Long-lasting hydration with crystal spa pedicure',
      'AVL sea algae manicure',
      'Includes shoulder & palm massage'
    ]
  },

  {
    id: 'pm2',
    title: 'Ice Cream Delight Pedicure',
    price: 1579,
    image: 'https://i.postimg.cc/3JpY7X8S/icecream-pedicure.jpg',
    duration: '75 mins',
    rating: 4.87,
    reviews: 11000,
    features: [
      'Exfoliating salt & flavoured bomb treatment',
      'Includes foot massage & hand massage'
    ]
  },

  {
    id: 'pm3',
    title: 'Rejuvenating Crystal Spa Pedicure',
    price: 1249,
    image: 'https://i.postimg.cc/fLrDsh3B/crystal-spa.jpg',
    duration: '80 mins',
    rating: 4.87,
    reviews: 40000,
    features: [
      'Wheatgerm oil, beeswax & paraffin treatment',
      'Long-lasting hydration',
      'Includes shoulder & hand massage'
    ]
  },

  {
    id: 'pm4',
    title: 'Cut, File & Polish (Feet)',
    price: 299,
    image: 'https://i.postimg.cc/rF5W2Zdc/cut-file-feet.jpg',
    duration: '15 mins',
    rating: 4.90,
    reviews: 14000,
    features: [
      'Quick luxury nail grooming',
      'Wide range of branded nail polishes'
    ]
  },

  {
    id: 'pm5',
    title: 'Ice Cream Delight Manicure',
    price: 1299,
    image: 'https://i.postimg.cc/WbPBY3p0/icecream-manicure.jpg',
    duration: '60 mins',
    rating: 4.86,
    reviews: 4000,
    features: [
      'Exfoliating salt & flavoured bomb treatment',
      'Softens and nourishes hands'
    ]
  },

  {
    id: 'pm6',
    title: 'AVL Sea-Algae Manicure',
    price: 999,
    image: 'https://i.postimg.cc/CKt3s3zM/sea-algae-manicure.jpg',
    duration: '45 mins',
    rating: 4.86,
    reviews: 17000,
    features: [
      'Sea minerals & algae hydration',
      'Improves skin softness'
    ]
  },

  {
    id: 'pm7',
    title: 'Cut, File & Polish (Hands)',
    price: 249,
    image: 'https://i.postimg.cc/ZqkHGw8f/cut-file-hands.jpg',
    duration: '15 mins',
    rating: 4.89,
    reviews: 13000,
    features: [
      'Quick nail grooming',
      'Wide range of polish shades'
    ]
  }
]
,

    // ===================== THREADING =====================
    'Threading & face wax': [
  {
    id: 'th1',
    title: 'Threading',
    price: 99,
    image: 'https://i.postimg.cc/Nf9g6x1T/threading-face.jpg',
    duration: '15 mins',
    rating: 4.91,
    reviews: 334000,
    features: [
      'Eyebrow, upper lip & forehead options',
      'Precise shaping with minimal irritation',
      'Suitable for sensitive skin'
    ]
  },

  {
    id: 'th2',
    title: 'Cirepil PR Visage Face Wax',
    price: 199,
    image: 'https://i.postimg.cc/5y7s0mG7/face-wax.jpg',
    duration: '20 mins',
    rating: 4.90,
    reviews: 85000,
    features: [
      'Fragrance-free premium wax',
      'Resin, beeswax & nourishing oils',
      'Smooth finish with gentle grip'
    ]
  }
]
,

    // ===================== BLEACH =====================
    'Bleach, detan & massage': [
      {
        id: 'bd1',
        title: 'Bleach',
        price: 549,
        image: 'https://i.postimg.cc/8z4Qv6t/bleach-face.jpg',
        duration: '30 mins',
        rating: 4.89,
        reviews: 17000,
        features: [
          'Instant tan removal',
          'Brightens dull skin',
          'Safe for sensitive skin'
        ]
      },

      {
        id: 'bd2',
        title: 'Detan Pack',
        price: 499,
        image: 'https://i.postimg.cc/QxC4P9zZ/detan-face.jpg',
        duration: '35 mins',
        rating: 4.87,
        reviews: 21000,
        features: [
          'Removes sun damage',
          'Improves skin tone evenly',
          'Cooling & soothing mask'
        ]
      },

      {
        id: 'bd3',
        title: 'Head Massage',
        price: 349,
        image: 'https://i.postimg.cc/y6y0tFqP/head-massage.jpg',
        duration: '20 mins',
        rating: 4.92,
        reviews: 32000,
        features: [
          'Relieves stress & headache',
          'Improves blood circulation',
          'Deep relaxation therapy'
        ]
      },

      {
        id: 'bd4',
        title: 'Foot Massage',
        price: 299,
        image: 'https://i.postimg.cc/VkFG3w0s/foot-massage.jpg',
        duration: '10 mins',
        rating: 4.90,
        reviews: 17000,
        features: [
          'Relieves foot pain & fatigue',
          'Improves blood circulation',
          'Instant relaxation'
        ]
      }
    ],

    'Super saver packs': [
      {
        id: 'spw1',
        title: 'Spa Saver Combo (Head + Foot + Back)',
        price: 1299,
        oldPrice: 1699,
        image: 'https://i.postimg.cc/9FJ9Z7pZ/offer.png',
        duration: '75 mins',
        rating: 4.88,
        reviews: 9200,
        features: [
          'Best-value combo for complete relaxation',
          'Includes head, back and foot massage',
          'Perfect weekly wellness package'
        ]
      }
    ],

    'Stress relief': [
      {
        id: 'spw2',
        title: 'Warm Swedish Stress Relief Massage',
        price: 1349,
        image: 'https://i.postimg.cc/y6y0tFqP/head-massage.jpg',
        duration: '60 mins',
        rating: 4.83,
        reviews: 6100,
        features: [
          'Gentle strokes for full body relaxation',
          'Helps reduce stress and fatigue',
          'Aroma oil treatment included'
        ]
      }
    ],

    'Pain relief': [
      {
        id: 'spw3',
        title: 'Warm Deep Tissue Pain Relief Massage',
        price: 1499,
        image: 'https://i.postimg.cc/VkFG3w0s/foot-massage.jpg',
        duration: '60 mins',
        rating: 4.84,
        reviews: 5400,
        features: [
          'Targets knots and muscle stiffness',
          'Focused pressure for back and shoulder pain',
          'Recommended for body ache relief'
        ]
      }
    ],

    'Skin care scrubs': [
      {
        id: 'spw4',
        title: 'Detan & Skin Polish Scrub',
        price: 899,
        image: 'https://i.postimg.cc/QxC4P9zZ/detan-face.jpg',
        duration: '45 mins',
        rating: 4.8,
        reviews: 4700,
        features: [
          'Exfoliates dead skin and tanning',
          'Improves softness and glow',
          'Hydration mask post scrub'
        ]
      }
    ],

    'Post Natal': [
      {
        id: 'spw5',
        title: 'Post Natal Relaxation Massage',
        price: 1599,
        image: 'https://i.postimg.cc/T3mCkmJL/korean-glass.jpg',
        duration: '70 mins',
        rating: 4.86,
        reviews: 3200,
        features: [
          'Gentle therapy for new moms',
          'Helps ease body stiffness and tiredness',
          'Performed by trained female professionals'
        ]
      }
    ],

    'Spa add-ons': [
      {
        id: 'spw6',
        title: 'Head & Neck Massage Add-on',
        price: 299,
        image: 'https://i.postimg.cc/5y7s0mG7/face-wax.jpg',
        duration: '20 mins',
        rating: 4.79,
        reviews: 2800,
        features: [
          'Quick add-on for deep calm',
          'Eases neck and temple strain',
          'Can be paired with any spa service'
        ]
      }
    ],

    'Makeup & Styling': [
      {
        id: 'mk1',
        title: 'Party Makeup',
        price: 1999,
        image: 'https://i.postimg.cc/8z4Qv6t/bleach-face.jpg',
        duration: '75 mins',
        rating: 4.84,
        reviews: 5300,
        features: [
          'Party-ready base and eye makeup',
          'Includes hair touch-up styling',
          'Long-stay branded products'
        ]
      },
      {
        id: 'mk2',
        title: 'Bridal Makeup (HD)',
        price: 6999,
        image: 'https://i.postimg.cc/T3mCkmJL/korean-glass.jpg',
        duration: '2.5-3 hrs',
        rating: 4.9,
        reviews: 2400,
        features: [
          'HD base with premium finish',
          'Lashes, contour and draping support',
          'Artist consultation included'
        ]
      },
      {
        id: 'mk3',
        title: 'Hair Styling Add-on',
        price: 799,
        image: 'https://i.postimg.cc/q7n7P1Cw/spa-wax.png',
        duration: '35 mins',
        rating: 4.78,
        reviews: 4100,
        features: [
          'Soft curls, sleek or bun styling',
          'Heat protection products included',
          'Works with party and bridal looks'
        ]
      }
    ],
    'Group deals': [
      {
        id: 'mk_gd_1',
        title: 'Group Glam Deal (2 People)',
        price: 3299,
        image: 'https://i.postimg.cc/8z4Qv6t/bleach-face.jpg',
        duration: '2 hrs',
        rating: 4.81,
        reviews: 2400,
        features: ['2 people makeup combo', 'Base + eye + hair touch-up', 'Ideal for events and parties']
      }
    ],
    'Saree draping': [
      {
        id: 'mk_sd_1',
        title: 'Professional Saree Draping',
        price: 799,
        image: 'https://i.postimg.cc/T3mCkmJL/korean-glass.jpg',
        duration: '35 mins',
        rating: 4.84,
        reviews: 3200,
        features: ['Elegant draping styles', 'Pinning for secure hold', 'Styling as per occasion']
      }
    ],
    'Wedding combos': [
      {
        id: 'mk_wc_1',
        title: 'Wedding Makeup Combo',
        price: 4999,
        image: 'https://i.postimg.cc/8z4Qv6t/bleach-face.jpg',
        duration: '2-2.5 hrs',
        rating: 4.9,
        reviews: 2700,
        features: ['Makeup + saree draping + hair styling', 'Long-stay premium products', 'Bridal look consultation']
      }
    ],
    'Party makeup': [
      {
        id: 'mk_pm_1',
        title: 'Party Makeup',
        price: 1999,
        image: 'https://i.postimg.cc/8z4Qv6t/bleach-face.jpg',
        duration: '75 mins',
        rating: 4.84,
        reviews: 5300,
        features: ['Party-ready base and eye makeup', 'Includes hair touch-up styling', 'Long-stay branded products']
      }
    ],
    'Hair styling': [
      {
        id: 'mk_hs_1',
        title: 'Hair Styling',
        price: 799,
        image: 'https://i.postimg.cc/q7n7P1Cw/spa-wax.png',
        duration: '35 mins',
        rating: 4.78,
        reviews: 4100,
        features: ['Soft curls, sleek or bun styling', 'Heat protection products included', 'Works with party and bridal looks']
      }
    ],
    'Add-ons': [
      {
        id: 'mk_add_1',
        title: 'Eye Makeup Add-on',
        price: 499,
        image: 'https://i.postimg.cc/5y7s0mG7/face-wax.jpg',
        duration: '20 mins',
        rating: 4.8,
        reviews: 2100,
        features: ['Smokey/shimmer eye options', 'Liner + lashes support', 'Quick enhancement add-on']
      }
    ],
    'Packages': [
      {
        id: 'hsw_pkg_1',
        title: 'Hair Studio Complete Package',
        price: 1499,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '90 mins',
        rating: 4.8,
        reviews: 2100,
        features: ['Wash + cut + blow-dry combo', 'Stylist consultation included', 'Finishing serum included']
      }
    ],
    'Blow-dry & style': [
      {
        id: 'hsw_bds_1',
        title: 'Professional Blow-dry & Styling',
        price: 699,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '45 mins',
        rating: 4.7,
        reviews: 1800,
        features: ['Volume or sleek finish', 'Heat protection products', 'Style as per hair type']
      }
    ],
    'Cut & trim': [
      {
        id: 'hsw_ct_1',
        title: 'Hair Cut & Trim',
        price: 499,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '40 mins',
        rating: 4.7,
        reviews: 2400,
        features: ['Layer/U-cut/basic trim options', 'Consultation before cut', 'Stylist finishing']
      }
    ],
    'Hair care': [
      {
        id: 'hsw_hc_1',
        title: 'Nourishing Hair Spa',
        price: 899,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '60 mins',
        rating: 4.8,
        reviews: 1900,
        features: ['Deep conditioning mask', 'Scalp massage included', 'Frizz control finish']
      }
    ],
    'Keratin & botox': [
      {
        id: 'hsw_kb_1',
        title: 'Keratin/Botox Smoothening',
        price: 2499,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '2-3 hrs',
        rating: 4.8,
        reviews: 1300,
        features: ['Reduces frizz and roughness', 'Smooth finish treatment', 'After-care guidance provided']
      }
    ],
    'Hair colour': [
      {
        id: 'hsw_hcl_1',
        title: 'Global Hair Colour',
        price: 1799,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '90 mins',
        rating: 4.7,
        reviews: 1600,
        features: ['Ammonia-light options', 'Shade matching consultation', 'Post-colour wash included']
      }
    ],
    'Hair extensions': [
      {
        id: 'hsw_he_1',
        title: 'Hair Extensions Application',
        price: 2999,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '2 hrs',
        rating: 4.7,
        reviews: 900,
        features: ['Clip-in/tape-in support', 'Natural blending by stylist', 'Maintenance instructions included']
      }
    ],
    'Fashion color': [
      {
        id: 'hsw_fc_1',
        title: 'Fashion Hair Colour Highlights',
        price: 2199,
        image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png',
        duration: '2 hrs',
        rating: 4.8,
        reviews: 1100,
        features: ['Trending shade selection', 'Highlight or streak options', 'Tone-protection care included']
      }
    ]
  }
}
,
  
  Men: {
    icon: '👨‍💼',
    label: "Men's Salon & Grooming",
    subcategories: {
      'packages': [
      {
        id: 'sb1',
        title: 'Complete Beauty Package',
        price: 1999,
        image: 'https://i.postimg.cc/9FJ9Z7pZ/offer.png',
        duration: '3-4 hrs',
        rating: 4.9,
        reviews: 2200,
        badge: '25% OFF',
        features: ['Full body care combo', 'Facial + Waxing + Cleanup', 'Best value package']
      }
    ],
      'Pedicure': [
        { id: 'm1', title: 'Haircut', price: 299, image: 'https://img.icons8.com/fluency/96/haircut.png', duration: '30-45 mins', rating: 4.8, reviews: 3920, features: ['Professional haircut', 'Hair wash included', 'Styling and finishing', 'Product recommendation'] },
        { id: 'm2', title: 'Beard Trim & Styling', price: 249, image: 'https://img.icons8.com/fluency/96/beard.png', duration: '20-30 mins', rating: 4.9, reviews: 4100, features: ['Expert beard shaping', 'Beard oil treatment', 'Trimming and edging', 'Professional styling'] },
        { id: 'm3', title: 'Shave', price: 199, image: 'https://img.icons8.com/fluency/96/shave.png', duration: '20-30 mins', rating: 4.7, reviews: 2840, features: ['Traditional straight razor shave', 'Hot towel treatment', 'After-shave care', 'Skin soothing balm'] }
      ],
      'Hair care': [
        { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png', duration: '45-60 mins', rating: 4.6, reviews: 2360, features: ['Skin type analysis', 'Deep cleansing', 'Face massage', 'Moisturizing treatment'] },
        { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png', duration: '60-90 mins', rating: 4.8, reviews: 2640, features: ['Beard or hair coloring', 'Shade selection guidance', 'Color-safe treatment', 'Post-color care'] },
        { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png', duration: '45-60 mins', rating: 4.9, reviews: 3180, features: ['Pressure point massage', 'Stress relief', 'Oil treatment', 'Relaxation therapy'] }
      ],
      'Face care': [
        { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png', duration: '45-60 mins', rating: 4.6, reviews: 2360, features: ['Skin type analysis', 'Deep cleansing', 'Face massage', 'Moisturizing treatment'] },
        { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png', duration: '60-90 mins', rating: 4.8, reviews: 2640, features: ['Beard or hair coloring', 'Shade selection guidance', 'Color-safe treatment', 'Post-color care'] },
        { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png', duration: '45-60 mins', rating: 4.9, reviews: 3180, features: ['Pressure point massage', 'Stress relief', 'Oil treatment', 'Relaxation therapy'] }
      ],
      'Shave': [
        { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png', duration: '45-60 mins', rating: 4.6, reviews: 2360, features: ['Skin type analysis', 'Deep cleansing', 'Face massage', 'Moisturizing treatment'] },
        { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png', duration: '60-90 mins', rating: 4.8, reviews: 2640, features: ['Beard or hair coloring', 'Shade selection guidance', 'Color-safe treatment', 'Post-color care'] },
        { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png', duration: '45-60 mins', rating: 4.9, reviews: 3180, features: ['Pressure point massage', 'Stress relief', 'Oil treatment', 'Relaxation therapy'] }
      ],
      'Hair color': [
        { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png', duration: '45-60 mins', rating: 4.6, reviews: 2360, features: ['Skin type analysis', 'Deep cleansing', 'Face massage', 'Moisturizing treatment'] },
        { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png', duration: '60-90 mins', rating: 4.8, reviews: 2640, features: ['Beard or hair coloring', 'Shade selection guidance', 'Color-safe treatment', 'Post-color care'] },
        { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png', duration: '45-60 mins', rating: 4.9, reviews: 3180, features: ['Pressure point massage', 'Stress relief', 'Oil treatment', 'Relaxation therapy'] }
      ],
      'Massage': [
        { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png', duration: '45-60 mins', rating: 4.6, reviews: 2360, features: ['Skin type analysis', 'Deep cleansing', 'Face massage', 'Moisturizing treatment'] },
        { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png', duration: '60-90 mins', rating: 4.8, reviews: 2640, features: ['Beard or hair coloring', 'Shade selection guidance', 'Color-safe treatment', 'Post-color care'] },
        { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png', duration: '45-60 mins', rating: 4.9, reviews: 3180, features: ['Pressure point massage', 'Stress relief', 'Oil treatment', 'Relaxation therapy'] }
      ],
    }
  },
  Painting: {
    icon: '🎨',
    label: 'Painting & Wall Care',
    subcategories: {
      'Wall Services': [
        { id: 'pt1', title: 'Interior Painting', price: 1999, image: 'https://img.icons8.com/fluency/96/paint-palette.png', duration: '1-2 days', rating: 4.7, reviews: 2840, features: ['Wall surface preparation', 'Multiple paint coats', 'Professional finish', 'Color correction available'] },
        { id: 'pt2', title: 'Exterior Painting', price: 2999, image: 'https://img.icons8.com/fluency/96/paint-roller.png', duration: '2-3 days', rating: 4.6, reviews: 1960, features: ['Weather-resistant paint', 'Waterproof coating', 'Exterior surface prep', 'Anti-fungal treatment'] },
        { id: 'pt3', title: 'Wall Texture & Designer Paint', price: 3499, image: 'https://img.icons8.com/fluency/96/wall.png', duration: '2-3 days', rating: 4.8, reviews: 2180, features: ['Custom texture creation', 'Premium paint selection', 'Design consultation', 'Professional application'] }
      ],
      'Protective Services': [
        { id: 'pt4', title: 'Waterproofing', price: 2499, image: 'https://img.icons8.com/fluency/96/waterproofing.png', duration: '1-2 days', rating: 4.9, reviews: 3420, features: ['Complete water sealing', 'Crack repair included', 'Long-term protection', '5-year guarantee'] },
        { id: 'pt5', title: 'Crack Filling & Putty Work', price: 999, image: 'https://img.icons8.com/fluency/96/putty-knife.png', duration: '4-6 hrs', rating: 4.7, reviews: 1840, features: ['Deep crack filling', 'Sanding and smoothing', 'Plaster application', 'Wall preparation'] },
        { id: 'pt6', title: 'Wallpaper Installation', price: 699, image: 'https://img.icons8.com/fluency/96/wallpaper.png', duration: '2-4 hrs', rating: 4.8, reviews: 2060, features: ['Wall preparation', 'Professional adhesive', 'Bubble-free installation', 'Seamless finishing'] }
      ]
    }
  },
  Carpentry: {
    icon: '🪑',
    label: 'Carpentry',
    subcategories: {
      'Furniture': [
        { id: 'cr1', title: 'Furniture Assembly', price: 499, image: 'https://img.icons8.com/fluency/96/assembly.png', duration: '1-2 hrs', rating: 4.8, reviews: 3240, features: ['Expert assembly service', 'Hardware installation', 'Quality check included', 'Furniture arrangement help'] },
        { id: 'cr4', title: 'Bed / Wardrobe Repair', price: 599, image: 'https://img.icons8.com/fluency/96/bed.png', duration: '1.5-2 hrs', rating: 4.7, reviews: 2680, features: ['Frame repair and alignment', 'Hinge and latch fixing', 'Drawer mechanism repair', 'Polish and finish'] },
        { id: 'cr6', title: 'Custom Furniture Work', price: 2499, image: 'https://img.icons8.com/fluency/96/custom-furniture.png', duration: '2-3 days', rating: 4.9, reviews: 1840, features: ['Design consultation', 'Custom measurements', 'Material selection', 'Professional craftsmanship'] }
      ],
      'Doors & Windows': [
        { id: 'cr2', title: 'Door & Window Repair', price: 399, image: 'https://img.icons8.com/fluency/96/door.png', duration: '1-1.5 hrs', rating: 4.8, reviews: 2960, features: ['Frame alignment', 'Lock mechanism repair', 'Hinges adjustment', 'Weather sealing'] },
        { id: 'cr3', title: 'Modular Kitchen Repair', price: 999, image: 'https://img.icons8.com/fluency/96/kitchen.png', duration: '2-4 hrs', rating: 4.7, reviews: 1920, features: ['Cabinet alignment', 'Hinge repair', 'Drawer glide fixing', 'Door lock adjustment'] },
        { id: 'cr5', title: 'Lock & Hinge Installation', price: 199, image: 'https://img.icons8.com/fluency/96/lock.png', duration: '30-45 mins', rating: 4.9, reviews: 3420, features: ['Professional installation', 'Security lock setup', 'Smooth door operation', 'Quality materials used'] }
      ]
    }
  },
  Maintenance: {
    icon: '🔨',
    label: 'Home Maintenance',
    subcategories: {
      'Installation': [
        { id: 'mt2', title: 'Curtain Rod Installation', price: 199, image: 'https://img.icons8.com/fluency/96/curtain.png', duration: '30-45 mins', rating: 4.8, reviews: 2140, features: ['Professional wall mounting', 'Level and secure fixing', 'Different rod types supported', 'Bracket included'] },
        { id: 'mt3', title: 'TV Wall Mount Installation', price: 499, image: 'https://img.icons8.com/fluency/96/installation.png', duration: '45-60 mins', rating: 4.9, reviews: 3560, features: ['Professional mounting', 'Cable management', 'VESA compatible', 'Safety testing included'] },
        { id: 'mt5', title: 'Bathroom Accessories Installation', price: 299, image: 'https://img.icons8.com/fluency/96/accessories.png', duration: '1 hr', rating: 4.7, reviews: 1840, features: ['Towel bar installation', 'Soap dish mounting', 'Mirror hanging', 'Waterproof fixing'] }
      ],
      'Handyman': [
        { id: 'mt1', title: 'Handyman Services', price: 399, image: 'https://img.icons8.com/fluency/96/handyman.png', duration: '1-2 hrs', rating: 4.6, reviews: 2680, features: ['All general repairs', 'Tool and material included', 'Quick service', 'Quality workmanship'] },
        { id: 'mt4', title: 'Drilling & Hanging Work', price: 249, image: 'https://img.icons8.com/fluency/96/drill.png', duration: '30 mins', rating: 4.8, reviews: 2320, features: ['Precision drilling', 'Plug and anchor fixing', 'Leveling guarantee', 'Dust-free work'] }
      ]
    }
  },
  Pest: {
    icon: '🦟',
    label: 'Pest Control',
    subcategories: {
      'General Pest Control': [
        { id: 'ps1', title: 'General Pest Control', price: 699, image: 'https://img.icons8.com/fluency/96/pest-control.png', duration: '1-2 hrs', rating: 4.7, reviews: 2640, features: ['Cockroach and ant control', 'Professional-grade treatment', 'Safe for pets and children', 'Follow-up visit included'] },
        { id: 'ps2', title: 'Rodent Treatment', price: 499, image: 'https://img.icons8.com/fluency/96/rat.png', duration: '1-1.5 hrs', rating: 4.8, reviews: 1980, features: ['Rat and mice elimination', 'Safe trapping methods', 'Entry point sealing', 'Prevention measures'] },
        { id: 'ps3', title: 'Mosquito Fogging', price: 599, image: 'https://img.icons8.com/fluency/96/mosquito.png', duration: '1 hr', rating: 4.9, reviews: 3240, features: ['Dengue and malaria protection', 'Government-approved chemicals', 'Non-toxic formula', 'Safe for residents'] }
      ],
      'Specialized Services': [
        { id: 'ps4', title: 'Termite Treatment', price: 999, image: 'https://img.icons8.com/fluency/96/termite.png', duration: '2-3 hrs', rating: 4.8, reviews: 2320, features: ['Complete termite elimination', 'Wood treatment included', 'Barrier application', '2-year guarantee'] },
        { id: 'ps5', title: 'Bed Bug Treatment', price: 799, image: 'https://img.icons8.com/fluency/96/bed-bug.png', duration: '1.5-2 hrs', rating: 4.9, reviews: 2960, features: ['Heat and chemical treatment', 'Mattress and furniture spraying', 'Room sealing check', 'Follow-up services'] },
        { id: 'ps6', title: 'Wood Borers Treatment', price: 599, image: 'https://img.icons8.com/fluency/96/wood.png', duration: '1-2 hrs', rating: 4.7, reviews: 1620, features: ['Wood boring insect control', 'Deep penetration treatment', 'Wooden structure inspection', 'Preventive coating'] }
      ]
    }
  }
};

const CATEGORY_VIEW_RULES = {
  Beauty: {
    "salon-for-women": {
      subcategories: [
        "Super saver packages",
        "Waxing",
        "Korean facial",
        "Signature facials",
        "Cleanup",
        "Pedicure & manicure",
        "Threading & face wax",
        "Bleach, detan & massage"
      ],
    },
    "spa-for-women": {
      subcategories: [
        "Super saver packs",
        "Stress relief",
        "Pain relief",
        "Skin care scrubs",
        "Post Natal",
        "Spa add-ons",
      ],
    },
    "hair-studio-for-women": {
      subcategories: [
        "Packages",
        "Blow-dry & style",
        "Cut & trim",
        "Hair care",
        "Keratin & botox",
        "Hair colour",
        "Hair extensions",
        "Fashion color",
      ],
    },
    "makeup-styling-studio": {
      subcategories: [
        "Packages",
        "Group deals",
        "Saree draping",
        "Wedding combos",
        "Party makeup",
        "Hair styling",
        "Add-ons",
      ],
    },
  },
  Men: {
    "salon-for-men": {
      subcategories: ["packages", "Pedicure", "Hair care", "Face care", "Shave", "Hair color"],
    },
    "massage-for-men": {
      subcategories: ["Massage"],
      serviceTitleKeywords: ["massage"],
    },
  },
  Cleaning: {
    "bathroom-cleaning": {
      subcategories: ["Home Cleaning"],
      serviceTitleKeywords: ["bathroom", "toilet"],
    },
    "kitchen-cleaning": {
      subcategories: ["Home Cleaning"],
      serviceTitleKeywords: ["kitchen"],
    },
    "living-bedroom-cleaning": {
      subcategories: ["Home Cleaning"],
      serviceTitleKeywords: ["full home", "sofa", "carpet"],
    },
    "full-home-movein-cleaning": {
      subcategories: ["Home Cleaning"],
      serviceTitleKeywords: ["full home", "deep cleaning", "move"],
    },
  },
  Pest: {
    "cockroach-control": {
      subcategories: ["General Pest Control"],
      serviceTitleKeywords: ["general pest", "cockroach", "ant"],
    },
    "termite-control": {
      subcategories: ["Specialized Services"],
      serviceTitleKeywords: ["termite"],
    },
    "bed-bugs-control": {
      subcategories: ["Specialized Services"],
      serviceTitleKeywords: ["bed bug"],
    },
    "ant-control": {
      subcategories: ["General Pest Control"],
      serviceTitleKeywords: ["general pest", "ant"],
    },
  },
  Electrician: {
    "electrician-repair": {
      subcategories: ["Switch & Socket"],
    },
    "festival-lights": {
      subcategories: ["Light"],
    },
    "fan-installation": {
      subcategories: ["Fan"],
      serviceTitleKeywords: ["fan"],
    },
  },
  Plumber: {
    "plumber-repair": {
      subcategories: ["Plumbing Repairs", "Installation Services"],
    },
  },
  Carpentry: {
    "carpenter-general": {
      subcategories: ["Furniture", "Doors & Windows"],
    },
    "furniture-assembly": {
      subcategories: ["Furniture"],
      serviceTitleKeywords: ["furniture", "assembly"],
    },
    "ikea-furniture-assembly": {
      subcategories: ["Furniture"],
      serviceTitleKeywords: ["furniture", "assembly"],
    },
    "wood-polish": {
      subcategories: ["Furniture"],
      serviceTitleKeywords: ["furniture", "custom"],
    },
  },
  Painting: {
    "full-home-painting": {
      subcategories: ["Wall Services", "Protective Services"],
    },
    "walls-rooms-painting": {
      subcategories: ["Wall Services"],
    },
    "tile-grouting": {
      subcategories: ["Protective Services"],
    },
  },
  Appliances: {
    ac: {
      subcategories: ["Services"],
      serviceTitleKeywords: ["ac "],
    },
    "washing machine": {
      subcategories: ["Super saver packages", "Service", "Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["washing machine"],
    },
    television: {
      subcategories: ["Services", "Repair & Gas Refill"],
    },
    laptop: {
      subcategories: ["Services", "Repair & Gas Refill"],
    },
    "air purifier": {
      subcategories: ["Services"],
    },
    "air cooler": {
      subcategories: ["Services"],
    },
    geyser: {
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["geyser"],
    },
    "water purifier": {
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["water purifier", "ro"],
    },
    refrigerator: {
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["refrigerator"],
    },
    microwave: {
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["microwave"],
    },
    chimney: {
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["chimney"],
    },
    "stove / hob": {
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
      serviceTitleKeywords: ["stove", "hob"],
    },
  },
};

const PLUMBER_SELECT_SERVICE_ORDER = [
  "pl1",
  "pl3",
  "pl7",
  "pl8",
  "pl2",
  "pl5",
  "pl4",
  "pl6",
  "pl9",
];

const getSelectServiceLabel = (subcategoryName) => {
  if (subcategoryName === "Install/uninst") {
    return "Installation / Uninstallation";
  }
  return subcategoryName;
};

const formatCompactCount = (value) => {
  const count = Number(value) || 0;
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${Math.round(count / 1000)}K`;
  }
  return `${count}`;
};

const buildGeneratedSubServices = (service) => {
  const optionCount = Math.min(Math.max(Number(service?.options) || 0, 0), 8);
  if (optionCount <= 1) {
    return [];
  }

  const basePrice = Number(service?.price) || 0;
  const title = String(service?.title || "").toLowerCase();
  const unitLabel = title.includes("ac") ? "AC" : "Unit";
  const discounts = [0, 0, 8, 17, 21, 23, 25, 27, 30];

  return Array.from({ length: optionCount }, (_, index) => {
    const quantity = index + 1;
    const rawPrice = basePrice * quantity;
    const discount = discounts[quantity] || 0;
    const discountedPrice =
      discount > 0 ? Math.round(rawPrice * (1 - discount / 100)) : rawPrice;
    const label = quantity === 1 ? `1 ${unitLabel}` : `${quantity} ${unitLabel}s`;
    const perUnit = quantity > 1 ? Math.round(discountedPrice / quantity) : null;

    return {
      id: `${service.id}-option-${quantity}`,
      title: label,
      price: discountedPrice,
      oldPrice: discount > 0 ? rawPrice : null,
      subtitle: perUnit ? `(₹${perUnit}/${unitLabel})` : null,
      discountText: discount > 0 ? `${discount}% off` : null,
    };
  });
};

const getServiceOptionPackages = (service) => {
  if (Array.isArray(service?.subServices) && service.subServices.length > 0) {
    return service.subServices;
  }
  return buildGeneratedSubServices(service);
};

const buildServiceReviewBreakdown = (service) => {
  if (Array.isArray(service?.reviewBreakdown) && service.reviewBreakdown.length > 0) {
    return service.reviewBreakdown;
  }

  const total = Math.max(Number(service?.reviews) || 0, 100);
  const shares = [0.62, 0.23, 0.08, 0.04, 0.03];

  return [5, 4, 3, 2, 1].map((stars, idx) => ({
    stars,
    count: Math.round(total * shares[idx]),
  }));
};

const buildServiceCustomerReviews = (service) => {
  if (Array.isArray(service?.customerReviews) && service.customerReviews.length > 0) {
    return service.customerReviews;
  }

  return [
    {
      id: `${service?.id || "service"}-review-1`,
      user: "Anis Momin",
      rating: 5,
      date: "Mar 1, 2026",
      text: `${service?.title || "Service"} was very professional and the technician explained everything clearly.`,
    },
    {
      id: `${service?.id || "service"}-review-2`,
      user: "Sharad Kulshrestha",
      rating: 5,
      date: "Mar 1, 2026",
      text: "Work quality was excellent and completed neatly without unnecessary suggestions.",
    },
    {
      id: `${service?.id || "service"}-review-3`,
      user: "Richa Verma",
      rating: 4,
      date: "Feb 28, 2026",
      text: "Overall good experience, on-time visit and noticeable improvement after service.",
    },
  ];
};

const normalizeSubcategoryName = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeTypeKey = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const resolveSubcategoryKey = (subcategories = {}, requestedSubcategory) => {
  if (!requestedSubcategory) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(subcategories, requestedSubcategory)) {
    return requestedSubcategory;
  }

  const normalizedRequested = normalizeSubcategoryName(requestedSubcategory);
  if (!normalizedRequested) {
    return null;
  }

  return (
    Object.keys(subcategories).find(
      (key) => normalizeSubcategoryName(key) === normalizedRequested
    ) || null
  );
};

const getCategoryViewRule = (categoryKey, serviceType) => {
  if (!categoryKey || !serviceType) {
    return null;
  }

  const categoryRules = CATEGORY_VIEW_RULES[categoryKey];
  if (!categoryRules) {
    return null;
  }

  return categoryRules[normalizeTypeKey(serviceType)] || null;
};

const getFilteredSubcategoryEntries = (categoryKey, subcategories, serviceType) => {
  const entries = Object.entries(subcategories || {});
  const viewRule = getCategoryViewRule(categoryKey, serviceType);

  if (!viewRule?.subcategories?.length) {
    return entries;
  }

  const allowedSet = new Set(
    viewRule.subcategories.map((subcategory) => normalizeSubcategoryName(subcategory))
  );

  const filteredEntries = entries.filter(([subcategory]) =>
    allowedSet.has(normalizeSubcategoryName(subcategory))
  );

  return filteredEntries.length > 0 ? filteredEntries : entries;
};

const filterServicesByViewRule = (services, categoryKey, serviceType) => {
  if (!Array.isArray(services) || services.length === 0) {
    return [];
  }

  const viewRule = getCategoryViewRule(categoryKey, serviceType);
  if (!viewRule) {
    return services;
  }

  if (Array.isArray(viewRule.serviceIds) && viewRule.serviceIds.length > 0) {
    const idSet = new Set(viewRule.serviceIds);
    const filteredById = services.filter((service) => idSet.has(service.id));
    if (filteredById.length > 0) {
      return filteredById;
    }
  }

  if (
    Array.isArray(viewRule.serviceTitleKeywords) &&
    viewRule.serviceTitleKeywords.length > 0
  ) {
    const keywords = viewRule.serviceTitleKeywords.map((keyword) =>
      normalizeSubcategoryName(keyword)
    );
    const filteredByKeyword = services.filter((service) => {
      const normalizedTitle = normalizeSubcategoryName(service?.title || "");
      return keywords.some((keyword) => normalizedTitle.includes(keyword));
    });

    if (filteredByKeyword.length > 0) {
      return filteredByKeyword;
    }
  }

  return services;
};

export default function Services() {

  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity: updateCartItemQuantity,
  } = useCart();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [serviceDetailsModal, setServiceDetailsModal] = useState(null);
  const [selectedServiceOptionId, setSelectedServiceOptionId] = useState(null);
  
  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'price-low-to-high', 'price-high-to-low', 'rating'
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const leftDrawerRef = useRef(null);
  const rightDrawerRef = useRef(null);
  const previousDrawerOpenRef = useRef(false);
  const drawerReturnFocusRef = useRef(null);
  const mobileCategoriesButtonRef = useRef(null);
  const mobileFiltersButtonRef = useRef(null);
  const mainPanelRef = useRef(null);
  const stickyBannerRef = useRef(null);
  const subcategorySectionRefs = useRef({});
  const pendingScrollSubcategoryRef = useRef(null);
  const serviceCardRefs = useRef({});
  const pendingScrollServiceRef = useRef(null);
  
  const location = useLocation();
  const serviceType = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance")
    );
  }, [location.search]);

  const getServicesUrlWithCurrentContext = (category, subcategory = null) => {
    const params = new URLSearchParams(location.search);
    const extraParams = {};
    const currentServiceType =
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance");

    if (currentServiceType) {
      extraParams.serviceType = currentServiceType;
    }

    const appliance = params.get("appliance");
    if (category === "Appliances" && appliance) {
      extraParams.appliance = appliance;
    }

    return buildServicesUrl(category, subcategory, extraParams);
  };

  useEffect(() => {
    const { category, subcategory } = parseServicesParams(location.search);
    const params = new URLSearchParams(location.search);
    const rawCategory = params.get("category") || null;
    const normalizedCategory = normalizeCategoryKey(rawCategory);
    const routeServiceType =
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance");

    if (rawCategory && normalizedCategory && rawCategory !== normalizedCategory) {
      params.set("category", normalizedCategory);
      const canonicalQuery = params.toString();
      navigate(canonicalQuery ? `/services?${canonicalQuery}` : "/services", {
        replace: true,
      });
      return;
    }

    if (!isValidCategory(category, SERVICES_DATA)) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setShowCategoryModal(false);
      return;
    }

    const subcategories = SERVICES_DATA[category].subcategories;
    const visibleSubcategories = getFilteredSubcategoryEntries(
      category,
      subcategories,
      routeServiceType
    ).map(([subcategoryKey]) => subcategoryKey);

    setSelectedCategory(category);

    if (visibleSubcategories.length === 0) {
      setSelectedSubcategory(null);
      setShowCategoryModal(false);
      return;
    }

    const resolvedSubcategory = resolveSubcategoryKey(subcategories, subcategory);
    const isVisibleSubcategory =
      resolvedSubcategory && visibleSubcategories.includes(resolvedSubcategory);

    setSelectedSubcategory(
      isVisibleSubcategory ? resolvedSubcategory : visibleSubcategories[0]
    );
    setShowCategoryModal(false);
  }, [location.search, navigate]);

  const visibleSubcategoryEntries = useMemo(() => {
    if (!selectedCategory || !SERVICES_DATA[selectedCategory]) {
      return [];
    }

    return getFilteredSubcategoryEntries(
      selectedCategory,
      SERVICES_DATA[selectedCategory].subcategories,
      serviceType
    );
  }, [selectedCategory, serviceType]);

  useEffect(() => {
    const handleResize = () => {
      const nextMobileState = window.innerWidth < 1024;
      setIsMobileLayout(nextMobileState);
      if (!nextMobileState) {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLeftDrawerOpen && !isRightDrawerOpen && !serviceDetailsModal) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (serviceDetailsModal) {
          setServiceDetailsModal(null);
          setSelectedServiceOptionId(null);
        }
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLeftDrawerOpen, isRightDrawerOpen, serviceDetailsModal]);

  useEffect(() => {
    const isAnyDrawerOpen = isLeftDrawerOpen || isRightDrawerOpen;
    const shouldLockScroll = isAnyDrawerOpen || Boolean(serviceDetailsModal);

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
      if (isLeftDrawerOpen) {
        leftDrawerRef.current?.focus();
      } else if (isRightDrawerOpen) {
        rightDrawerRef.current?.focus();
      }
    } else {
      document.body.style.overflow = "";
      if (previousDrawerOpenRef.current && drawerReturnFocusRef.current) {
        drawerReturnFocusRef.current.focus();
        drawerReturnFocusRef.current = null;
      }
    }

    previousDrawerOpenRef.current = isAnyDrawerOpen;

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLeftDrawerOpen, isRightDrawerOpen, serviceDetailsModal]);

  const closeDrawers = () => {
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(false);
  };

  const openLeftDrawer = () => {
    drawerReturnFocusRef.current = mobileCategoriesButtonRef.current;
    setIsRightDrawerOpen(false);
    setIsLeftDrawerOpen(true);
  };

  const openRightDrawer = () => {
    drawerReturnFocusRef.current = mobileFiltersButtonRef.current;
    setIsLeftDrawerOpen(false);
    setIsRightDrawerOpen(true);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleMinRatingChange = (value) => {
    setMinRating(value);
    if (isMobileLayout) closeDrawers();
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(10000);
    setMinRating(0);
    setSortBy("relevance");
    if (isMobileLayout) closeDrawers();
  };


  const handleAddToCart = (service) => {
    const quantity = quantities[service.id] || 1;
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image,
      quantity: quantity
    });
    addToast(`${service.title} (Qty: ${quantity}) added to cart!`, 'success');
    setQuantities({ ...quantities, [service.id]: 1 });
  };

  const closeServiceDetailsModal = () => {
    setServiceDetailsModal(null);
    setSelectedServiceOptionId(null);
  };

  const openServiceDetailsModal = (service) => {
    if (!service) {
      return;
    }

    const optionPackages = getServiceOptionPackages(service);
    if (optionPackages.length === 0) {
      handleAddToCart(service);
      return;
    }

    setServiceDetailsModal(service);
    setSelectedServiceOptionId(optionPackages[0].id);
  };

  const handleAddServiceOptionToCart = (service, option) => {
    if (!service || !option) {
      return;
    }

    const optionPrice = Number(option.price) || Number(service.price) || 0;
    const cartTitle = option.title ? `${service.title} - ${option.title}` : service.title;

    addToCart({
      id: option.id || `${service.id}-option`,
      title: cartTitle,
      price: optionPrice,
      image: service.image,
    });

    addToast(`${cartTitle} added to cart!`, "success");
  };

  const handlePrimaryServiceAction = (service) => {
    if (!service) {
      return;
    }

    const optionPackages = getServiceOptionPackages(service);
    if (optionPackages.length > 0) {
      openServiceDetailsModal(service);
      return;
    }

    handleAddToCart(service);
  };

  const updateQuantity = (serviceId, change) => {
    const current = quantities[serviceId] || 1;
    const newQuantity = Math.max(1, current + change);
    setQuantities({ ...quantities, [serviceId]: newQuantity });
  };

  // Not used in this layout
  const handleViewService = () => {};

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
    setSelectedSubcategory(null);
    setSelectedServiceId(null);
    pendingScrollSubcategoryRef.current = null;
    pendingScrollServiceRef.current = null;
    navigate(buildServicesUrl(category));
  };

  const scrollToSubcategorySection = (subcategory, behavior = "smooth") => {
    const scrollContainer = mainPanelRef.current;
    const sectionNode = subcategorySectionRefs.current[subcategory];
    const scrollOffset = isMobileLayout ? 10 : 16;

    if (!scrollContainer || !sectionNode) {
      return false;
    }

    const mainPanelRect = scrollContainer.getBoundingClientRect();
    const sectionRect = sectionNode.getBoundingClientRect();
    const nextScrollTop =
      scrollContainer.scrollTop +
      (sectionRect.top - mainPanelRect.top) -
      scrollOffset;

    scrollContainer.scrollTo({
      top: Math.max(nextScrollTop, 0),
      behavior,
    });
    return true;
  };

  const setSubcategorySectionRef = (subcategory) => (node) => {
    if (node) {
      subcategorySectionRefs.current[subcategory] = node;
      return;
    }

    delete subcategorySectionRefs.current[subcategory];
  };

  const getServiceRefKey = (subcategory, serviceId) =>
    `${subcategory}::${serviceId}`;

  const setServiceCardRef = (subcategory, serviceId) => (node) => {
    const key = getServiceRefKey(subcategory, serviceId);
    if (node) {
      serviceCardRefs.current[key] = node;
      return;
    }

    delete serviceCardRefs.current[key];
  };

  const scrollToServiceCard = (subcategory, serviceId, behavior = "smooth") => {
    const scrollContainer = mainPanelRef.current;
    const cardNode = serviceCardRefs.current[getServiceRefKey(subcategory, serviceId)];
    const scrollOffset = isMobileLayout ? 10 : 16;

    if (!scrollContainer || !cardNode) {
      return false;
    }

    const mainPanelRect = scrollContainer.getBoundingClientRect();
    const cardRect = cardNode.getBoundingClientRect();
    const nextScrollTop =
      scrollContainer.scrollTop + (cardRect.top - mainPanelRect.top) - scrollOffset;

    scrollContainer.scrollTo({
      top: Math.max(nextScrollTop, 0),
      behavior,
    });

    return true;
  };

  const handleSubcategorySelect = (subcategory, options = {}) => {
    const { shouldScroll = true } = options;
    if (selectedSubcategory === subcategory && shouldScroll) {
      const nextUrl = getServicesUrlWithCurrentContext(selectedCategory, subcategory);
      setShowCategoryModal(false);
      setSelectedServiceId(null);
      pendingScrollServiceRef.current = null;
      scrollToSubcategorySection(subcategory, "smooth");
      if (isMobileLayout) closeDrawers();
      if (`${location.pathname}${location.search}` !== nextUrl) {
        navigate(nextUrl);
      }
      return;
    }

    setSelectedSubcategory(subcategory);
    setShowCategoryModal(false);
    setSelectedServiceId(null);
    pendingScrollSubcategoryRef.current = shouldScroll ? subcategory : null;
    pendingScrollServiceRef.current = null;
    if (isMobileLayout) closeDrawers();
    navigate(getServicesUrlWithCurrentContext(selectedCategory, subcategory));
  };

  const handlePlumberServiceSelect = (serviceItem) => {
    if (!serviceItem?.subcategory || !serviceItem?.id) {
      return;
    }

    const nextUrl = getServicesUrlWithCurrentContext(
      selectedCategory,
      serviceItem.subcategory
    );

    setSelectedServiceId(serviceItem.id);
    setShowCategoryModal(false);
    pendingScrollSubcategoryRef.current = null;
    pendingScrollServiceRef.current = {
      subcategory: serviceItem.subcategory,
      serviceId: serviceItem.id,
    };

    if (isMobileLayout) closeDrawers();

    if (selectedSubcategory !== serviceItem.subcategory) {
      setSelectedSubcategory(serviceItem.subcategory);
      navigate(nextUrl);
      return;
    }

    const didScroll = scrollToServiceCard(
      serviceItem.subcategory,
      serviceItem.id,
      "smooth"
    );

    if (didScroll) {
      pendingScrollServiceRef.current = null;
    }

    if (`${location.pathname}${location.search}` !== nextUrl) {
      navigate(nextUrl);
    }
  };

  // Filter and sort services
  const getFilteredAndSortedServices = (services) => {
    let filtered = services.filter(service => {
      const matchesPrice = service.price >= minPrice && service.price <= maxPrice;
      const matchesRating = service.rating >= minRating;
      return matchesPrice && matchesRating;
    });

    // Apply sorting
    if (sortBy === 'price-low-to-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-to-low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  // Not used in this layout
  const handleBack = () => {
    setShowCategoryModal(false);
  };

  useEffect(() => {
    setServiceDetailsModal(null);
    setSelectedServiceOptionId(null);
  }, [selectedCategory, selectedSubcategory]);

  useEffect(() => {
    if (selectedCategory !== "Plumber") {
      setSelectedServiceId(null);
      pendingScrollServiceRef.current = null;
      return;
    }

    if (!selectedSubcategory) {
      setSelectedServiceId(null);
      return;
    }

    const subcategoryServices =
      SERVICES_DATA.Plumber?.subcategories?.[selectedSubcategory] || [];

    if (subcategoryServices.length === 0) {
      setSelectedServiceId(null);
      return;
    }

    const hasCurrentSelection = subcategoryServices.some(
      (service) => service.id === selectedServiceId
    );

    if (!hasCurrentSelection) {
      setSelectedServiceId(subcategoryServices[0].id);
    }
  }, [selectedCategory, selectedSubcategory, selectedServiceId]);

  useEffect(() => {
    if (!selectedSubcategory) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const pendingServiceTarget = pendingScrollServiceRef.current;

      if (pendingServiceTarget) {
        const didScrollToService = scrollToServiceCard(
          pendingServiceTarget.subcategory,
          pendingServiceTarget.serviceId,
          "smooth"
        );

        if (didScrollToService) {
          pendingScrollServiceRef.current = null;
          pendingScrollSubcategoryRef.current = null;
          return;
        }
      }

      const targetSubcategory =
        pendingScrollSubcategoryRef.current || selectedSubcategory;
      const behavior =
        pendingScrollSubcategoryRef.current ? "smooth" : "auto";
      const didScrollToSubcategory = scrollToSubcategorySection(
        targetSubcategory,
        behavior
      );

      if (
        didScrollToSubcategory &&
        pendingScrollSubcategoryRef.current === targetSubcategory
      ) {
        pendingScrollSubcategoryRef.current = null;
      }
    }, 60);

    return () => window.clearTimeout(scrollTimer);
  }, [selectedSubcategory, minPrice, maxPrice, minRating, sortBy, isMobileLayout]);

  // Render Main Layout
  if (!selectedCategory) {
    // Show category selection grid
    return (
      <section className="services-category-landing">
        <div className="services-category-landing-inner">
          <p className="services-category-eyebrow">HomeService99 Categories</p>
          <h1 className="services-category-title">What are you looking for?</h1>
          <p className="services-category-subtitle">Select a service category to explore</p>

          <div className="services-category-meta">
            <span>{Object.keys(SERVICES_DATA).length}+ categories</span>
            <span>Verified professionals</span>
            <span>Transparent pricing</span>
          </div>

          <div className="services-category-grid">
            {Object.entries(SERVICES_DATA).map(([key, data]) => (
              <button
                key={key}
                type="button"
                className="services-category-card"
                onClick={() => handleCategorySelect(key)}
                aria-label={`Explore ${data.label}`}
              >
                <span className="services-category-card-icon" aria-hidden="true">{data.icon}</span>
                <span className="services-category-card-label">{data.label}</span>
                <span className="services-category-card-hint">Tap to explore</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Category Modal - Show subcategories
  if (showCategoryModal && selectedCategory) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'clamp(12px, 2vw, 20px)',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'clamp(14px, 2vw, 20px)',
          maxWidth: '600px',
          width: '100%',
          padding: 'clamp(24px, 3vw, 32px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {/* Close Button */}
          <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: 'clamp(14px, 1.5vw, 20px)',
              right: 'clamp(14px, 1.5vw, 20px)',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: 'clamp(22px, 2.5vw, 28px)',
              cursor: 'pointer',
              padding: '0',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>

          {/* Modal Title */}
          <h2 style={{
            fontSize: 'clamp(18px, 3.5vw, 24px)',
            fontWeight: '700',
            marginBottom: 'clamp(4px, 0.8vw, 8px)',
            color: '#0f172a',
            paddingRight: '40px'
          }}>
            {SERVICES_DATA[selectedCategory].label}
          </h2>

          {/* Modal Subtitle */}
          <p style={{
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            color: '#6b7280',
            margin: '0 0 clamp(24px, 2vw, 32px) 0'
          }}>
            Choose a category
          </p>

          {/* Subcategories Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(100px, 20vw, 130px), 1fr))',
            gap: 'clamp(16px, 2.2vw, 24px)'
          }}>
            {Object.entries(SERVICES_DATA[selectedCategory].subcategories).map(([subcat, services]) => (
              <div
                key={subcat}
                onClick={() => handleSubcategorySelect(subcat)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'clamp(10px, 1.5vw, 14px)',
                  padding: 'clamp(14px, 1.8vw, 18px)',
                  backgroundColor: '#f8f9fb',
                  borderRadius: 'clamp(12px, 1.5vw, 16px)',
                  cursor: 'pointer',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3e8ff';
                  e.currentTarget.style.borderColor = '#d8b4fe';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(168,85,247,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Service Image */}
                <div style={{
                  width: 'clamp(56px, 12vw, 80px)',
                  height: 'clamp(56px, 12vw, 80px)',
                  borderRadius: 'clamp(10px, 1.2vw, 14px)',
                  overflow: 'hidden',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <img
                    src={services[0]?.image}
                    alt={subcat}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Subcategory Name */}
                <p style={{
                  fontSize: 'clamp(12px, 1.8vw, 14px)',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0',
                  lineHeight: '1.3'
                }}>
                  {subcat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main two-column layout for selected category
  const categoryData = SERVICES_DATA[selectedCategory];
  const subcategories = visibleSubcategoryEntries;
  const baseServices =
    selectedSubcategory && categoryData.subcategories[selectedSubcategory]
      ? categoryData.subcategories[selectedSubcategory]
      : [];
  const services = filterServicesByViewRule(
    baseServices,
    selectedCategory,
    serviceType
  );
  const filteredServices = getFilteredAndSortedServices(services);
  const serviceSections = subcategories
    .map(([subcategoryName, subcategoryServices]) => {
      const visibleServices = filterServicesByViewRule(
        subcategoryServices,
        selectedCategory,
        serviceType
      );

      return {
        subcategory: subcategoryName,
        services: getFilteredAndSortedServices(visibleServices),
      };
    })
    .filter((section) => section.services.length > 0);
  const totalVisibleServices = serviceSections.reduce(
    (total, section) => total + section.services.length,
    0
  );
  const featuredService =
    filteredServices[0] || serviceSections[0]?.services[0] || null;
  const plumberServiceLookup = {};
  if (selectedCategory === "Plumber") {
    subcategories.forEach(([subcategoryName, subcategoryServices]) => {
      const visibleServices = filterServicesByViewRule(
        subcategoryServices,
        selectedCategory,
        serviceType
      );

      visibleServices.forEach((service) => {
        if (!plumberServiceLookup[service.id]) {
          plumberServiceLookup[service.id] = {
            ...service,
            subcategory: subcategoryName,
          };
        }
      });
    });
  }
  const firstPlumberServiceIdForSubcategory =
    selectedCategory === "Plumber"
      ? PLUMBER_SELECT_SERVICE_ORDER.find(
          (serviceId) =>
            plumberServiceLookup[serviceId]?.subcategory === selectedSubcategory
        ) || null
      : null;
  const selectServiceItems =
    selectedCategory === "Plumber"
      ? PLUMBER_SELECT_SERVICE_ORDER.map((serviceId) => plumberServiceLookup[serviceId])
          .filter(Boolean)
          .map((service) => ({
            key: service.id,
            label: service.title,
            image: service.image,
            badge: service.badge || null,
            subcategory: service.subcategory,
            serviceId: service.id,
            isPlumberItem: true,
          }))
      : subcategories.map(([subcategoryName, subcategoryServices]) => ({
          key: subcategoryName,
          label: getSelectServiceLabel(subcategoryName),
          image: subcategoryServices[0]?.image,
          badge: subcategoryServices[0]?.badge || null,
          subcategory: subcategoryName,
          serviceId: null,
          isPlumberItem: false,
        }));
  const featuredServiceOptionsCount = featuredService
    ? getServiceOptionPackages(featuredService).length
    : 0;
  const serviceDetailsOptions = serviceDetailsModal
    ? getServiceOptionPackages(serviceDetailsModal)
    : [];
  const selectedServiceOption =
    serviceDetailsOptions.find((option) => option.id === selectedServiceOptionId) ||
    serviceDetailsOptions[0] ||
    null;
  const serviceDetailsReviewBreakdown = serviceDetailsModal
    ? buildServiceReviewBreakdown(serviceDetailsModal)
    : [];
  const serviceDetailsReviews = serviceDetailsModal
    ? buildServiceCustomerReviews(serviceDetailsModal)
    : [];
  const maxReviewBreakdownCount = serviceDetailsReviewBreakdown.reduce(
    (maxCount, item) => Math.max(maxCount, Number(item?.count) || 0),
    0
  );
  return (
    <div
      className="services-layout"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)",
        display: "grid",
        gridTemplateColumns: isMobileLayout ? "1fr" : "252px 1fr 252px",
        gap: 0,
        width: "100%",
      }}
    >
      {/* LEFT SIDEBAR - FIXED */}
      <aside
        className={`services-left-panel services-left-drawer${isLeftDrawerOpen ? " is-open" : ""}`}
        ref={leftDrawerRef}
        tabIndex={-1}
        style={{
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div className="services-drawer-header">
          <h3>Categories</h3>
          <button type="button" className="services-drawer-close" onClick={closeDrawers} aria-label="Close categories panel">
            Close
          </button>
        </div>
        {/* Category Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef7 100%)',
          borderRadius: 'clamp(8px, 1.2vw, 12px)',
          padding: 'clamp(10px, 1.2vw, 14px)',
          textAlign: 'center',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: '700', margin: '0 0 clamp(6px, 0.8vw, 8px) 0', color: '#0f172a' }}>
            {categoryData.label}
          </h2>
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            ⭐ <span style={{ fontWeight: '600', color: '#0f172a' }}>4.74</span> <span>(11.4M)</span>
          </div>
        </div>

        {/* Service Type Cards - BEAUTY STYLE GRID */}
        <div style={{
          flex: 1,
          overflow: "hidden",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
        }}>
  <h3
    style={{
      fontSize: "12px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.4px"
    }}
  >
    Select a service
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "10px",
      overflowY: "auto",
      paddingRight: "4px"
    }}
  >
    {selectServiceItems.map((item) => {
      const isActive = item.isPlumberItem
        ? selectedServiceId
          ? selectedServiceId === item.serviceId
          : item.serviceId === firstPlumberServiceIdForSubcategory
        : selectedSubcategory === item.subcategory;
      const normalizedLabel = item.label.toLowerCase();
      const isNew = normalizedLabel.includes("korean");
      const isOffer = normalizedLabel.includes("super");
      const handleSelectClick = item.isPlumberItem
        ? () =>
            handlePlumberServiceSelect({
              id: item.serviceId,
              subcategory: item.subcategory,
            })
        : () => handleSubcategorySelect(item.subcategory);

      return (
        <div
          key={item.key}
          onClick={handleSelectClick}
          style={{
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px"
          }}
        >
          {/* Image Card */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#f2f2f2",
              border: isActive ? "2px solid #2563eb" : "1px solid #e5e7eb",
              boxShadow: isActive
                ? "0 4px 10px rgba(37,99,235,0.2)"
                : "0 1px 3px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease"
            }}
          >
            <img
              src={item.image}
              alt={item.label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />

            {/* BADGES */}
            {isNew && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  background: "#e11d48",
                  color: "#fff",
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontWeight: "700"
                }}
              >
                NEW
              </div>
            )}

            {isOffer && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "6px",
                  background: "#16a34a",
                  color: "#fff",
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontWeight: "700"
                }}
              >
                {item.badge || "20% OFF"}
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "10px",
              fontWeight: "600",
              lineHeight: "1.2",
              color: "#0f172a",
              minHeight: "26px",
              display: "flex",
              alignItems: "center"
            }}
          >
            {item.label}
          </div>
        </div>
      );
    })}
  </div>
</div>
      </aside>

      {/* MIDDLE SECTION - SCROLLABLE */}
      <main
        className="services-main-panel"
        ref={mainPanelRef}
        style={{
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "clamp(12px, 1.5vw, 18px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(12px, 1.5vw, 16px)",
        }}
      >
        {/* Header with banner */}
        <div className="services-mobile-toolbar">
          <button
            ref={mobileCategoriesButtonRef}
            type="button"
            onClick={openLeftDrawer}
            aria-label="Open categories panel"
          >
            Categories
          </button>
          <button
            ref={mobileFiltersButtonRef}
            type="button"
            onClick={openRightDrawer}
            aria-label="Open filters and cart panel"
          >
            Filters & Cart
          </button>
        </div>
        <div className="services-sticky-banner-shell" ref={stickyBannerRef}>
          <div
            className="services-main-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <div className="services-header-banner services-header-banner-static">
              <img
                src={SERVICES_PAGE_BANNER}
                alt={`${categoryData.label} banner`}
                className="services-header-banner-static-image"
              />
            </div>
            <div
              className="services-count-chip"
              style={{
                padding: "8px 12px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {totalVisibleServices} Services
            </div>
          </div>
        </div>

        {selectedSubcategory && (
          <>
            {/* Featured Package */}
            {featuredService && (
            <div
              className="services-featured-card"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #f8fbff 100%)",
                borderRadius: "clamp(10px, 1.2vw, 14px)",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.07)",
                display: "grid",
                gridTemplateColumns: isMobileLayout ? "1fr" : "1.1fr minmax(220px, 320px)",
                gap: "clamp(12px, 1.8vw, 16px)",
                padding: "clamp(12px, 1.5vw, 16px)",
                alignItems: "stretch",
                flexShrink: 0,
                border: "1px solid #e5e7eb",
              }}
            >
              <div className="services-featured-media" style={{ position: 'relative', order: isMobileLayout ? 0 : 2 }}>
                <img
                  src={featuredService.image}
                  alt={featuredService.title}
                  style={{
                    width: '100%',
                    height: 'clamp(160px, 24vw, 220px)',
                    objectFit: 'cover',
                    borderRadius: 'clamp(10px, 1vw, 12px)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#1a1a1a',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  zIndex: 2
                }}>
                  {selectedSubcategory.slice(0, 12)}
                </div>
              </div>
              <div style={{ order: 1 }}>
                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 34px)', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.15 }}>
                  {featuredService.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  {featuredService.features?.[0] || 'Professional service'}
                </p>
                <div className="services-featured-meta" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                      From
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                      ₹{featuredService.price}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600' }}>⭐ {featuredService.rating}</span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>({featuredService.reviews})</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>
                  ⏱ {featuredService.duration}
                </div>
                <button
                  onClick={() => handlePrimaryServiceAction(featuredService)}
                  style={{
                    padding: '10px 24px',
                    background: '#fff',
                    border: '2px solid #2563eb',
                    color: '#2563eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                >
                  Add
                </button>
                {featuredServiceOptionsCount > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                    {featuredServiceOptionsCount} options available
                  </div>
                )}
              </div>
            </div>
            )}

            {/* All Services List - UrbanCompany Style Sections */}
            <div className="services-service-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {serviceSections.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 8px 0' }}>
                    No services found
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    Try adjusting your filters.
                  </p>
                </div>
              ) : (
                serviceSections.map((section) => (
                <section
                  key={section.subcategory}
                  ref={setSubcategorySectionRef(section.subcategory)}
                  className="services-subcategory-section"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    scrollMarginTop: isMobileLayout ? '150px' : '180px'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
                    {section.subcategory}
                  </h3>
                  {section.services.map((service, idx) => {
                    const serviceKey = `${section.subcategory}-${service.id}-${idx}`;
                    const isExpanded = expandedService === serviceKey;
                    const optionPackages = getServiceOptionPackages(service);
                    const hasServiceOptions = optionPackages.length > 0;

                    return (
                      <div
                        key={serviceKey}
                        className="services-service-card"
                        ref={setServiceCardRef(section.subcategory, service.id)}
                        style={{
                          background: "#fff",
                          borderRadius: "12px",
                          padding: "14px",
                          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.08)",
                          display: "grid",
                          gridTemplateColumns: isMobileLayout ? "1fr" : "minmax(0, 1fr) clamp(120px, 15vw, 170px)",
                          gap: "14px",
                          alignItems: "start",
                          transition: "all 0.3s ease",
                          position: "relative",
                          border: "1px solid #e5e7eb"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.12)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Image with Badge */}
                        <div className="services-service-media" style={{ position: 'relative', order: isMobileLayout ? 0 : 2 }}>
                          <img
                            src={service.image}
                            alt={service.title}
                            style={{
                              width: '100%',
                              height: 'clamp(110px, 13vw, 132px)',
                              objectFit: 'cover',
                              borderRadius: '10px'
                            }}
                          />
                          {section.subcategory === 'AC Services' && idx < 3 && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: '#1a1a1a',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              zIndex: 2
                            }}>
                              {idx === 0 ? '2 ACs PACK' : idx === 1 ? '4 ACs PACK' : '5 ACs PACK'}
                            </div>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="services-service-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', order: 1 }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                              {service.title}
                            </h4>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0', lineHeight: '1.4' }}>
                              {service.features?.[0] || 'Professional service included'}
                            </p>
                          </div>

                          {/* Rating, Duration, Price */}
                          <div className="services-service-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
                            <div>
                              <span style={{ color: '#8b5cf6', fontWeight: '700', marginRight: '4px' }}>⭐ {service.rating}</span>
                              <span style={{ color: '#6b7280' }}>({service.reviews})</span>
                            </div>
                            <div style={{ color: '#6b7280' }}>⏱ {service.duration}</div>
                            <div style={{ marginLeft: 'auto' }}>
                              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Starts at</div>
                              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>₹{service.price}</div>
                            </div>
                          </div>

                          {/* Features List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(service.features || []).slice(0, isExpanded ? undefined : 2).map((f, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#4b5563' }}>
                                <span style={{ color: '#059669', fontWeight: 'bold', marginTop: '2px' }}>✓</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>

                          {hasServiceOptions ? (
                            <button
                              onClick={() => openServiceDetailsModal(service)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563eb',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: 0,
                                textAlign: 'left'
                              }}
                            >
                              View details
                            </button>
                          ) : (
                            service.features &&
                            service.features.length > 2 && (
                              <button
                                onClick={() => setExpandedService(isExpanded ? null : serviceKey)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#2563eb',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  padding: 0,
                                  textAlign: 'left'
                                }}
                              >
                                {isExpanded ? 'View less' : 'View details'}
                              </button>
                            )
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handlePrimaryServiceAction(service)}
                              style={{
                                padding: '8px 18px',
                                background: '#fff',
                                border: '2px solid #2563eb',
                                color: '#2563eb',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '80px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2563eb';
                                e.currentTarget.style.color = '#fff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                            >
                              Add
                            </button>
                            {hasServiceOptions && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                {optionPackages.length} options
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>
              ))
              )}
            </div>
          </>
        )}
      </main>

      {/* BACKDROP */}
      {(isLeftDrawerOpen || isRightDrawerOpen) && (
        <button
          type="button"
          className="services-drawer-backdrop"
          aria-label="Close side panel"
          onClick={closeDrawers}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 30,
            border: "none",
            cursor: "pointer",
          }}
        />
      )}

      {/* RIGHT SIDEBAR - FIXED */}
      <aside
        className={`services-right-panel services-right-drawer${isRightDrawerOpen ? " is-open" : ""}`}
        ref={rightDrawerRef}
        tabIndex={-1}
        style={{
          background: "#fff",
          borderLeft: "1px solid #e5e7eb",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div className="services-drawer-header">
          <h3>Filters & Cart</h3>
          <button type="button" className="services-drawer-close" onClick={closeDrawers} aria-label="Close filters and cart panel">
            Close
          </button>
        </div>
        {/* Cart */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              Cart ({cartCount})
            </div>
            <button
              type="button"
              onClick={() => navigate("/cart")}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: 0
              }}
            >
              View cart
            </button>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px 6px' }}>
              <div style={{ fontSize: 'clamp(24px, 4.2vw, 32px)', marginBottom: '6px' }}>🛒</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                No items in your cart
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', marginBottom: '4px', lineHeight: '1.25' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                        ₹{item.price * (item.quantity || 1)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) - 1)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            lineHeight: 1
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '12px', minWidth: '14px', textAlign: 'center', fontWeight: '600' }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.id, (item.quantity || 1) + 1)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            lineHeight: 1
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        marginTop: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>Subtotal</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>₹{cartTotal}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '9px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Go to cart
                </button>
              </div>
            </>
          )}
        </div>

        {/* Offers */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
            Offers
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>💰</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>
                Get Rs 50 coupon
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                After first service delivery
              </div>
            </div>
          </div>
        </div>

        {/* Promises */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          flex: 1,
          overflow: 'auto',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
            UC Promise
          </h4>
          {['Verified Professionals', 'Hassle Free Booking', 'Transparent Pricing'].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#0f172a',
              marginBottom: i < 2 ? '8px' : 0
            }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </aside>

      {serviceDetailsModal && (
        <div
          role="presentation"
          onClick={closeServiceDetailsModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 120,
            display: "flex",
            alignItems: isMobileLayout ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobileLayout ? "0" : "20px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${serviceDetailsModal.title} details`}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(860px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: isMobileLayout ? "16px 16px 0 0" : "16px",
              boxShadow: "0 24px 50px rgba(15, 23, 42, 0.35)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                position: "relative",
                height: isMobileLayout ? "220px" : "290px",
                overflow: "hidden",
                borderRadius: isMobileLayout ? "16px 16px 0 0" : "16px 16px 0 0",
              }}
            >
              <img
                src={serviceDetailsModal.image}
                alt={serviceDetailsModal.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {serviceDetailsModal.promoTag && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#15803d",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  {serviceDetailsModal.promoTag}
                </div>
              )}
              <button
                type="button"
                onClick={closeServiceDetailsModal}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "999px",
                  border: "none",
                  background: "rgba(255, 255, 255, 0.92)",
                  color: "#0f172a",
                  fontSize: "20px",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close service details"
              >
                x
              </button>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: "14px 16px",
                  background: "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.84) 100%)",
                }}
              >
                <div style={{ fontSize: "30px", fontWeight: "700", color: "#fff", lineHeight: 1.1 }}>
                  {serviceDetailsModal.title}
                </div>
                <div style={{ marginTop: "4px", color: "#e2e8f0", fontSize: "17px" }}>
                  {serviceDetailsModal.description ||
                    serviceDetailsModal.features?.[0] ||
                    "Professional doorstep service"}
                </div>
              </div>
            </div>

            <div style={{ padding: isMobileLayout ? "16px 14px 20px" : "20px 22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ color: "#8b5cf6", fontWeight: "700", fontSize: "14px" }}>
                  * {serviceDetailsModal.rating}
                  <span
                    style={{
                      color: "#64748b",
                      fontWeight: "500",
                      marginLeft: "6px",
                      textDecoration: "underline",
                    }}
                  >
                    ({formatCompactCount(serviceDetailsModal.reviews)} reviews)
                  </span>
                </div>
                <div style={{ color: "#047857", fontSize: "14px", fontWeight: "600" }}>
                  Add more and save up to 25%
                </div>
              </div>

              {serviceDetailsOptions.length > 0 && (
                <div style={{ marginTop: "18px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#0f172a" }}>
                    Select an option
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {serviceDetailsOptions.map((option) => {
                      const isOptionActive = option.id === selectedServiceOptionId;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedServiceOptionId(option.id)}
                          style={{
                            border: isOptionActive ? "2px solid #2563eb" : "1px solid #dbe2ea",
                            borderRadius: "10px",
                            padding: "10px",
                            cursor: "pointer",
                            background: isOptionActive ? "#eff6ff" : "#fff",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                            {option.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                              Rs {option.price}
                            </span>
                            {option.oldPrice && (
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: "#94a3b8",
                                  textDecoration: "line-through",
                                }}
                              >
                                Rs {option.oldPrice}
                              </span>
                            )}
                          </div>
                          {option.subtitle && (
                            <div style={{ fontSize: "14px", color: "#334155" }}>{option.subtitle}</div>
                          )}
                          {option.discountText && (
                            <div style={{ fontSize: "14px", color: "#047857", fontWeight: "700" }}>
                              {option.discountText}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAddServiceOptionToCart(serviceDetailsModal, option);
                              closeServiceDetailsModal();
                            }}
                            style={{
                              marginTop: "2px",
                              border: "1px solid #8b5cf6",
                              color: "#7c3aed",
                              background: "#fff",
                              borderRadius: "8px",
                              height: "34px",
                              fontSize: "16px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedServiceOption && (
                <button
                  type="button"
                  onClick={() => {
                    handleAddServiceOptionToCart(serviceDetailsModal, selectedServiceOption);
                    closeServiceDetailsModal();
                  }}
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Add selected option
                </button>
              )}

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "14px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {(serviceDetailsModal.features || []).slice(0, 4).map((feature, index) => (
                  <div
                    key={`${serviceDetailsModal.id}-feature-${index}`}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
                  >
                    <span style={{ fontSize: "12px", lineHeight: "18px", color: "#475569" }}>-</span>
                    <span style={{ fontSize: "14px", color: "#475569", lineHeight: "1.35" }}>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#0f172a" }}>
                  Ratings
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {serviceDetailsReviewBreakdown.map((item) => (
                    <div
                      key={`${serviceDetailsModal.id}-breakdown-${item.stars}`}
                      style={{ display: "grid", gridTemplateColumns: "34px 1fr 44px", gap: "8px", alignItems: "center" }}
                    >
                      <span style={{ color: "#0f172a", fontWeight: "600", fontSize: "13px" }}>
                        * {item.stars}
                      </span>
                      <div style={{ height: "4px", borderRadius: "99px", background: "#e5e7eb", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${
                              maxReviewBreakdownCount > 0
                                ? Math.max(4, (Number(item.count) / maxReviewBreakdownCount) * 100)
                                : 0
                            }%`,
                            height: "100%",
                            background: "#111827",
                          }}
                        />
                      </div>
                      <span style={{ color: "#334155", fontSize: "13px", textAlign: "right" }}>
                        {formatCompactCount(item.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "22px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "18px", color: "#0f172a" }}>
                  All reviews
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {serviceDetailsReviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ fontSize: "17px", fontWeight: "700", color: "#020617", lineHeight: 1.2 }}>
                          {review.user}
                        </div>
                        <div
                          style={{
                            background: "#047857",
                            color: "#fff",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            fontWeight: "700",
                          }}
                        >
                          * {review.rating}
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {review.date} - For {serviceDetailsModal.title}
                      </div>
                      <div style={{ fontSize: "15px", color: "#0f172a", lineHeight: "1.45" }}>{review.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLeftDrawerOpen && !isMobileLayout && (
        <></>  
      )}
    </div>
  );

  // Render Subcategories View
  if (step === 'subcategories' && selectedCategory) {
    const categoryData = SERVICES_DATA[selectedCategory];
    const subcategories = Object.entries(categoryData.subcategories);

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              marginBottom: '16px'
            }}
          >
            ←
          </button>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '24px',
            color: '#0f172a'
          }}>
            {categoryData.label} Services
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subcategories.map(([subcat, services]) => (
              <div key={subcat} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => handleSubcategorySelect(subcat)}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#0f172a',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <span>{subcat}</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {services.length} services
                  </span>
                </button>
                <button
                  onClick={() => navigate(getServicesUrlWithCurrentContext(selectedCategory, subcat))}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#fff',
                    border: '2px solid #2563eb',
                    color: '#2563eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  View Category
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Services View
  if (step === 'services' && selectedCategory && selectedSubcategory) {
    const categoryData = SERVICES_DATA[selectedCategory];
    const services = categoryData.subcategories[selectedSubcategory] || [];

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ paddingTop: '20px', marginBottom: '32px' }}>
            <button
              onClick={handleBack}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                marginBottom: '16px',
                color: '#2563eb'
              }}
            >
              ← Back
            </button>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#0f172a',
              margin: '0'
            }}>
              {selectedSubcategory}
            </h1>
            <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>
              Select a service
            </p>
          </div>

          {/* Service Cards - Detailed List View */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 85vw, 320px), 1fr))',
            gap: 'clamp(12px, 1.8vw, 16px)',
            marginBottom: 'clamp(24px, 3vw, 40px)'
          }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'clamp(10px, 1.2vw, 14px)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Service Content */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Service Image */}
                  <div style={{
                    width: '100%',
                    height: 'clamp(120px, 20vw, 140px)',
                    backgroundColor: '#e5e7eb',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={service.image}
                      alt={service.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.objectFit = 'contain';
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </div>

                  {/* Service Details */}
                  <div style={{ padding: 'clamp(10px, 1.5vw, 14px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                    {/* Title and Rating */}
                    <div>
                      <h3 style={{
                        fontSize: 'clamp(14px, 2.2vw, 16px)',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 clamp(4px, 0.8vw, 8px) 0',
                        lineHeight: '1.3'
                      }}>
                        {service.title}
                      </h3>
                      
                      {/* Rating and Reviews */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 0.8vw, 8px)', marginBottom: 'clamp(8px, 1.2vw, 12px)' }}>
                        <span style={{ color: '#fbbf24', fontSize: 'clamp(12px, 2vw, 16px)' }}>★</span>
                        <span style={{ fontWeight: '600', color: '#0f172a', fontSize: 'clamp(12px, 2vw, 14px)' }}>
                          {service.rating}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: 'clamp(10px, 1.5vw, 12px)' }}>
                          ({service.reviews})
                        </span>
                      </div>

                      {/* Price and Duration */}
                      <div style={{ marginBottom: 'clamp(8px, 1.2vw, 12px)' }}>
                        <p style={{
                          color: '#2563eb',
                          fontWeight: '700',
                          fontSize: 'clamp(13px, 2.2vw, 16px)',
                          margin: '0'
                        }}>
                          ₹{service.price}
                        </p>
                        <p style={{
                          color: '#6b7280',
                          fontSize: 'clamp(10px, 1.5vw, 12px)',
                          margin: '2px 0 0 0'
                        }}>
                          {service.duration}
                        </p>
                      </div>

                      {/* Features - Minimal */}
                      <div style={{ marginBottom: 'clamp(8px, 1.2vw, 10px)' }}>
                        {service.features && (
                          <div>
                            {service.features.slice(0, 1).map((feature, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 'clamp(4px, 0.8vw, 6px)',
                                  marginBottom: 'clamp(4px, 0.6vw, 6px)',
                                  fontSize: 'clamp(10px, 1.5vw, 12px)',
                                  color: '#374151'
                                }}
                              >
                                <span style={{ color: '#10b981', marginTop: '1px', flexShrink: 0 }}>✓</span>
                                <span style={{ lineHeight: '1.2' }}>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 12px)', marginTop: 'clamp(10px, 1.5vw, 14px)' }}>
                      {/* Quantity Selector */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #d1d5db',
                        borderRadius: 'clamp(4px, 0.6vw, 6px)',
                        backgroundColor: '#f9fafb'
                      }}>
                        <button
                          onClick={() => updateQuantity(service.id, -1)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 'clamp(4px, 0.8vw, 6px) clamp(6px, 1vw, 10px)',
                            cursor: 'pointer',
                            fontSize: 'clamp(12px, 1.8vw, 14px)',
                            color: '#6b7280'
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: 'clamp(24px, 4vw, 30px)', textAlign: 'center', fontSize: 'clamp(11px, 1.6vw, 13px)', fontWeight: '600' }}>
                          {quantities[service.id] || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(service.id, 1)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: 'clamp(4px, 0.8vw, 6px) clamp(6px, 1vw, 10px)',
                            cursor: 'pointer',
                            fontSize: 'clamp(12px, 1.8vw, 14px)',
                            color: '#6b7280'
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAddToCart(service)}
                        style={{
                          flex: 1,
                          padding: 'clamp(8px, 1.2vw, 10px) clamp(12px, 1.8vw, 16px)',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'clamp(4px, 0.6vw, 6px)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: 'clamp(12px, 1.8vw, 14px)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }}
                      >
                        Add to Cart
                      </button>

                      {/* View Button */}
                      <button
                        onClick={() => handleViewService(service)}
                        style={{
                          padding: 'clamp(8px, 1.2vw, 10px) clamp(12px, 1.8vw, 16px)',
                          backgroundColor: 'white',
                          border: '2px solid #2563eb',
                          color: '#2563eb',
                          borderRadius: 'clamp(4px, 0.6vw, 6px)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: 'clamp(12px, 1.8vw, 14px)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f9ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export { SERVICES_DATA };

