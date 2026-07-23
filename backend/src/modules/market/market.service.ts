import { MarketPriceModel, IMarketPrice } from "./market.model";

export class MarketService {
  /**
   * Fetches Mandi market prices with optional filters for district and crop name.
   * Seeds default Mandi price data if database collection is empty.
   */
  public static async getPrices(filters: {
    district?: string;
    cropName?: string;
  }): Promise<IMarketPrice[]> {
    // If we have less than 10 documents (e.g. legacy seed of 5), clean and reseed the extended set
    const count = await MarketPriceModel.countDocuments();
    if (count < 10) {
      await MarketPriceModel.deleteMany({});
      await this.seedDefaultPrices();
    }

    const query: any = {};
    if (filters.district) {
      // Build a flexible search to match keyword anywhere in district/mandiName/state
      query.$or = [
        { district: { $regex: new RegExp(filters.district, "i") } },
        { mandiName: { $regex: new RegExp(filters.district, "i") } },
        { mandiNameHi: { $regex: new RegExp(filters.district, "i") } }
      ];
    }
    if (filters.cropName) {
      // Map legacy/common crop names to search queries
      let cropSearch = filters.cropName;
      if (cropSearch.toLowerCase().includes("rice")) cropSearch = "Paddy";
      if (cropSearch.toLowerCase().includes("dhan")) cropSearch = "Paddy";
      if (cropSearch.toLowerCase().includes("sarson")) cropSearch = "Mustard";
      if (cropSearch.toLowerCase().includes("chilli")) cropSearch = "Chilli";
      query.cropName = { $regex: new RegExp(cropSearch, "i") };
    }

    return MarketPriceModel.find(query).sort({ distance: 1 });
  }

  public static async createPriceEntry(data: any): Promise<IMarketPrice> {
    return MarketPriceModel.create(data);
  }

  private static async seedDefaultPrices(): Promise<void> {
    const defaultPrices = [
      // Bhopal Region
      {
        cropName: "Wheat", cropNameHi: "गेहूं",
        mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी",
        price: 2680, minPrice: 2450, maxPrice: 2850, prevModalPrice: 2610,
        arrivalQty: 180, distance: 4, unit: "Quintal", trend: "up",
        state: "Madhya Pradesh", district: "bhopal", variety: "Sharbati", varietyHi: "शरबती", date: "2026-06-27"
      },
      {
        cropName: "Soybean", cropNameHi: "सोयाबीन",
        mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी",
        price: 4550, minPrice: 4200, maxPrice: 4780, prevModalPrice: 4610,
        arrivalQty: 120, distance: 4, unit: "Quintal", trend: "down",
        state: "Madhya Pradesh", district: "bhopal", variety: "Yellow", varietyHi: "पीला", date: "2026-06-27"
      },
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी",
        price: 3850, minPrice: 3500, maxPrice: 4100, prevModalPrice: 3800,
        arrivalQty: 95, distance: 4, unit: "Quintal", trend: "up",
        state: "Madhya Pradesh", district: "bhopal", variety: "Basmati", varietyHi: "बासमती", date: "2026-06-27"
      },
      {
        cropName: "Gram (Chana)", cropNameHi: "चना",
        mandiName: "Bhopal (Karond) APMC", mandiNameHi: "भोपाल (करौंद) मंडी",
        price: 5400, minPrice: 5100, maxPrice: 5650, prevModalPrice: 5350,
        arrivalQty: 60, distance: 4, unit: "Quintal", trend: "up",
        state: "Madhya Pradesh", district: "bhopal", variety: "Desi", varietyHi: "देशी", date: "2026-06-27"
      },
      {
        cropName: "Wheat", cropNameHi: "गेहूं",
        mandiName: "Sehore Mandi", mandiNameHi: "सीहोर मंडी",
        price: 2750, minPrice: 2500, maxPrice: 2950, prevModalPrice: 2700,
        arrivalQty: 320, distance: 38, unit: "Quintal", trend: "up",
        state: "Madhya Pradesh", district: "bhopal", variety: "Sharbati", varietyHi: "शरबती", date: "2026-06-27"
      },
      {
        cropName: "Soybean", cropNameHi: "सोयाबीन",
        mandiName: "Sehore Mandi", mandiNameHi: "सीहोर मंडी",
        price: 4480, minPrice: 4150, maxPrice: 4700, prevModalPrice: 4500,
        arrivalQty: 240, distance: 38, unit: "Quintal", trend: "down",
        state: "Madhya Pradesh", district: "bhopal", variety: "Yellow", varietyHi: "पीला", date: "2026-06-27"
      },
      {
        cropName: "Wheat", cropNameHi: "गेहूं",
        mandiName: "Raisen Mandi", mandiNameHi: "रायसेन मंडी",
        price: 2600, minPrice: 2400, maxPrice: 2750, prevModalPrice: 2620,
        arrivalQty: 110, distance: 45, unit: "Quintal", trend: "down",
        state: "Madhya Pradesh", district: "bhopal", variety: "Lokwan", varietyHi: "लोकवन", date: "2026-06-27"
      },
      {
        cropName: "Soybean", cropNameHi: "सोयाबीन",
        mandiName: "Raisen Mandi", mandiNameHi: "रायसेन मंडी",
        price: 4620, minPrice: 4300, maxPrice: 4850, prevModalPrice: 4550,
        arrivalQty: 85, distance: 45, unit: "Quintal", trend: "up",
        state: "Madhya Pradesh", district: "bhopal", variety: "Yellow", varietyHi: "पीला", date: "2026-06-27"
      },
      {
        cropName: "Wheat", cropNameHi: "गेहूं",
        mandiName: "Vidisha APMC", mandiNameHi: "विदिशा मंडी",
        price: 2800, minPrice: 2550, maxPrice: 3000, prevModalPrice: 2740,
        arrivalQty: 410, distance: 56, unit: "Quintal", trend: "up",
        state: "Madhya Pradesh", district: "bhopal", variety: "Sharbati", varietyHi: "शरबती", date: "2026-06-27"
      },
      {
        cropName: "Soybean", cropNameHi: "सोयाबीन",
        mandiName: "Vidisha APMC", mandiNameHi: "विदिशा मंडी",
        price: 4500, minPrice: 4250, maxPrice: 4750, prevModalPrice: 4520,
        arrivalQty: 175, distance: 56, unit: "Quintal", trend: "down",
        state: "Madhya Pradesh", district: "bhopal", variety: "Yellow", varietyHi: "पीला", date: "2026-06-27"
      },

      // Ludhiana Region
      {
        cropName: "Wheat", cropNameHi: "गेहूं",
        mandiName: "Ludhiana Central APMC", mandiNameHi: "लुधियाना सेंट्रल मंडी",
        price: 2400, minPrice: 2325, maxPrice: 2450, prevModalPrice: 2400,
        arrivalQty: 550, distance: 5, unit: "Quintal", trend: "stable",
        state: "Punjab", district: "ludhiana", variety: "Kalyan Sona", varietyHi: "कल्याण सोना", date: "2026-06-27"
      },
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Ludhiana Central APMC", mandiNameHi: "लुधियाना सेंट्रल मंडी",
        price: 2240, minPrice: 2180, maxPrice: 2320, prevModalPrice: 2200,
        arrivalQty: 620, distance: 5, unit: "Quintal", trend: "up",
        state: "Punjab", district: "ludhiana", variety: "PR 126", varietyHi: "पीआर 126", date: "2026-06-27"
      },
      {
        cropName: "Potato", cropNameHi: "आलू",
        mandiName: "Ludhiana Central APMC", mandiNameHi: "लुधियाना सेंट्रल मंडी",
        price: 1300, minPrice: 1100, maxPrice: 1450, prevModalPrice: 1250,
        arrivalQty: 140, distance: 5, unit: "Quintal", trend: "up",
        state: "Punjab", district: "ludhiana", variety: "Jyoti", varietyHi: "ज्योति", date: "2026-06-27"
      },
      {
        cropName: "Wheat", cropNameHi: "गेहूं",
        mandiName: "Khanna APMC (Asia's Largest)", mandiNameHi: "खन्ना मंडी",
        price: 2435, minPrice: 2350, maxPrice: 2480, prevModalPrice: 2420,
        arrivalQty: 1200, distance: 42, unit: "Quintal", trend: "up",
        state: "Punjab", district: "ludhiana", variety: "Kalyan Sona", varietyHi: "कल्याण सोना", date: "2026-06-27"
      },
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Khanna APMC (Asia's Largest)", mandiNameHi: "खन्ना मंडी",
        price: 2280, minPrice: 2200, maxPrice: 2350, prevModalPrice: 2250,
        arrivalQty: 1540, distance: 42, unit: "Quintal", trend: "up",
        state: "Punjab", district: "ludhiana", variety: "PR 126", varietyHi: "पीआर 126", date: "2026-06-27"
      },
      {
        cropName: "Potato", cropNameHi: "आलू",
        mandiName: "Jalandhar Mandi", mandiNameHi: "जालंधर मंडी",
        price: 1350, minPrice: 1150, maxPrice: 1500, prevModalPrice: 1320,
        arrivalQty: 310, distance: 61, unit: "Quintal", trend: "up",
        state: "Punjab", district: "ludhiana", variety: "Jyoti", varietyHi: "ज्योति", date: "2026-06-27"
      },

      // Nagpur Region
      {
        cropName: "Cotton", cropNameHi: "कपास",
        mandiName: "Nagpur Kalamna Market", mandiNameHi: "नागपुर कलमना मंडी",
        price: 7250, minPrice: 6800, maxPrice: 7600, prevModalPrice: 7100,
        arrivalQty: 310, distance: 6, unit: "Quintal", trend: "up",
        state: "Maharashtra", district: "nagpur", variety: "H-4 Long Staple", varietyHi: "एच-4 लंबी रेशा", date: "2026-06-27"
      },
      {
        cropName: "Oranges", cropNameHi: "संतरा",
        mandiName: "Nagpur Kalamna Market", mandiNameHi: "नागपुर कलमना मंडी",
        price: 4600, minPrice: 3500, maxPrice: 5500, prevModalPrice: 4800,
        arrivalQty: 150, distance: 6, unit: "Quintal", trend: "down",
        state: "Maharashtra", district: "nagpur", variety: "Nagpur Local", varietyHi: "नागपुर लोकल", date: "2026-06-27"
      },
      {
        cropName: "Soybean", cropNameHi: "सोयाबीन",
        mandiName: "Nagpur Kalamna Market", mandiNameHi: "नागपुर कलमना मंडी",
        price: 4420, minPrice: 4100, maxPrice: 4650, prevModalPrice: 4450,
        arrivalQty: 110, distance: 6, unit: "Quintal", trend: "stable",
        state: "Maharashtra", district: "nagpur", variety: "Yellow", varietyHi: "पीला", date: "2026-06-27"
      },
      {
        cropName: "Cotton", cropNameHi: "कपास",
        mandiName: "Amravati APMC", mandiNameHi: "अमरावती मंडी",
        price: 7400, minPrice: 6950, maxPrice: 7750, prevModalPrice: 7300,
        arrivalQty: 480, distance: 150, unit: "Quintal", trend: "up",
        state: "Maharashtra", district: "nagpur", variety: "H-4 Long Staple", varietyHi: "एच-4 लंबी रेशा", date: "2026-06-27"
      },
      {
        cropName: "Soybean", cropNameHi: "सोयाबीन",
        mandiName: "Wardha APMC", mandiNameHi: "वर्धा मंडी",
        price: 4510, minPrice: 4200, maxPrice: 4700, prevModalPrice: 4480,
        arrivalQty: 130, distance: 78, unit: "Quintal", trend: "up",
        state: "Maharashtra", district: "nagpur", variety: "Yellow", varietyHi: "पीला", date: "2026-06-27"
      },

      // Jaipur Region
      {
        cropName: "Mustard (Sarson)", cropNameHi: "सरसों",
        mandiName: "Jaipur (Muhana Mandi)", mandiNameHi: "जयपुर (मुहाना मंडी)",
        price: 5600, minPrice: 5200, maxPrice: 5850, prevModalPrice: 5520,
        arrivalQty: 210, distance: 8, unit: "Quintal", trend: "up",
        state: "Rajasthan", district: "jaipur", variety: "Mustard Bold", varietyHi: "मोटा दाना", date: "2026-06-27"
      },
      {
        cropName: "Barley (Jau)", cropNameHi: "जौ",
        mandiName: "Jaipur (Muhana Mandi)", mandiNameHi: "जयपुर (मुहाना मंडी)",
        price: 2100, minPrice: 1900, maxPrice: 2250, prevModalPrice: 2080,
        arrivalQty: 90, distance: 8, unit: "Quintal", trend: "up",
        state: "Rajasthan", district: "jaipur", variety: "Local", varietyHi: "लोकल", date: "2026-06-27"
      },
      {
        cropName: "Onion", cropNameHi: "प्याज़",
        mandiName: "Jaipur (Muhana Mandi)", mandiNameHi: "जयपुर (मुहाना मंडी)",
        price: 1650, minPrice: 1400, maxPrice: 1900, prevModalPrice: 1700,
        arrivalQty: 180, distance: 8, unit: "Quintal", trend: "down",
        state: "Rajasthan", district: "jaipur", variety: "Nasik Local", varietyHi: "नासिक लोकल", date: "2026-06-27"
      },
      {
        cropName: "Mustard (Sarson)", cropNameHi: "सरसों",
        mandiName: "Alwar APMC", mandiNameHi: "अलवर मंडी",
        price: 5720, minPrice: 5300, maxPrice: 5980, prevModalPrice: 5650,
        arrivalQty: 350, distance: 140, unit: "Quintal", trend: "up",
        state: "Rajasthan", district: "jaipur", variety: "Mustard Bold", varietyHi: "मोटा दाना", date: "2026-06-27"
      },
      {
        cropName: "Onion", cropNameHi: "प्याज़",
        mandiName: "Chomu APMC", mandiNameHi: "चोमू मंडी",
        price: 1550, minPrice: 1300, maxPrice: 1800, prevModalPrice: 1580,
        arrivalQty: 120, distance: 35, unit: "Quintal", trend: "down",
        state: "Rajasthan", district: "jaipur", variety: "Local Red", varietyHi: "देशी लाल", date: "2026-06-27"
      },

      // Patna Region
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Patna (Fatuha) Market", mandiNameHi: "पटना (फतुहा) मंडी",
        price: 2200, minPrice: 2183, maxPrice: 2250, prevModalPrice: 2183,
        arrivalQty: 140, distance: 12, unit: "Quintal", trend: "up",
        state: "Bihar", district: "patna", variety: "Common", varietyHi: "साधारण धान", date: "2026-06-27"
      },
      {
        cropName: "Maize (Makka)", cropNameHi: "मक्का",
        mandiName: "Patna (Fatuha) Market", mandiNameHi: "पटना (फतुहा) मंडी",
        price: 2150, minPrice: 1950, maxPrice: 2300, prevModalPrice: 2120,
        arrivalQty: 175, distance: 12, unit: "Quintal", trend: "up",
        state: "Bihar", district: "patna", variety: "Hybrid Yellow", varietyHi: "हाइब्रिड पीला", date: "2026-06-27"
      },
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Mokama APMC", mandiNameHi: "मोकामा मंडी",
        price: 2230, minPrice: 2190, maxPrice: 2280, prevModalPrice: 2210,
        arrivalQty: 210, distance: 90, unit: "Quintal", trend: "up",
        state: "Bihar", district: "patna", variety: "Common", varietyHi: "साधारण धान", date: "2026-06-27"
      },
      {
        cropName: "Maize (Makka)", cropNameHi: "मक्का",
        mandiName: "Begusarai Mandi", mandiNameHi: "बेगूसराय मंडी",
        price: 2200, minPrice: 2000, maxPrice: 2350, prevModalPrice: 2180,
        arrivalQty: 340, distance: 115, unit: "Quintal", trend: "up",
        state: "Bihar", district: "patna", variety: "Hybrid Yellow", varietyHi: "हाइब्रिड पीला", date: "2026-06-27"
      },

      // Guntur Region
      {
        cropName: "Red Chilli", cropNameHi: "सूखी मिर्च",
        mandiName: "Guntur Chilli APMC", mandiNameHi: "गुंटूर मिर्च मंडी (एशिया की सबसे बड़ी)",
        price: 19200, minPrice: 16500, maxPrice: 21000, prevModalPrice: 18900,
        arrivalQty: 640, distance: 3, unit: "Quintal", trend: "up",
        state: "Andhra Pradesh", district: "guntur", variety: "Guntur Sannam S4", varietyHi: "गुंटूर सन्नम S4", date: "2026-06-27"
      },
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Guntur Chilli APMC", mandiNameHi: "गुंटूर मिर्च मंडी",
        price: 2550, minPrice: 2350, maxPrice: 2700, prevModalPrice: 2520,
        arrivalQty: 220, distance: 3, unit: "Quintal", trend: "up",
        state: "Andhra Pradesh", district: "guntur", variety: "BPT 5204", varietyHi: "बीपीटी 5204", date: "2026-06-27"
      },
      {
        cropName: "Turmeric", cropNameHi: "हल्दी",
        mandiName: "Guntur Chilli APMC", mandiNameHi: "गुंटूर मिर्च मंडी",
        price: 11200, minPrice: 9500, maxPrice: 12500, prevModalPrice: 11400,
        arrivalQty: 80, distance: 3, unit: "Quintal", trend: "down",
        state: "Andhra Pradesh", district: "guntur", variety: "Finger Local", varietyHi: "फिंगर लोकल", date: "2026-06-27"
      },
      {
        cropName: "Paddy (Dhan)", cropNameHi: "धान",
        mandiName: "Vijayawada APMC", mandiNameHi: "विजयवाड़ा मंडी",
        price: 2600, minPrice: 2380, maxPrice: 2750, prevModalPrice: 2580,
        arrivalQty: 185, distance: 35, unit: "Quintal", trend: "up",
        state: "Andhra Pradesh", district: "guntur", variety: "BPT 5204", varietyHi: "बीपीटी 5204", date: "2026-06-27"
      },
      {
        cropName: "Turmeric", cropNameHi: "हल्दी",
        mandiName: "Duggirala Turmeric APMC", mandiNameHi: "दुग्गिराला हल्दी मंडी",
        price: 11800, minPrice: 9800, maxPrice: 13000, prevModalPrice: 11600,
        arrivalQty: 290, distance: 18, unit: "Quintal", trend: "up",
        state: "Andhra Pradesh", district: "guntur", variety: "Duggirala", varietyHi: "दुग्गिराला", date: "2026-06-27"
      }
    ];

    await MarketPriceModel.insertMany(defaultPrices);
    console.log("🌽 Seeded default mandi market prices database.");
  }
}
