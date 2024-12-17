import type { ApiError } from "./client"
import i18n from "./hooks/i18n";

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  get message() {
    return i18n.t("utils.invalidMail");
  },
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  get message () {
    return i18n.t("utils.invalidName");
  },
}

export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      get message() {
        return i18n.t("utils.passwordLength");
      },
    },
  };

  if (isRequired) {
    Object.defineProperty(rules, "required", {
      get() {
        return i18n.t("forms.passwordRequired");
      },
    });
  }

  return rules;
};

export const confirmPasswordRules = (
  getValues: () => any,
  isRequired = true,
) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password;
      return value === password ? true : i18n.t("utils.passwordNotMatch");
    },
  };

  if (isRequired) {
    Object.defineProperty(rules, "required", {
      get() {
        return i18n.t("utils.passwordConfirmRequired");
      },
    });
  }

  return rules;
};


export const handleError = (err: ApiError, showToast: any) => {
  const errDetail = (err.body as any)?.detail
  let errorMessage = errDetail || i18n.t("error.somethingWentWrong")
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg
  }
  showToast("Error", errorMessage, "error")
}
