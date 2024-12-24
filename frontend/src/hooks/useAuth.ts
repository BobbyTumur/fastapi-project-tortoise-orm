import { useState, useEffect } from "react"
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useMutation, useQuery,} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import axios from "axios"
import {
  type Body_login___login_access_token as AccessToken,
  type TOTPToken,
  type ApiError,
  LoginService,
  type UserPublic,
  UsersService,
} from "../client"

// Utility: Get Token Expiration Time
const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null; // Invalid token, return null
  }
};

// Function: Refresh Auth Token
const refreshAuthToken = async () => {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    const refreshTokenEndpoint = "/api/v1/login/refresh-token";
    const url = `${apiBaseUrl}${refreshTokenEndpoint}`;

    const response = await axios.post(url, {}, { withCredentials: true });
    const newAccessToken = response.data.access_token;

    localStorage.setItem("access_token", newAccessToken);
    return newAccessToken;
  } catch (error) {
    // localStorage.removeItem("access_token");
    // window.location.href = "/login"; // Redirect on failure
    // throw error;
  }
};

// Function: Refresh Token if Needed
const refreshIfNeeded = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  const expiration = getTokenExpiration(token);
  if (expiration && Date.now() > expiration - 60 * 1000) {
    // Refresh 1 min before expiry
    await refreshAuthToken();
  }
};

const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("access_token")
  const is_totp_required = localStorage.getItem("is_totp_required")
  return !!token && is_totp_required === null
}

const useAuth = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,      
    enabled: isLoggedIn(),
  })
  // Periodic Token Expiration Check
  useEffect(() => {
    const interval = setInterval(() => {
      refreshIfNeeded().catch(() => logout());
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    if (response.token_type === "totp") {
      // If the token class is TOTP, set it as "totp_token"
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("is_totp_required", "true")
    } else {
      // Otherwise, set it as "access_token"
      localStorage.setItem("access_token", response.access_token);
    }
    return response.token_type;
  };

  const validateTotp = async (totp: TOTPToken) => {
    const response = await LoginService.validateTotp({
      requestBody: totp
    });
    localStorage.setItem("access_token", response.access_token)
    localStorage.removeItem("is_totp_required")
  };
  
  

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (token_class) => {
      if (token_class === "totp") {
        navigate({ to: "/validate-totp"});
      } else {
        navigate({ to: "/" });
      }
    },
    onError: (err: ApiError) => {
      const errDetail = Array.isArray(err.body)
        ? "An unexpected error occurred."
        : (err.body as any)?.detail || "Failed to log in. Please try again.";
      setError(errDetail);
    },
  })

  const totpMutation = useMutation({
    mutationFn: validateTotp,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: ApiError) => {
      const errDetail = Array.isArray(err.body)
        ? "An unexpected error occurred."
        : (err.body as any)?.detail || "Failed to validate TOTP. Please try again.";
      setError(errDetail);
    },
  })

  const logout = (): void => {
    localStorage.removeItem("access_token")
    navigate({ to: "/login" })
  }

  return {
    loginMutation,
    totpMutation,
    logout,
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn }
export default useAuth
