import { useMutation, useQuery,} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import axios, { AxiosResponse, AxiosError } from "axios"
import {
  type Body_login_login_access_token as AccessToken,
  type TOTPToken,
  type ApiError,
  LoginService,
  type UserPublic,
  UsersService,
} from "../client"


const refreshAuthToken = async () => {
  try {
    // Assuming refresh token is stored in an HttpOnly cookie, the browser sends it automatically
    const response = await axios.post('/login/refresh-token');
    const newAccessToken = response.data.access_token;

    // Save the new access token
    localStorage.setItem('access_token', newAccessToken);

    return newAccessToken;
  } catch (error) {
    // If refresh token fails, remove the access token and redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw error;
  }
};

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response; // If response is successful, just return it
  },
  async (error: AxiosError) => {
    const { response } = error;

    // Check if the error is a 401 Unauthorized error
    if (response && response.status === 401) {
      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAuthToken();

        // Retry the original request with the new access token
        if (response.config) {
          response.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axios(response.config); // Retry the request
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login page
        window.location.href = '/login';
      }
    }

    // For other errors, simply return the error
    return Promise.reject(error);
  }
);


const isLoggedIn = () => {
  const token = localStorage.getItem("access_token")
  const is_totp_required = localStorage.getItem("is_totp_required")
  return token !== null && is_totp_required === null
}

const useAuth = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,      
    enabled: isLoggedIn(),
  })

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
      totp: totp
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
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong"
      }

      setError(errDetail);
    },
  })

  const totpMutation = useMutation({
    mutationFn: validateTotp,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong"
      }

      setError(errDetail);
    },
  })

  const logout = () => {
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
