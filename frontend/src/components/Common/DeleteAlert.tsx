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

import { UsersService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { useTranslation } from "react-i18next";

interface DeleteProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

const Delete = ({ id, isOpen, onClose }: DeleteProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const { t } = useTranslation();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteUser = async (id: string) => {
    await UsersService.deleteUser({ userId: id });
  };

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.userDeleted"), "success");
      onClose();
    },
    onError: () => {
      showToast(t("toast.error"), t("toast.errorDetail"), "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  const onSubmit = async () => {
    mutation.mutate(id);
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
            <AlertDialogHeader>{t("titles.deleteUser")}</AlertDialogHeader>

            <AlertDialogBody>
              <span>
                {t("warnings.deleteAlert")}{" "}
                <strong>{t("warnings.permaDelete")}</strong>
              </span>
              {t("warnings.areYouSure")}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button variant="danger" type="submit" isLoading={isSubmitting}>
                {t("common.delete")}
              </Button>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Delete;
