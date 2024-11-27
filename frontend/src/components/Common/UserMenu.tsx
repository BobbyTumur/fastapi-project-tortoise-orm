import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FaUserAstronaut } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";

import useAuth from "../../hooks/useAuth";

const UserMenu = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <>
      {/* Desktop */}
      <Box
        display={{ base: "flex", md: "block" }}
        position="fixed"
        top={4}
        right={4}
      >
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FaUserAstronaut color="white" fontSize="18px" />}
            bg="ui.main"
            isRound
            data-testid="user-menu"
          />
          <MenuList>
            <MenuItem
              icon={<FiUser fontSize="18px" />}
              as={Link}
              to="/settings"
            >
              {t("titles.editProfile")}
            </MenuItem>
            <MenuItem
              icon={<FiLogOut fontSize="18px" />}
              onClick={handleLogout}
              color="ui.danger"
              fontWeight="bold"
            >
              {t("common.logOut")}
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </>
  );
};

export default UserMenu;
