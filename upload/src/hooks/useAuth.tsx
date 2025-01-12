import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";

import {
  type Body_upload___login_access_token as AccessToken,
  type ApiError,
  UploadService,
} from "../client";

const isLoggedIn = () => {
  return sessionStorage.getItem("access_token") !== null;
};

const useAuth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const login = async (data: AccessToken) => {
    const response = await UploadService.loginAccessToken({
      formData: data,
    });
    sessionStorage.setItem("access_token", response.access_token);
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail;

      if (err instanceof AxiosError) {
        errDetail = err.message;
      }

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong";
      }

      setError(errDetail);
    },
  });

  const logout = (): void => {
    sessionStorage.removeItem("access_token");
    window.location.replace("https://support.ntt.com/");
  };

  return {
    loginMutation,
    logout,
    error,
    resetError: () => setError(null),
  };
};

export { isLoggedIn };
export default useAuth;
