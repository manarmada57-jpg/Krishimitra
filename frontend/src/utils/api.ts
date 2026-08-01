/**
 * Standard API Client wrapping fetch requests.
 * Automatically injects JWT Bearer tokens and handles token refresh rotation on 401s.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export async function apiFetch<T = any>(
  path: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ""; // Express backend url
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  let token = localStorage.getItem("krishimitra_access_token");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Default Content-Type to JSON if body is provided and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, fetchOptions);

    // 1. Intercept 401 and try to refresh token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("krishimitra_refresh_token");
      if (refreshToken) {
        console.log("🔑 Access token expired. Attempting token rotation...");
        try {
          const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data) {
              const newAccess = refreshData.data.accessToken;
              const newRefresh = refreshData.data.refreshToken;

              localStorage.setItem("krishimitra_access_token", newAccess);
              if (newRefresh) {
                localStorage.setItem("krishimitra_refresh_token", newRefresh);
              }

              // 2. Retry the original request with the new access token
              headers.set("Authorization", `Bearer ${newAccess}`);
              response = await fetch(url, fetchOptions);
            }
          } else {
            // Refresh token expired or invalid -> logout user
            console.warn("🔑 Refresh token expired. Logging out user.");
            handleForceLogout();
          }
        } catch (refreshErr) {
          console.error("🔑 Token rotation network error:", refreshErr);
        }
      }
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error: any) {
    console.error(`❌ API Fetch error on ${path}:`, error);
    return {
      success: false,
      message: error.message || "Network request failed",
    };
  }
}

function handleForceLogout() {
  localStorage.removeItem("krishimitra_access_token");
  localStorage.removeItem("krishimitra_refresh_token");
  localStorage.removeItem("krishimitra_username");
  localStorage.removeItem("krishimitra_location_id");
  localStorage.removeItem("krishimitra_onboarded");
  // Reload page to trigger Auth screen redirect
  window.location.reload();
}
