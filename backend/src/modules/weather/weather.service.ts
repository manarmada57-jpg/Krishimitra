interface CachedWeather {
  data: any;
  timestamp: number;
}

export class WeatherService {
  private static cache: Map<string, CachedWeather> = new Map();
  private static TTL = 24 * 60 * 60 * 1000; // 24 hour cache duration

  private static getCacheKey(lat: number, lng: number): string {
    // Round to 2 decimal places to capture close proximity locations
    return `${lat.toFixed(2)}:${lng.toFixed(2)}`;
  }

  /**
   * Fetches weather forecast for given coordinates.
   * Utilizes in-memory caching to avoid hitting external APIs excessively.
   */
  public static async getForecast(lat: number, lng: number): Promise<any> {
    const key = this.getCacheKey(lat, lng);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`☁️ [Weather] Serving cache-hit forecast for coordinate key: ${key}`);
      return cached.data;
    }

    try {
      console.log(`☁️ [Weather] Cache-miss. Querying live weather for lat=${lat}, lng=${lng}`);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max&current_weather=true&timezone=auto`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API returned status: ${response.status}`);
      }
      
      const data = await response.json();

      const formattedData = {
        temp: Math.round(data.current_weather?.temperature ?? 28),
        condition: data.current_weather?.weathercode !== undefined 
          ? this.mapWeatherCode(data.current_weather.weathercode) 
          : "Partly Cloudy",
        conditionHi: data.current_weather?.weathercode !== undefined 
          ? this.mapWeatherCodeHi(data.current_weather.weathercode) 
          : "आंशिक रूप से बादल",
        humidity: Math.round(data.daily?.relative_humidity_2m_max?.[0] ?? 60),
        windSpeed: Math.round(data.current_weather?.windspeed ?? 12),
        cloudCover: 35,
        rainfall: data.daily?.precipitation_sum?.[0] ?? 0,
        uvIndex: 6,
        pressure: 1012,
        soilTemp: Math.round((data.current_weather?.temperature ?? 28) - 1.5),
        forecast: (data.daily?.time ?? []).map((dateStr: string, idx: number) => {
          const tempMax = data.daily?.temperature_2m_max?.[idx] ?? 30;
          const tempMin = data.daily?.temperature_2m_min?.[idx] ?? 22;
          const rainfall = data.daily?.precipitation_sum?.[idx] ?? 0;
          const humidity = data.daily?.relative_humidity_2m_max?.[idx] ?? 60;
          
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const dayNameHi = this.getHindiDay(dayName);

          return {
            day: dayName,
            dayHi: dayNameHi,
            temp: Math.round((tempMax + tempMin) / 2),
            rainfall,
            humidity,
          };
        }),
      };

      this.cache.set(key, { data: formattedData, timestamp: Date.now() });
      return formattedData;
    } catch (error) {
      console.error("❌ [Weather Service] Fetch failed. Reverting to local fallback generator:", error);
      const fallbackData = this.generateMockWeather(lat, lng);
      this.cache.set(key, { data: fallbackData, timestamp: Date.now() });
      return fallbackData;
    }
  }

  private static mapWeatherCode(code: number): string {
    if (code === 0) return "Clear Sunny";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Drizzle / Rain";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
  }

  private static mapWeatherCodeHi(code: number): string {
    if (code === 0) return "धूप / साफ";
    if (code >= 1 && code <= 3) return "आंशिक रूप से बादल";
    if (code >= 45 && code <= 48) return "कोहरा";
    if (code >= 51 && code <= 67) return "बूंदाबांदी / वर्षा";
    if (code >= 71 && code <= 77) return "बर्फबारी";
    if (code >= 80 && code <= 82) return "तेज वर्षा";
    if (code >= 95) return "गरज के साथ तूफान";
    return "बादल";
  }

  private static getHindiDay(day: string): string {
    const map: Record<string, string> = {
      Mon: "सोम",
      Tue: "मंगल",
      Wed: "बुध",
      Thu: "गुरु",
      Fri: "शुक्र",
      Sat: "शनि",
      Sun: "रवि",
    };
    return map[day] || day;
  }

  private static generateMockWeather(lat: number, lng: number): any {
    const baseTemp = 24 + Math.round((Math.abs(lat) + Math.abs(lng)) % 12);
    return {
      temp: baseTemp,
      condition: "Partly Cloudy",
      conditionHi: "आंशिक रूप से बादल",
      humidity: 62,
      windSpeed: 10,
      cloudCover: 40,
      rainfall: 1.2,
      uvIndex: 5,
      pressure: 1011,
      soilTemp: baseTemp - 2,
      forecast: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => ({
        day,
        dayHi: this.getHindiDay(day),
        temp: baseTemp + (idx % 3) - 1,
        rainfall: idx % 4 === 0 ? 4.5 : 0,
        humidity: 58 + idx,
      })),
    };
  }
}
