import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

import type {
  Body_login_login_access_token,
  Message,
  NewPassword,
  Token,
  UserPublic,
  UpdatePassword,
  UserRegister,
  UsersPublic,
  UserUpdate,
  ServicePublic,
  ServicesPublic,
  ServiceCreate,
  UserServiceUpdate,
  TOTPToken,
  QRUri
} from "./models"

export type TDataLoginAccessToken = {
  formData: Body_login_login_access_token
}
export type TDataValidateTotp = {
  totp: TOTPToken
}
export type TDataRecoverPassword = {
  email: string
}
export type TDataResetPassword = {
  requestBody: NewPassword
}
export type TDataSetupPassword = {
  requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContent = {
  email: string
}

export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * if token_type is totp, redirects to totp validation page
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: TDataLoginAccessToken,
  ): CancelablePromise<Token> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Login Access Token afer totp validation
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static validateTotp(
    data: TDataValidateTotp,
  ): CancelablePromise<Token> {
    const { totp } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/validate-totp",
      body: totp,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }


  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    })
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: TDataRecoverPassword,
  ): CancelablePromise<Message> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: TDataResetPassword,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
 * Set Up Password
 * Set Up password
 * @returns Message Successful Response
 * @throws ApiError
 */
  public static setupPassword(
    data: TDataSetupPassword,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/setup-password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: TDataRecoverPasswordHtmlContent,
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadUsers = {
  limit?: number
  skip?: number
}
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword
}

export type TDataRegisterUser = {
  requestBody: UserRegister
}
export type TDataReadUserById = {
  userId: string
}
export type TDataReadUserServices = {
  userId: string
}

export type TDataUpdateUserService = {
  requestBody: UserServiceUpdate
  userId: string
}

export type TDataUpdateUser = {
  requestBody: UserUpdate
  userId: string
}
export type TDataDeleteUser = {
  userId: string
}
export type TDataVerifyTOTP = {
  requestBody: TOTPToken
}

export class UsersService {
  /**
   * Read Users
   * Retrieve users.
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: TDataReadUsers = {},
  ): CancelablePromise<UsersPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create User
   * Create new user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: TDataRegisterUser,
  ): CancelablePromise<UserRegister> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/adduser",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    })
  }


  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: TDataUpdatePasswordMe,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: TDataReadUserById,
  ): CancelablePromise<UserPublic> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User Services By User Id
   * @returns Array of UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserServices(
    data: TDataReadUserServices,
  ): CancelablePromise<Array<ServicePublic>> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}/services",
      path: {
        user_id: userId
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update User Services
   * Update a user services.
   * @returns Message Successful Response
   * @throws ApiError
   */
    public static updateUserService(
      data: TDataUpdateUserService,
    ): CancelablePromise<Message> {
      const { requestBody, userId } = data
      return __request(OpenAPI, {
        method: "PATCH",
        url: "/api/v1/users/{user_id}/services",
        path: {
          user_id: userId,
        },
        body: requestBody,
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      })
    }



  /**
   * Update User
   * Update a user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: TDataUpdateUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody, userId } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }


  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
    /**
   * Enable own TOTP
   * @returns Message Successful Response
   * @throws ApiError
   */
    public static enableTOTP(): CancelablePromise<QRUri> {
      return __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/totp/enable",
      })
    }
  
    /**
   * Disable own TOTP
   * @returns Message Successful Response
   * @throws ApiError
   */
    public static disableTOTP(
    ): CancelablePromise<Message> {
      return __request(OpenAPI, {
        method: "DELETE",
        url: "/api/v1/totp/disable",
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      })
    }

  /**
   * Enable own TOTP
   * @returns Message Successful Response
   * @throws ApiError
   */
    public static verifyTOTP(
      data: TDataVerifyTOTP,
    ): CancelablePromise<Message> {
      const { requestBody } = data
      return __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/totp/verify",
        body: requestBody,
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      })
    }


}

export type TDataTestEmail = {
  emailTo: string
}

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
    const { emailTo } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Health Check
   * @returns boolean Successful Response
   * @throws ApiError
   */
  public static healthCheck(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/health-check",
    })
  }
}


export type TDataReadServices = {
  limit?: number
  skip?: number
}
export type TDataServiceCreate = {
  requestBody: ServiceCreate
}

export class ServicesService {
/**
 * Get all services
 * @returns Message Successful Response
 * @throws ApiError
 */
  public static readAllServices(
    data: TDataReadServices = {},
  ): CancelablePromise<ServicesPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/services/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
  /**
   * Create a service.
   * @returns ServicePublic Successful Response
   * @throws ApiError
   */
    public static createService(
      data: TDataServiceCreate,
    ): CancelablePromise<ServicePublic> {
      const { requestBody } = data
      return __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/services/",
        body: requestBody,
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      })
    }
}
