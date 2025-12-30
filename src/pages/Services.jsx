import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

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
      'Electrical Repairs': [
        { id: 'el1', title: 'Switch & Socket Repair', price: 199, image: 'https://i.postimg.cc/hGmtLKL3/Gemini-Generated-Image-w66mf8w66mf8w66m.png', duration: '30 mins', rating: 4.8, reviews: 2950, features: ['Expert fault diagnosis', 'Complete replacement if needed', 'Safety testing included', 'Branded parts used'] },
        { id: 'el2', title: 'Fan Installation / Repair', price: 299, image: 'https://i.postimg.cc/v8NCs5FK/Gemini-Generated-Image-bx1oyjbx1oyjbx1o.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 2100, features: ['Installation for all fan types', 'Balance and noise reduction', 'Speed controller setup', 'Warranty documentation'] },
        { id: 'el3', title: 'Light / Chandelier Installation', price: 399, image: 'https://i.postimg.cc/1t2xJFyG/Gemini-Generated-Image-4krxr54krxr54krx.png', duration: '1-2 hrs', rating: 4.9, reviews: 1850, features: ['Professional fitting and positioning', 'Electrical connection verification', 'LED bulb compatibility check', 'Safety certification'] },
        { id: 'el8', title: 'Short Circuit Fix', price: 399, image: 'https://i.postimg.cc/W1BkLWX2/Gemini-Generated-Image-419nud419nud419n.png', duration: '1-2 hrs', rating: 4.6, reviews: 1620, features: ['Complete circuit testing', 'Root cause identification', 'Safe earthing arrangement', 'Safety switches installation'] }
      ],
      'Major Installations': [
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
      'AC Services': [
        { id: 'ap1', title: 'AC Service', price: 699, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '1-1.5 hrs', rating: 4.7, reviews: 3420, features: ['Filter cleaning and replacement', 'Coolant level check', 'Compressor inspection', 'Drain pipe cleaning'] },
        { id: 'ap2', title: 'AC Installation', price: 999, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '2-3 hrs', rating: 4.8, reviews: 2840, features: ['Professional wall mounting', 'Copper piping installation', 'Electrical connection setup', 'Gas charging included'] },
        { id: 'ap3', title: 'AC Uninstallation', price: 399, image: 'https://img.icons8.com/fluency/96/air-conditioner.png', duration: '1-1.5 hrs', rating: 4.6, reviews: 1520, features: ['Safe gas recovery', 'Proper disposal of unit', 'Wall hole sealing', 'Clean installation area'] },
        { id: 'ap4', title: 'AC Gas Refill', price: 899, image: 'https://img.icons8.com/fluency/96/gas.png', duration: '30-45 mins', rating: 4.9, reviews: 4100, features: ['Genuine R22/R410A gas used', 'Pressure optimization', 'Leak detection included', 'Performance testing'] },
        { id: 'ap5', title: 'AC General Service', price: 599, image: 'https://img.icons8.com/fluency/96/gear.png', duration: '1 hr', rating: 4.5, reviews: 2150, features: ['Complete system checkup', 'Capacitor testing', 'Thermostat calibration', 'Electrical safety check'] },
        { id: 'ap6', title: 'AC Repair (Split/Window)', price: 799, image: 'https://img.icons8.com/fluency/96/repair.png', duration: '1-2 hrs', rating: 4.8, reviews: 2960, features: ['Fault diagnosis and repair', 'All AC brands supported', 'Genuine spare parts', 'Warranty on service'] }
      ],
      'Kitchen Appliances': [
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
      'Hair Services': [
        { id: 'b1', title: 'Haircut & Styling', price: 399, image: 'https://i.postimg.cc/vT5Q8hGg/salon-icon.png', duration: '45-60 mins', rating: 4.8, reviews: 4200, features: ['Professional haircut', 'Hair wash and dry', 'Styling consultation', 'Product recommendations'] },
        { id: 'b2', title: 'Hair Spa', price: 599, image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png', duration: '60-90 mins', rating: 4.9, reviews: 3840, features: ['Deep conditioning treatment', 'Hot oil massage', 'Hair mask application', 'Scalp rejuvenation'] },
        { id: 'b3', title: 'Hair Color', price: 899, image: 'https://i.postimg.cc/qMZz6YwN/hair-icon.png', duration: '90-120 mins', rating: 4.7, reviews: 2960, features: ['Professional hair coloring', 'Strand test included', 'Color-protecting treatment', 'Post-color care tips'] }
      ],
      'Skin & Facial': [
        { id: 'b4', title: 'Facial & Cleanup', price: 499, image: 'https://i.postimg.cc/0y7C2h1L/spa-icon.png', duration: '60 mins', rating: 4.8, reviews: 3520, features: ['Skin analysis and assessment', 'Deep cleansing and exfoliation', 'Face massage included', 'Moisturizing and sunscreen application'] },
        { id: 'b5', title: 'Waxing (Full/Half)', price: 399, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png', duration: '30-45 mins', rating: 4.9, reviews: 4640, features: ['Hypoallergenic wax used', 'No burns or injuries', 'Soothing post-wax lotion', 'Long-lasting results'] },
        { id: 'b6', title: 'Manicure & Pedicure', price: 499, image: 'https://i.postimg.cc/TY2j2fhS/makeup-icon.png', duration: '60-90 mins', rating: 4.7, reviews: 3180, features: ['Nail cleaning and shaping', 'Hand and foot massage', 'Polish application', 'Cuticle care'] }
      ]
    }
  },
  Men: {
    icon: '👨‍💼',
    label: "Men's Salon & Grooming",
    subcategories: {
      'Grooming': [
        { id: 'm1', title: 'Haircut', price: 299, image: 'https://img.icons8.com/fluency/96/haircut.png', duration: '30-45 mins', rating: 4.8, reviews: 3920, features: ['Professional haircut', 'Hair wash included', 'Styling and finishing', 'Product recommendation'] },
        { id: 'm2', title: 'Beard Trim & Styling', price: 249, image: 'https://img.icons8.com/fluency/96/beard.png', duration: '20-30 mins', rating: 4.9, reviews: 4100, features: ['Expert beard shaping', 'Beard oil treatment', 'Trimming and edging', 'Professional styling'] },
        { id: 'm3', title: 'Shave', price: 199, image: 'https://img.icons8.com/fluency/96/shave.png', duration: '20-30 mins', rating: 4.7, reviews: 2840, features: ['Traditional straight razor shave', 'Hot towel treatment', 'After-shave care', 'Skin soothing balm'] }
      ],
      'Styling & Care': [
        { id: 'm4', title: 'Facial', price: 299, image: 'https://img.icons8.com/fluency/96/face-cream.png', duration: '45-60 mins', rating: 4.6, reviews: 2360, features: ['Skin type analysis', 'Deep cleansing', 'Face massage', 'Moisturizing treatment'] },
        { id: 'm5', title: 'Hair Color', price: 399, image: 'https://img.icons8.com/fluency/96/hair-color.png', duration: '60-90 mins', rating: 4.8, reviews: 2640, features: ['Beard or hair coloring', 'Shade selection guidance', 'Color-safe treatment', 'Post-color care'] },
        { id: 'm6', title: 'Head Massage', price: 349, image: 'https://img.icons8.com/fluency/96/massage.png', duration: '45-60 mins', rating: 4.9, reviews: 3180, features: ['Pressure point massage', 'Stress relief', 'Oil treatment', 'Relaxation therapy'] }
      ]
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

export default function Services() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [quantities, setQuantities] = useState({});
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat && SERVICES_DATA[cat]) {
      setSelectedCategory(cat);
      setStep('services');
      const firstSubcat = Object.keys(SERVICES_DATA[cat].subcategories)[0];
      setSelectedSubcategory(firstSubcat);
    }
  }, [location.search]);

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

  const handleViewService = (service) => {
    navigate(`/services/${service.id}`, { state: { service } });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep('subcategories');
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setStep('services');
  };

  const handleBack = () => {
    if (step === 'services') {
      setStep('subcategories');
      setSelectedSubcategory(null);
    } else if (step === 'subcategories') {
      setStep('categories');
      setSelectedCategory(null);
    }
  };

  // Render Categories View
  if (step === 'categories') {
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
                  onClick={() => navigate(`/services/category/${encodeURIComponent(selectedCategory)}?subcategory=${encodeURIComponent(subcat)}`)}
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
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                {/* Service Content */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '0' }}>
                  {/* Service Image */}
                  <div style={{
                    width: '180px',
                    height: '180px',
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
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Title and Rating */}
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 8px 0'
                      }}>
                        {service.title}
                      </h3>
                      
                      {/* Rating and Reviews */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ color: '#fbbf24', fontSize: '16px' }}>★</span>
                        <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                          {service.rating}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>
                          ({service.reviews} reviews)
                        </span>
                      </div>

                      {/* Price and Duration */}
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{
                          color: '#2563eb',
                          fontWeight: '700',
                          fontSize: '18px',
                          margin: '0'
                        }}>
                          From ₹{service.price}
                        </p>
                        <p style={{
                          color: '#6b7280',
                          fontSize: '13px',
                          margin: '4px 0 0 0'
                        }}>
                          Time: {service.duration}
                        </p>
                      </div>

                      {/* Features */}
                      <div style={{ marginBottom: '12px' }}>
                        {service.features && (
                          <div>
                            {service.features.slice(0, expandedService === service.id ? service.features.length : 2).map((feature, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  marginBottom: '6px',
                                  fontSize: '13px',
                                  color: '#374151'
                                }}
                              >
                                <span style={{ color: '#10b981', marginTop: '2px' }}>✓</span>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {service.features && service.features.length > 2 && (
                          <button
                            onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#2563eb',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                              marginTop: '6px',
                              padding: '0'
                            }}
                          >
                            {expandedService === service.id ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                      {/* Quantity Selector */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: '#f9fafb'
                      }}>
                        <button
                          onClick={() => updateQuantity(service.id, -1)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            color: '#6b7280'
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                          {quantities[service.id] || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(service.id, 1)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '16px',
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
                          padding: '10px 16px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
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
                          padding: '10px 16px',
                          backgroundColor: 'white',
                          border: '2px solid #2563eb',
                          color: '#2563eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
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
