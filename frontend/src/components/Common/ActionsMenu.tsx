import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  FiEdit,
  FiTrash,
  FiFolder,
  FiFileText,
  FiClipboard,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";

import type { UserPublic, ServicePublic } from "../../client";
import EditUser from "../Admin/EditUser";
import EditUserService from "../Admin/EditUserService";
import Delete from "./DeleteAlert";
import { useQueryClient } from "@tanstack/react-query";

interface ActionsMenuProps {
  type: string;
  value: UserPublic | ServicePublic;
  disabled?: boolean;
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editModal = useDisclosure();
  const editUserServiceModal = useDisclosure();
  const deleteModal = useDisclosure();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

  const handleNavigateToLog = () => {
    if (type === t("common.service")) {
      navigate({ to: `/services/${value.id}/log` });
    }
  };

  const handleNavigateToTemplate = () => {
    if (type === t("common.service")) {
      navigate({ to: `/services/${value.id}/template` });
    }
  };

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          {type === t("common.user") ? (
            <>
              <MenuItem
                onClick={editModal.onOpen}
                icon={<FiEdit fontSize="16px" />}
              >
                {type} {t("common.edit")}
              </MenuItem>
              <MenuItem
                onClick={editUserServiceModal.onOpen}
                icon={<FiFolder fontSize="16px" />}
              >
                {t("common.editService")}
              </MenuItem>
              <EditUser
                user={value as UserPublic}
                isOpen={editModal.isOpen}
                onClose={editModal.onClose}
              />
              <EditUserService
                user={value as UserPublic}
                isOpen={editUserServiceModal.isOpen}
                onClose={editUserServiceModal.onClose}
              />
            </>
          ) : (
            <>
              <MenuItem
                onClick={handleNavigateToLog}
                icon={<FiFileText fontSize="16px" />}
              >
                {t("common.viewLog")}
              </MenuItem>
              <MenuItem
                onClick={handleNavigateToTemplate}
                icon={<FiClipboard fontSize="16px" />}
              >
                {t("common.viewEditTemplate")}
              </MenuItem>
            </>
          )}
          {currentUser?.is_superuser && (
            <MenuItem
              onClick={deleteModal.onOpen}
              icon={<FiTrash fontSize="16px" />}
              color="ui.danger"
            >
              {type} {t("common.delete")}
            </MenuItem>
          )}
        </MenuList>
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  );
};

export default ActionsMenu;
