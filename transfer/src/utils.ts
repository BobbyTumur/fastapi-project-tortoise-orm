import type { ApiError } from "./client"


export const handleError = (err: ApiError) => {
    const errDetail = (err.body as any)?.detail;
    let errorMessage = errDetail || "何かの問題が発生しました。";
    if (Array.isArray(errDetail) && errDetail.length > 0) {
      errorMessage = errDetail[0].msg;
    }
    return errorMessage;
  };