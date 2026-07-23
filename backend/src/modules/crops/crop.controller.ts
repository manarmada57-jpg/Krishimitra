import { Request, Response, NextFunction } from "express";
import { CropService } from "./crop.service";
import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";

export class CropController {
  public static async createCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const crop = await CropService.createCrop(userId, req.body);
      return res.status(201).json({ success: true, data: crop });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const crops = await CropService.getUserCrops(userId);
      return res.status(200).json({ success: true, data: crops });
    } catch (error) {
      next(error);
    }
  }

  public static async getFarmCrops(req: Request, res: Response, next: NextFunction) {
    try {
      const { farmId } = req.params;
      const crops = await CropService.getCropsByFarm(farmId);
      return res.status(200).json({ success: true, data: crops });
    } catch (error) {
      next(error);
    }
  }

  public static async getCropDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const crop = (req as any).resource;
      return res.status(200).json({ success: true, data: crop });
    } catch (error) {
      next(error);
    }
  }

  public static async updateCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedCrop = await CropService.updateCrop(id, req.body);
      return res.status(200).json({ success: true, data: updatedCrop });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CropService.deleteCrop(id);
      return res.status(200).json({ success: true, message: "Crop record deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  private static aiClient: GoogleGenAI | null = null;

  private static getGeminiClient(): GoogleGenAI | null {
    if (this.aiClient) return this.aiClient;
    const apiKey = env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      return this.aiClient;
    }
    return null;
  }

  /**
   * Diagnoses crop leaf diseases using Gemini AI, with standard offline fallbacks.
   */
  public static async diagnoseCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const { image, mimeType, description, cropType, language } = req.body;
      const isHindi = language === "hi";

      if (!image) {
        return res.status(400).json({ success: false, message: "No image data provided" });
      }

      const isMock = typeof image === "string" && image.startsWith("MOCK_IMAGE_TEMPLATE_");
      const ai = CropController.getGeminiClient();

      if (ai && !isMock) {
        const imagePart = {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: image,
          },
        };

        const promptText = isHindi
          ? `इस फसल/पत्ती की बीमारी का विश्लेषण करें।
             फसल का नाम (यदि ज्ञात हो): ${cropType || "अज्ञात फसल"}
             किसान द्वारा प्रदान किया गया विवरण: ${description || "कोई विवरण नहीं दिया गया"}
             कृपया निम्नलिखित प्रारूप में स्पष्ट और वैज्ञानिक जवाब दें:
             1. **बीमारी का नाम (Disease Name)**: सटीक नाम (अंग्रेजी और हिंदी में)
             2. **प्रभाव (Impact)**: यह फसल को कैसे नुकसान पहुंचा रहा है
             3. **मुख्य लक्षण (Symptoms)**: इसके प्रमुख संकेत
             4. **रोकथाम और उपचार (Treatment & Cure)**:
                - **जैविक/प्राकृतिक समाधान (Organic Solution)**
                - **रासायनिक औषधी (Chemical Solution)**
             5. **भविष्य की रोकथाम (Prevention)**: भविष्य के उपाय।`
          : `Analyze this crop leaf/disease image.
             Crop Type (if declared): ${cropType || "Unknown Crop"}
             Farmer's Description: ${description || "None provided"}
             Please respond with this exact structure in simple, straightforward English:
             1. **Disease Identification**: Professional name of the illness, and confidence level.
             2. **Symptoms Summary**: What the farmer is seeing on the crop.
             3. **Organic/Natural Treatment**: Safe, pesticide-free home recipes or bio-fertilizers.
             4. **Chemical Treatment** (if critical): Standard safe pesticide/fungicide recommendation with precautions.
             5. **Preventative Tips**: What to change next season to avoid this.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            temperature: 0.4,
          },
        });

        return res.status(200).json({ success: true, data: { result: response.text } });
      } else {
        const result = isHindi
          ? `1. **बीमारी का नाम (Disease Name)**: पत्ती झुलसा रोग (Leaf Blight) - विश्वास स्तर 85%\n2. **प्रभाव (Impact)**: यह पत्तियों की प्रकाश संश्लेषण क्षमता को नष्ट कर उपज को 20% तक कम कर देता है।\n3. **मुख्य लक्षण (Symptoms)**: निचली पत्तियों पर भूरे, अंडाकार धब्बे बनना जो बाद में बड़े हो जाते हैं।\n4. **रोकथाम और उपचार (Treatment & Cure)**:\n   - **जैविक/प्राकृतिक समाधान (Organic Solution)**: नीम के तेल (Neem Oil 5%) का छिड़काव करें।\n   - **रासायनिक औषधी (Chemical Solution)**: मैंकोजेब (Mancozeb 75% WP) 2 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।\n5. **भविष्य की रोकथाम (Prevention)**: फसल चक्र का पालन करें और जल निकास सुदृढ़ करें।`
          : `1. **Disease Identification**: Early Leaf Blight (Confidence level: 85%)\n2. **Symptoms Summary**: Dark brown spots with concentric rings appearing first on older foliage.\n3. **Organic/Natural Treatment**: Spray organic copper-based fungicide or neem oil solution.\n4. **Chemical Treatment**: Apply Chlorothalonil or Mancozeb fungicide according to manual dosage.\n5. **Preventative Tips**: Avoid overhead watering to keep foliage dry and execute crop rotation next season.`;
        return res.status(200).json({ success: true, data: { result } });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates crop yield predictions and soil optimization tips.
   */
  public static async predictYield(req: Request, res: Response, next: NextFunction) {
    try {
      const { crop, soil, acreage, water, fertilizer, location, language } = req.body;
      const isHindi = language === "hi";

      const ai = CropController.getGeminiClient();

      if (ai) {
        const promptText = isHindi
          ? `भारतीय परिस्थिति के अनुसार फसल उपज (Crop Yield) का पूर्वानुमान लगाएं।
             विवरण:
             - फसल: ${crop}
             - मिट्टी का प्रकार: ${soil}
             - कुल भूमि (Acre): ${acreage}
             - सिंचाई/पानी की उपलब्धता: ${water}
             - उर्वरक का उपयोग: ${fertilizer}
             - स्थान: ${location || "Bhopal, MP"}
             कृपया सटीक गणितीय पूर्वानुमान लगाएं (जैसे: टन प्रति एकड़ या क्विंटल) और किसान को उत्पादन बढ़ाने के लिए 3 महत्वपूर्ण सलाह दें।`
          : `Predict/calculate the approximate crop yield and optimization recommendations for:
             - Crop: ${crop}
             - Soil Type: ${soil}
             - Land Area: ${acreage} Acre(s)
             - Irrigation / Water Source: ${water}
             - Fertilizer/Inputs: ${fertilizer}
             - Location: ${location || "Madhya Pradesh, India"}
             Provide Estimated Production in Quintals (Qtl), Expected Revenue, and 3 actionable suggestions to improve the yield.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptText,
        });

        return res.status(200).json({ success: true, data: { prediction: response.text } });
      } else {
        const prediction = isHindi
          ? `1. **अनुमानित उत्पादन**: 18 - 22 क्विंटल प्रति एकड़ (कुल: ${parseFloat(acreage) * 20} क्विंटल)\n2. **अनुमानित कमाई**: ₹ 40,000 - 48,000 प्रति एकड़ (न्यूनतम समर्थन मूल्य के अनुसार)\n3. **मृदा सुधार सुझाव**:\n   - जैविक कार्बन स्तर बढ़ाने के लिए गोबर की खाद (FYM) का प्रयोग करें।\n   - Nitrogen के नुकसान को कम करने के लिए यूरिया को 2-3 खुराकों में विभाजित करके डालें।\n   - सूक्ष्म पोषक तत्व जैसे जिंक सल्फेट का छिड़काव करें।`
          : `1. **Estimated Production**: 18 - 22 Quintals per Acre (Total: ${parseFloat(acreage) * 20} Qtl)\n2. **Expected Revenue estimate**: ₹ 40,000 - 48,000 per Acre (Based on average MSP)\n3. **Soil Optimization Actions**:\n   - Enrich soil organic matter by adding Farm Yard Manure (FYM).\n   - Split Urea applications into 2-3 top-dresses to minimize nitrogen leaching.\n   - Apply Zinc Sulphate to correct micro-nutrient deficiencies.`;
        return res.status(200).json({ success: true, data: { prediction } });
      }
    } catch (error) {
      next(error);
    }
  }
}

