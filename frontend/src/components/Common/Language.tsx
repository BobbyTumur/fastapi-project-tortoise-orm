import { useTranslation } from "react-i18next";
import { Box, IconButton } from "@chakra-ui/react";
import { TbLanguageHiragana } from "react-icons/tb";

const Language = () => {
  const { i18n } = useTranslation();

  // Switch between available languages
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "jp" : "en"; // Assuming "en" and "jp"
    i18n.changeLanguage(newLang);
  };

  return (
    <Box
      display={{ base: "none", md: "block" }}
      position="fixed"
      top={4}
      right={36}
    >
      <IconButton
        aria-label="Toggle language"
        icon={
          i18n.language === "en" ? (
            <TbLanguageHiragana color="white" fontSize="18px" />
          ) : (
            <TbLanguageHiragana color="white" fontSize="18px" />
          )
        }
        onClick={toggleLanguage}
        bg="ui.main"
        isRound
      />
    </Box>
  );
};

export default Language;
