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
      const hadToken = !!token || !!refreshToken;

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
            } else {
              console.warn("🔑 Token rotation returned unsuccessful status. Logging out.");
              handleForceLogout();
            }
          } else {
            // Refresh token expired or invalid -> logout user
            console.warn("🔑 Refresh token expired. Logging out user.");
            handleForceLogout();
          }
        } catch (refreshErr) {
          console.error("🔑 Token rotation network error:", refreshErr);
          handleForceLogout();
        }
      } else if (hadToken) {
        console.warn("🔑 Token invalid/expired with no refresh token. Logging out user.");
        handleForceLogout();
      } else {
        // User was never authenticated, do not trigger logout or loop reloads
        console.warn(`🔒 Endpoint ${path} requires authentication.`);
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
  const hadToken = !!localStorage.getItem("krishimitra_access_token") || !!localStorage.getItem("krishimitra_refresh_token");
  localStorage.removeItem("krishimitra_access_token");
  localStorage.removeItem("krishimitra_refresh_token");
  localStorage.removeItem("krishimitra_username");
  localStorage.removeItem("krishimitra_location_id");
  localStorage.removeItem("krishimitra_onboarded");
  localStorage.removeItem("krishimitra_farmer_profile");
  localStorage.removeItem("krishimitra_active_farm_id");

  // Only dispatch logout event to update React state smoothly without infinite reload loops
  if (hadToken) {
    window.dispatchEvent(new Event("krishimitra_auth_logout"));
  }
}
