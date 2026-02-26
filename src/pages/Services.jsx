import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { buildServicesUrl, parseServicesParams, isValidCategory } from "../utils/serviceRouting";



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
        { id: 'pl1', title: 'Tap & Mixer Repair', price: 199, image: 'https://i.postimg.cc/jSnLqHF2/Gemini-Generated-Image-v6q2mfv6q2mfv6q2.png', duration: '30-45 mins', rating: 4.8, reviews: 2560, features: ['Quick leak detection', 'All tap types supported', 'O-ring replacement included', 'Water pressure check'] },
        { id: 'pl4', title: 'Pipe Leakage Fix', price: 349, image: 'https://i.postimg.cc/TYC42mD6/Gemini-Generated-Image-ao0q82ao0q82ao0q.png', duration: '45-60 mins', rating: 4.9, reviews: 2180, features: ['Leak detection and repair', 'Pipe joining techniques', 'Water sealing guarantee', 'Quick-dry compounds used'] },
        { id: 'pl5', title: 'Blockage Removal', price: 399, image: 'https://i.postimg.cc/7Y6NVR5C/Gemini-Generated-Image-oz6j8voz6j8voz6j.png', duration: '1 hr', rating: 4.7, reviews: 1840, features: ['Professional plumbing snake used', 'Complete drain flushing', 'Preventive measures advised', 'Eco-friendly solutions'] }
      ],
      'Installation Services': [
        { id: 'pl2', title: 'Basin & Sink Installation', price: 499, image: 'https://i.postimg.cc/xTwbzpH3/Gemini-Generated-Image-plfkrcplfkrcplfk.png', duration: '1-2 hrs', rating: 4.6, reviews: 1620, features: ['Proper outlet installation', 'Sealant application', 'Water pressure check', 'Bracket and support fitting'] },
        { id: 'pl3', title: 'Toilet Repair / Installation', price: 599, image: 'https://i.postimg.cc/FK8KM7ZP/Gemini-Generated-Image-kd6smxkd6smxkd6s.png', duration: '1-2 hrs', rating: 4.8, reviews: 2040, features: ['Cistern fitting and testing', 'Flush mechanism repair', 'Seat fitting included', 'Water level adjustment'] },
        { id: 'pl6', title: 'Water Motor Installation', price: 999, image: 'https://i.postimg.cc/8C83xGv7/Gemini-Generated-Image-7ra0kk7ra0kk7ra0.png', duration: '2-3 hrs', rating: 4.7, reviews: 1950, features: ['Motor capacity assessment', 'Professional piping work', 'Pressure switch installation', 'Performance guarantee'] },
        { id: 'pl7', title: 'Overhead Tank Pipe Work', price: 699, image: 'https://i.postimg.cc/GtkJ80tp/Gemini-Generated-Image-tgktfetgktfetgkt.png', duration: '2-3 hrs', rating: 4.6, reviews: 1380, features: ['Tank connection setup', 'Overflow pipe arrangement', 'Float valve installation', 'Anti-flood measures'] },
        { id: 'pl8', title: 'Bathroom Fittings Installation', price: 399, image: 'https://i.postimg.cc/50568fBR/Gemini-Generated-Image-1lac7b1lac7b1lac.png', duration: '1-2 hrs', rating: 4.9, reviews: 1720, features: ['Towel rod installation', 'Soap dispenser fitting', 'Mirror mounting', 'Waterproof sealing'] },
        { id: 'pl9', title: 'Full Plumbing Inspection', price: 499, image: 'https://i.postimg.cc/qBSvghHV/Gemini-Generated-Image-x069nvx069nvx069.png', duration: '1-2 hrs', rating: 4.8, reviews: 1640, features: ['Complete water system check', 'Pressure and flow testing', 'Written report provided', 'Maintenance recommendations'] }
      ]
    }
  },
  Appliances: {
    icon: '❄️',
    label: 'AC & Appliances',
    subcategories: {
      'Services': [
        { id: 'ap1', title: 'AC Service', price: 699, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 3420, features: ['Filter cleaning and replacement', 'Coolant level check', 'Compressor inspection', 'Drain pipe cleaning'] },
        { id: 'ap2', title: 'AC Installation', price: 999, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '2-3 hrs', rating: 4.8, reviews: 2840, features: ['Professional wall mounting', 'Copper piping installation', 'Electrical connection setup', 'Gas charging included'] },
        { id: 'ap3', title: 'AC Uninstallation', price: 399, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '1-1.5 hrs', rating: 4.6, reviews: 1520, features: ['Safe gas recovery', 'Proper disposal of unit', 'Wall hole sealing', 'Clean installation area'] },
        { id: 'ap4', title: 'AC Gas Refill', price: 899, image: 'https://img.icons8.com/fluency/96/gas.png', duration: '30-45 mins', rating: 4.9, reviews: 4100, features: ['Genuine R22/R410A gas used', 'Pressure optimization', 'Leak detection included', 'Performance testing'] },
        { id: 'ap5', title: 'AC General Service', price: 599, image: 'https://img.icons8.com/fluency/96/gear.png', duration: '1 hr', rating: 4.5, reviews: 2150, features: ['Complete system checkup', 'Capacitor testing', 'Thermostat calibration', 'Electrical safety check'] },
        { id: 'ap6', title: 'AC Repair (Split/Window)', price: 799, image: 'https://img.icons8.com/fluency/96/repair.png', duration: '1-2 hrs', rating: 4.8, reviews: 2960, features: ['Fault diagnosis and repair', 'All AC brands supported', 'Genuine spare parts', 'Warranty on service'] }
      ],
      'Repair & Gas Refill': [
        { id: 'ap7', title: 'Refrigerator Repair', price: 699, image: 'https://img.icons8.com/fluency/96/fridge.png', duration: '1-2 hrs', rating: 4.6, reviews: 1880, features: ['Cooling system check', 'Compressor repair/replacement', 'Door seal replacement', 'Temperature calibration'] },
        { id: 'ap8', title: 'Washing Machine Repair', price: 599, image: 'https://img.icons8.com/fluency/96/washing-machine.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2640, features: ['Drum and motor repair', 'Water inlet cleaning', 'Drain pipe unclogging', 'Spin cycle testing'] },
        { id: 'ap9', title: 'Microwave Repair', price: 399, image: 'https://img.icons8.com/fluency/96/microwave.png', duration: '1 hr', rating: 4.8, reviews: 1420, features: ['Heating element repair', 'Control panel testing', 'Door mechanism check', 'Safety interlock test'] },
        { id: 'ap10', title: 'Geyser Repair', price: 499, image: 'https://img.icons8.com/fluency/96/geyser.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2180, features: ['Heating element replacement', 'Thermostat repair', 'Pipe connection check', 'Temperature testing'] }
      ],
      'Install/uninst': [
        { id: 'ap7', title: 'Refrigerator Repair', price: 699, image: 'https://img.icons8.com/fluency/96/fridge.png', duration: '1-2 hrs', rating: 4.6, reviews: 1880, features: ['Cooling system check', 'Compressor repair/replacement', 'Door seal replacement', 'Temperature calibration'] },
        { id: 'ap8', title: 'Washing Machine Repair', price: 599, image: 'https://img.icons8.com/fluency/96/washing-machine.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2640, features: ['Drum and motor repair', 'Water inlet cleaning', 'Drain pipe unclogging', 'Spin cycle testing'] },
        { id: 'ap9', title: 'Microwave Repair', price: 399, image: 'https://img.icons8.com/fluency/96/microwave.png', duration: '1 hr', rating: 4.8, reviews: 1420, features: ['Heating element repair', 'Control panel testing', 'Door mechanism check', 'Safety interlock test'] },
        { id: 'ap10', title: 'Geyser Repair', price: 499, image: 'https://img.icons8.com/fluency/96/geyser.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2180, features: ['Heating element replacement', 'Thermostat repair', 'Pipe connection check', 'Temperature testing'] }
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
      subcategories: ["Plumbing Repairs"],
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
      subcategories: ["Repair & Gas Refill", "Install/uninst"],
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
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
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
    const routeServiceType =
      params.get("serviceType") ||
      params.get("beautyType") ||
      params.get("appliance");

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
  }, [location.search]);

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
    if (!isLeftDrawerOpen && !isRightDrawerOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLeftDrawerOpen, isRightDrawerOpen]);

  useEffect(() => {
    const isAnyDrawerOpen = isLeftDrawerOpen || isRightDrawerOpen;

    if (isAnyDrawerOpen) {
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
  }, [isLeftDrawerOpen, isRightDrawerOpen]);

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
    setSearch("");
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

  const updateQuantity = (serviceId, change) => {
    const current = quantities[serviceId] || 1;
    const newQuantity = Math.max(1, current + change);
    setQuantities({ ...quantities, [serviceId]: newQuantity });
  };

  // Not used in this layout
  const handleViewService = (service) => {};

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
    setSelectedSubcategory(null);
    navigate(buildServicesUrl(category));
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowCategoryModal(false);
    if (isMobileLayout) closeDrawers();
    navigate(getServicesUrlWithCurrentContext(selectedCategory, subcategory));
  };

  // Filter and sort services
  const getFilteredAndSortedServices = (services) => {
    let filtered = services.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = service.price >= minPrice && service.price <= maxPrice;
      const matchesRating = service.rating >= minRating;
      return matchesSearch && matchesPrice && matchesRating;
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

  // Render Main Layout
  if (!selectedCategory) {
    // Show category selection grid
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#0f172a' }}>
            What are you looking for?
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Select a service category to explore
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(SERVICES_DATA).map(([key, data]) => (
              <div
                key={key}
                onClick={() => handleCategorySelect(key)}
                style={{
                  padding: '24px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{data.icon}</div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0'
                }}>
                  {data.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
  const offers = [
    "Amazon cashback upto ₹500",
    "CRED cashback upto ₹500"
  ];
  const whyUs = [
    "Verified & Vetted professionals",
    "Matched to your Needs.",
    "Customer support at every step."
  ];

  return (
    <div
      className="services-layout"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)",
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
          padding: "clamp(10px, 1.5vw, 16px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(10px, 1.2vw, 14px)",
          borderRadius: "clamp(6px, 0.8vw, 10px)",
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
<div style={{ flex: 1, overflow: "hidden" }}>
  <h3
    style={{
      fontSize: "12px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "10px",
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
      gap: "12px",
      overflowY: "auto",
      paddingRight: "4px"
    }}
  >
    {subcategories.map(([subcat, servicesArr]) => {
      const isActive = selectedSubcategory === subcat;

      const isNew = subcat.toLowerCase().includes("korean");
      const isOffer = subcat.toLowerCase().includes("super");

      return (
        <div
          key={subcat}
          onClick={() => handleSubcategorySelect(subcat)}
          style={{
            cursor: "pointer",
            textAlign: "center"
          }}
        >
          {/* Image Card */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "14px",
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
              src={servicesArr[0]?.image}
              alt={subcat}
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
                20% OFF
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "11px",
              fontWeight: "600",
              marginTop: "6px",
              lineHeight: "1.2",
              color: "#0f172a"
            }}
          >
            {subcat}
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
        {/* Header with search */}
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
        <div
          className="services-main-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <input
            className="services-search-input"
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1.5px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px'
            }}
          />
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
            {getFilteredAndSortedServices(services).length} Services
          </div>
        </div>

        {selectedSubcategory && (
          <>
            {/* Featured Package */}
            <div
              className="services-featured-card"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #f8fbff 100%)",
                borderRadius: "clamp(10px, 1.2vw, 14px)",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.07)",
                display: "grid",
                gap: "clamp(12px, 1.8vw, 16px)",
                padding: "clamp(12px, 1.5vw, 16px)",
                alignItems: "center",
                flexShrink: 0,
                border: "1px solid #e5e7eb",
              }}
            >
              <div className="services-featured-media" style={{ position: 'relative' }}>
                <img
                  src={services[0]?.image}
                  alt={services[0]?.title}
                  style={{
                    width: '100%',
                    height: 'clamp(120px, 18vw, 160px)',
                    objectFit: 'cover',
                    borderRadius: 'clamp(8px, 1vw, 10px)'
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
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                  {services[0]?.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  {services[0]?.features?.[0] || 'Professional service'}
                </p>
                <div className="services-featured-meta" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                      From
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                      ₹{services[0]?.price}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600' }}>⭐ {services[0]?.rating}</span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>({services[0]?.reviews})</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>
                  ⏱ {services[0]?.duration}
                </div>
                <button
                  onClick={() => handleAddToCart(services[0])}
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
              </div>
            </div>

            {/* All Services List - UrbanCompany Style Sections */}
            <div className="services-service-list" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {getFilteredAndSortedServices(services).length === 0 ? (
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
                    Try adjusting your filters or search term
                  </p>
                </div>
              ) : (
                getFilteredAndSortedServices(services).map((service, idx) => (
                <div key={service.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Section Header (show once per section change) */}
                  {idx === 0 && (
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>
                      {selectedSubcategory}
                    </h3>
                  )}

                  {/* Service Card - Large Format */}
                  <div
                    className="services-service-card"
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.08)",
                      display: "grid",
                      gap: "20px",
                      alignItems: "center",
                      transition: "all 0.3s ease",
                      position: "relative",
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
                    <div className="services-service-media" style={{ position: 'relative' }}>
                      <img
                        src={service.image}
                        alt={service.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      {selectedSubcategory === 'AC Services' && idx < 3 && (
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
                    <div className="services-service-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                          {service.title}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0', lineHeight: '1.4' }}>
                          {service.features?.[0] || 'Professional service included'}
                        </p>
                      </div>

                      {/* Rating, Duration, Price */}
                      <div className="services-service-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: '#8b5cf6', fontWeight: '700', marginRight: '4px' }}>⭐ {service.rating}</span>
                          <span style={{ color: '#6b7280' }}>({service.reviews})</span>
                        </div>
                        <div style={{ color: '#6b7280' }}>⏱ {service.duration}</div>
                        <div style={{ marginLeft: 'auto' }}>
                          <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Starts at</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>₹{service.price}</div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(service.features || []).slice(0, expandedService === service.id ? undefined : 2).map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#4b5563' }}>
                            <span style={{ color: '#059669', fontWeight: 'bold', marginTop: '2px' }}>✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {service.features && service.features.length > 2 && (
                        <button
                          onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
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
                          {expandedService === service.id ? 'View less' : 'View details'}
                        </button>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleAddToCart(service)}
                          style={{
                            padding: '10px 24px',
                            background: '#fff',
                            border: '2px solid #2563eb',
                            color: '#2563eb',
                            borderRadius: '6px',
                            fontSize: '13px',
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
                      </div>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </>
        )}
      </main>

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
          padding: "clamp(10px, 1.5vw, 16px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(10px, 1.2vw, 12px)",
          borderRadius: "clamp(6px, 0.8vw, 10px)",
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
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef7 100%)',
          borderRadius: 'clamp(8px, 1.2vw, 12px)',
          padding: 'clamp(10px, 1.2vw, 14px)',
          textAlign: 'center',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', marginBottom: 'clamp(4px, 0.8vw, 8px)' }}>🛒</div>
          <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#6b7280', fontWeight: '500', marginBottom: 'clamp(6px, 1vw, 8px)' }}>
            No items
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
            → Cart
          </div>
        </div>

        {/* Offers */}
        <div style={{
          background: '#dcfce7',
          borderRadius: '12px',
          padding: '12px',
          flexShrink: 0
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
                Up to ₹150 cashback
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                Via Paytm UPI
              </div>
            </div>
          </div>
        </div>

        {/* Promises */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '12px',
          flex: 1,
          overflow: 'auto'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
            ✨ Promise
          </h4>
          {['Verified Pros', 'Easy Booking', 'Transparent'].map((item, i) => (
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

        {/* FILTERS SECTION */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '14px',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🔍 Filters
          </h4>

          {/* Sort Dropdown */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
              Sort By
            </label>
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: '#fff',
              color: '#0f172a'
            }}>
              <option value="relevance">Relevance</option>
              <option value="price-low-to-high">Price: Low to High</option>
              <option value="price-high-to-low">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
              Price: ₹{minPrice} - ₹{maxPrice}
            </label>
            <input type="range" min="0" max="10000" step="100" value={minPrice} onChange={(e) => handleMinPriceChange(parseInt(e.target.value, 10))} style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: '#e5e7eb',
              outline: 'none',
              cursor: 'pointer'
            }} />
            <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => handleMaxPriceChange(parseInt(e.target.value, 10))} style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: '#2563eb',
              outline: 'none',
              cursor: 'pointer',
              marginTop: '4px'
            }} />
          </div>

          {/* Rating Filter */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
              Min Rating: {minRating.toFixed(1)} ⭐
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 3.5, 4, 4.5, 5].map(rating => (
                <button key={rating} onClick={() => handleMinRatingChange(rating)} style={{
                  flex: 1,
                  padding: '6px 4px',
                  background: minRating === rating ? '#2563eb' : '#e5e7eb',
                  color: minRating === rating ? '#fff' : '#0f172a',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  {rating === 0 ? 'All' : rating}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <button onClick={handleResetFilters} style={{
            width: '100%',
            padding: '8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#0f172a',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}>
            Reset Filters
          </button>
        </div>
      </aside>

      {(isLeftDrawerOpen || isRightDrawerOpen) && (
        <button
          type="button"
          className="services-drawer-backdrop"
          aria-label="Close side panel"
          onClick={closeDrawers}
        />
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

