import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";

import { ApiError, FileTransferService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { useTranslation } from "react-i18next";
import { handleError } from "../../utils";

interface FileDeleteProps {
  fileKey: string;
  isOpen: boolean;
  onClose: () => void;
}

const FileDelete = ({ fileKey, isOpen, onClose }: FileDeleteProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (fileKey: string) => {
      await FileTransferService.deleteFile({ fileName: fileKey });
    },
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.fileDeleted"), "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      const prefix = fileKey.split("/")[0];
      queryClient.invalidateQueries({
        queryKey: [prefix, "fileObjects"],
      });
    },
  });

  const onSubmit = async () => {
    mutation.mutate(fileKey);
  };

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
            <AlertDialogHeader>{t("titles.deleteFile")}</AlertDialogHeader>

            <AlertDialogBody>
              <span>
                {t("warnings.deleteFileAlert")}{" "}
                <strong>{t("warnings.permaDelete")}</strong>
              </span>
              {t("warnings.areYouSure")}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button variant="danger" type="submit" isLoading={isSubmitting}>
                {t("buttons.delete")}
              </Button>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                {t("buttons.cancel")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default FileDelete;
