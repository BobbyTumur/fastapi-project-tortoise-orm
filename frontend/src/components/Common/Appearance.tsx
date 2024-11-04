import { Box, IconButton, useColorMode } from "@chakra-ui/react";
import { FaSun, FaMoon } from "react-icons/fa";

const Appearance = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      display={{ base: "flex", md: "block" }}
      position="fixed"
      top={4}
      right={20}
    >
      <IconButton
        aria-label="Toggle color mode"
        icon={
          colorMode === "light" ? (
            <FaMoon color="white" fontSize="18px" />
          ) : (
            <FaSun color="white" fontSize="18px" />
          )
        }
        onClick={toggleColorMode}
        bg="ui.main"
        isRound
      />
    </Box>
  );
};

export default Appearance;
