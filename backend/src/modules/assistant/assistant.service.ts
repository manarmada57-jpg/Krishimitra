import { Schema, model, Document } from "mongoose";
import { env } from "../../config/env";

export interface IAssistantChat extends Document {
  user: Schema.Types.ObjectId;
  sender: "user" | "assistant";
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const assistantChatSchema = new Schema<IAssistantChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AssistantChatModel = model<IAssistantChat>("AssistantChat", assistantChatSchema);

export class AssistantService {
  private static aiClient: any = null;

  private static async getGeminiClient(): Promise<any> {
    if (this.aiClient) return this.aiClient;
    
    const apiKey = env.GEMINI_API_KEY;
    // Verify that key is a real key and not the example placeholder
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
      const { GoogleGenAI } = await import("@google/genai");
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

  public static async saveMessage(
    userId: string, 
    sender: "user" | "assistant", 
    text: string
  ): Promise<IAssistantChat> {
    return AssistantChatModel.create({
      user: userId,
      sender,
      text,
    });
  }

  public static async getChatHistory(userId: string): Promise<IAssistantChat[]> {
    return AssistantChatModel.find({ user: userId }).sort({ createdAt: 1 });
  }

  /**
   * Generates a reply to user queries.
   * Leverages Gemini API when available, otherwise falls back to smart local parser.
   */
  public static async generateReply(
    userId: string,
    message: string,
    language: "en" | "hi"
  ): Promise<string> {
    // 1. Save user prompt first
    await this.saveMessage(userId, "user", message);

    let replyText = "";
    const ai = await this.getGeminiClient();

    if (ai) {
      try {
        const history = await this.getChatHistory(userId);
        // Feed last 6 messages as context
        const chatHistory = history.slice(-6).map((msg) => ({
          role: msg.sender === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: msg.text }]
        }));

        const isHindi = language === "hi";
        const systemInstruction = isHindi
          ? `आप 'कृषि मित्र' (KrishiMitra AI) हैं, जो भारतीय किसानों के लिए एक उन्नत और मित्रवत कृषि वैज्ञानिक हैं। 
             आप भारतीय कृषि, मिट्टी के प्रकार, बीजों, खाद, सिंचाई, सरकारी योजनाओं और कीटनाशकों के विशेषज्ञ हैं।
             किसानों को बहुत ही सरल, व्यावहारिक और बिंदु-दर-बिंदु (bullet points) सुझाव हिंदी में दें। 
             सदैव आदरपूर्वक बात करें ("आप", "नमस्ते", "धन्यवाद")।`
          : `You are 'KrishiMitra AI', an extremely knowledgeable and friendly agricultural expert helping Indian farmers.
             You specialize in cropping patterns, soil health, water conservation, and farming schemes.
             Provide practical, step-by-step guidance in simple, plain, easy-to-understand English using bullet points.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            ...chatHistory,
            { role: "user", parts: [{ text: message }] }
          ],
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        replyText = response.text || (isHindi ? "क्षमा करें, मैं समझ नहीं पाया।" : "I apologize, I didn't catch that.");
      } catch (error) {
        console.error("❌ [Gemini Assistant API Error]:", error);
        replyText = this.getMockReply(message, language);
      }
    } else {
      replyText = this.getMockReply(message, language);
    }

    // 2. Save generated assistant reply
    await this.saveMessage(userId, "assistant", replyText);

    return replyText;
  }

  private static getMockReply(message: string, language: "en" | "hi"): string {
    const isHindi = language === "hi";
    const msg = message.toLowerCase();

    if (msg.includes("weather") || msg.includes("rain") || msg.includes("मौसम") || msg.includes("बारिश")) {
      return isHindi
        ? "• मौसम पूर्वानुमान के अनुसार आगामी 24 घंटों में आपके क्षेत्र में हल्की वर्षा (~4mm) होने की संभावना है।\n• कृषि सलाह: यदि फसल तैयार है तो उसे सुरक्षित स्थानों पर संग्रहित करें और रासायनिक छिड़काव रोक दें।"
        : "• Local weather models suggest light showers (~4mm) are possible within the next 24 hours.\n• Farming Tip: Postpone chemical spraying and cover harvested crop piles in the open field.";
    }

    if (msg.includes("fertilizer") || msg.includes("urea") || msg.includes("खाद") || msg.includes("यूरिया") || msg.includes("dap")) {
      return isHindi
        ? "• मिट्टी की जांच रिपोर्ट के अनुसार ही यूरिया या डीएपी डालें।\n• गेहूं की फसल में पहली सिंचाई (बुवाई के 21 दिन बाद - मुकुट जड़ अवस्था) के साथ नाइट्रोजन की पहली खुराक का छिड़काव करें।"
        : "• Apply fertilizers like Urea or DAP based strictly on soil health card recommendations.\n• For wheat, top-dress the first dose of Nitrogen around 21 days after sowing (crown root initiation stage) along with first irrigation.";
    }

    if (msg.includes("soil") || msg.includes("clay") || msg.includes("alluvial") || msg.includes("मिट्टी") || msg.includes("काली मिट्टी")) {
      return isHindi
        ? "• काली/चिकनी मिट्टी में नमी धारण करने की क्षमता अधिक होती है, अतः कम सिंचाई की आवश्यकता होती है।\n• जल निकासी की उत्तम व्यवस्था रखें ताकि जड़ों में सड़न रोग न लगे।"
        : "• Clay/black soil possesses high moisture retention capability, meaning less frequent watering is needed.\n• Ensure adequate field drainage to protect against waterlogging and root rot diseases.";
    }

    return isHindi
      ? "नमस्ते! मैं आपका 'कृषि मित्र' सहायक हूँ। आप मुझसे मिट्टी की सेहत, फसलों के रोगों, सरकारी योजनाओं या मौसम के बारे में पूछ सकते हैं। कृपया अपना प्रश्न पूछें।"
      : "Namaste! I am your KrishiMitra digital assistant. You can ask me about soil health, crop disease treatments, government schemes, or weather forecasting. Please go ahead and ask your question!";
  }
}
