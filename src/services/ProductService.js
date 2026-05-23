import { Product } from '../models/Product.js';

const INITIAL_PRODUCTS = [
  {
    id: 1, name: "Ceiling Fan", cat: "appliances", image: "/images/fan.png",
    desc: "High-speed ceiling fan with elegant design.",
    price: 1499, oldPrice: 1999, stock: "in", badge: "popular",
    specs: { "Type": "Ceiling", "Speed": "400 RPM", "Power": "50W" }
  },
  {
    id: 2, name: "Air Cooler", cat: "appliances", image: "/images/cooler.png",
    desc: "Portable air cooler with powerful cooling pad.",
    price: 4999, oldPrice: 6500, stock: "in", badge: "hot",
    specs: { "Capacity": "40 Liters", "Cooling": "Honeycomb Pads", "Power": "150W" }
  },
  {
    id: 3, name: "Induction Cooktop", cat: "appliances", image: "/images/induction.png",
    desc: "Fast and energy-efficient induction cooktop.",
    price: 2199, oldPrice: 2999, stock: "in", badge: "sale",
    specs: { "Power": "2000W", "Controls": "Touch panel", "Timer": "Yes" }
  },
  {
    id: 4, name: "Room Heater", cat: "appliances", image: "/images/heater.png",
    desc: "Halogen room heater for quick winter warmth.",
    price: 1299, oldPrice: 1599, stock: "in", badge: "popular",
    specs: { "Heating Type": "Halogen", "Settings": "Two modes", "Safety": "Tip-over switch" }
  },
  {
    id: 5, name: "Mixer Grinder", cat: "appliances", image: "/images/mixer.png",
    desc: "Multi-purpose mixer grinder with 3 stainless steel jars.",
    price: 2499, oldPrice: 3200, stock: "in", badge: null,
    specs: { "Power": "750W", "Jars": "3", "Speed": "3 Settings" }
  },
  {
    id: 6, name: "LED Bulb", cat: "lighting", image: "/images/bulb.png",
    desc: "Energy-saving LED bulb with bright white light.",
    price: 99, oldPrice: 150, stock: "in", badge: "new",
    specs: { "Power": "9W", "Type": "B22", "Light": "Cool White" }
  },
  {
    id: 7, name: "Electrical Wires", cat: "electrical", image: "/images/electrical_wires.png",
    desc: "Heavy-duty copper electrical wires for domestic wiring.",
    price: 450, oldPrice: 550, stock: "in", badge: null,
    specs: { "Material": "Copper", "Gauge": "1.5 sq mm", "Length": "90m" }
  },
  {
    id: 8, name: "Torch Light", cat: "lighting", image: "/images/torch_light.png",
    desc: "Rechargeable LED torch light with long battery life.",
    price: 299, oldPrice: 399, stock: "in", badge: null,
    specs: { "Battery": "1200mAh", "Range": "500m", "Type": "LED" }
  },
  {
    id: 9, name: "Switch Board", cat: "electrical", image: "/images/switch_board.png",
    desc: "Modular switch board extension with multiple sockets.",
    price: 199, oldPrice: 250, stock: "in", badge: "popular",
    specs: { "Sockets": "4+1", "Cord Length": "2m", "Capacity": "6 Amps" }
  },
  {
    id: 10, name: "Voltage Stabilizer", cat: "electrical", image: "/images/voltage_stabilizer.png",
    desc: "Mainline voltage stabilizer for home appliances safety.",
    price: 3499, oldPrice: 4500, stock: "in", badge: "hot",
    specs: { "Input Range": "90V - 280V", "Capacity": "4 KVA", "Type": "Automatic" }
  },
  {
    id: 11, name: "Multimeter Digital", cat: "electrical", image: "/images/digital_multimeter.png",
    desc: "High-precision digital multimeter for electronics testing.",
    price: 899, oldPrice: 1200, stock: "in", badge: "popular",
    specs: { "Display": "LCD 3.5 Digit", "DC Voltage": "1000V", "AC Voltage": "750V" }
  },
  {
    id: 12, name: "Soldering Iron Kit", cat: "electrical", image: "/images/soldering_iron.png",
    desc: "Complete soldering iron kit with adjustable temperature.",
    price: 599, oldPrice: 750, stock: "in", badge: "new",
    specs: { "Power": "60W", "Temp": "200°C - 450°C", "Includes": "Stand, Solder, Flux" }
  },
  {
    id: 13, name: "Arduino Uno Kit", cat: "electrical", image: "/images/arduino_uno.png",
    desc: "Beginner micro-controller kit for DIY projects.",
    price: 1250, oldPrice: 1600, stock: "in", badge: "hot",
    specs: { "Model": "UNO R3", "Voltage": "5V", "IO Pins": "14" }
  },
  {
    id: 14, name: "Table Fan", cat: "appliances", image: "/images/table_fan.png",
    desc: "Compact table fan with oscillating head.",
    price: 1099, oldPrice: 1300, stock: "in", badge: null,
    specs: { "Type": "Table", "Speed": "3 Settings", "Power": "40W" }
  },
  {
    id: 15, name: "Extension Board", cat: "electrical", image: "/images/extension_board.png",
    desc: "Surge protected heavy duty extension board.",
    price: 349, oldPrice: 450, stock: "in", badge: "popular",
    specs: { "Sockets": "4", "Cord Length": "5m", "Capacity": "10 Amps" }
  },
  {
    id: 16, name: "LED Tube Light", cat: "lighting", image: "/images/led_tube.png",
    desc: "High brightness 20W LED tube light.",
    price: 249, oldPrice: 350, stock: "in", badge: "sale",
    specs: { "Power": "20W", "Length": "4 ft", "Light": "Cool White" }
  },
  {
    id: 17, name: "Electric Kettle", cat: "appliances", image: "/images/electric_kettle.png",
    desc: "Stainless steel electric kettle for quick heating.",
    price: 699, oldPrice: 999, stock: "low", badge: "hot",
    specs: { "Capacity": "1.5L", "Power": "1500W", "Auto Off": "Yes" }
  },
  {
    id: 18, name: "Electric Iron", cat: "appliances", image: "/images/electric_iron.png",
    desc: "Lightweight dry iron with continuous temperature control.",
    price: 499, oldPrice: 650, stock: "in", badge: null,
    specs: { "Power": "750W", "Soleplate": "Non-stick", "Cord": "360° Swivel" }
  },
  {
    id: 19, name: "Soldering Wire", cat: "electrical", image: "/images/soldering_wire.png",
    desc: "High quality rosin core soldering wire roll.",
    price: 150, oldPrice: 200, stock: "in", badge: null,
    specs: { "Alloy": "60/40 Tin/Lead", "Weight": "50g", "Flux": "2.0%" }
  },
  {
    id: 20, name: "Wire Stripper", cat: "electrical", image: "/images/wire_stripper.png",
    desc: "Multi-functional wire stripper and cutter tool.",
    price: 250, oldPrice: 350, stock: "in", badge: "popular",
    specs: { "Material": "Carbon Steel", "Size": "6 inch", "Handle": "Insulated Grip" }
  },
  {
    id: 21, name: "Exhaust Fan", cat: "appliances", image: "/images/exhaust_fan.png",
    desc: "High-speed exhaust fan for kitchen and bathroom.",
    price: 899, oldPrice: 1100, stock: "in", badge: "new",
    specs: { "Size": "200mm", "Speed": "2000 RPM", "Body": "Rust-proof" }
  }
];

export class ProductService {
  constructor() {
    this.products = [];
  }

  async loadProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.products = data.map(p => new Product(p));
    } catch (err) {
      console.warn('⚠️ Could not load products from API. Falling back to local catalog:', err.message);
      this.products = INITIAL_PRODUCTS.map(p => new Product(p));
    }
    return this.products;
  }

  getAllProducts() {
    return this.products;
  }

  getFilteredProducts(category = 'all', sort = 'default') {
    let list = category === 'all' 
      ? [...this.products] 
      : this.products.filter(p => p.cat === category);

    switch(sort) {
      case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
      case 'price-desc': list.sort((a,b) => b.price - a.price); break;
      case 'name':       list.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'stock':      list.sort((a,b) => (a.isOutOfStock ? 1 : 0) - (b.isOutOfStock ? 1 : 0)); break;
    }
    return list;
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.desc.toLowerCase().includes(q) || 
      p.cat.includes(q)
    );
  }
}

// Singleton instance
export const productService = new ProductService();

