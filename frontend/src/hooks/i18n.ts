import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend"; // For loading translation files
import LanguageDetector from "i18next-browser-languagedetector"; // For detecting the user's language

i18n
  .use(HttpApi) // Load translations
  .use(LanguageDetector) // Detect the browser language
  .use(initReactI18next) // Integrate with React
  .init({
    fallbackLng: "en", // Default language
    supportedLngs: ["en", "jp"], // Languages your app supports
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // Path to translation files
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    debug: true, // Remove in production
  });

export default i18n;
