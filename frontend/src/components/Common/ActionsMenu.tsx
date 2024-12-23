import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash, FiFolder } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { UserPublic, ServicePublic } from "../../client";
import EditUser from "../Admin/EditUser";
import EditUserService from "../Admin/EditUserService";
import EditServiceTemplate from "../Services/EditServiceTemplate"
import Delete from "./DeleteAlert";

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
            {type} {t("common.editService")}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            {type} {t("common.delete")}
          </MenuItem>
        </MenuList>
        {type === t("common.user") ? (
          <EditUser
            user={value as UserPublic}
            isOpen={editModal.isOpen}
            onClose={editModal.onClose}
          />
        ) : (
          <EditServiceTemplate
            // serviceId={value.id}
            // isOpen={editModal.isOpen}
            // onClose={editModal.onClose}
          />
        )
        }

        <EditUserService
          userId={value.id}
          isOpen={editUserServiceModal.isOpen}
          onClose={editUserServiceModal.onClose}
        />
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
