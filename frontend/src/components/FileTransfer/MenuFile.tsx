import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiTrash, FiDownload, FiSend } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import FileDelete from "./FileDelete";
import useCustomToast from "../../hooks/useCustomToast";
import { useMutation } from "@tanstack/react-query";
import { ApiError, FileTransferService } from "../../client";
import { handleError } from "../../utils";
import CreateUrl from "./CreateUrl";

interface MenuFileProps {
  fileKey: string;
  urlGenerationShown?: boolean;
}

const MenuFile = ({ fileKey, urlGenerationShown }: MenuFileProps) => {
  const { t } = useTranslation();
  const showToast = useCustomToast();
  const fileDeleteModal = useDisclosure();
  const createUrlModal = useDisclosure();

  const downloadMutation = useMutation({
    mutationFn: () => FileTransferService.downloadFile({ fileName: fileKey }),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });
  const handleDownloadMutation = () => {
    downloadMutation.mutate();
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
          height="100%" // Make sure it matches the parent's height
          minHeight="auto"
        />
        <MenuList fontSize={"sm"}>
          <MenuItem
            onClick={handleDownloadMutation}
            icon={<FiDownload fontSize="16px" />}
          >
            {t("common.download")}
          </MenuItem>
          {urlGenerationShown && (
            <MenuItem
              onClick={createUrlModal.onOpen}
              icon={<FiSend fontSize="16px" />}
            >
              {t("titles.createUrl")}
            </MenuItem>
          )}

          <MenuItem
            onClick={fileDeleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            {t("common.delete")}
          </MenuItem>
          <CreateUrl
            type="download"
            isOpen={createUrlModal.isOpen}
            onClose={createUrlModal.onClose}
            fileKey={fileKey}
          />
          <FileDelete
            fileKey={fileKey}
            isOpen={fileDeleteModal.isOpen}
            onClose={fileDeleteModal.onClose}
          />
        </MenuList>
      </Menu>
    </>
  );
};

export default MenuFile;
