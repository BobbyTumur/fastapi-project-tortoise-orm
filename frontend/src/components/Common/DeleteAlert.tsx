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
  type: string;
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

const Delete = ({ type, id, isOpen, onClose }: DeleteProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const { t } = useTranslation();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteEntity = async (id: string) => {
    if (type === "TOTP") {
      await UsersService.disableTOTP();
    } else if (type === t("common.user")) {
      await UsersService.deleteUser({ userId: id });
    } else {
      throw new Error(`Unexpected type: ${type}`);
    }
  };

  const mutation = useMutation({
    mutationFn: deleteEntity,
    onSuccess: () => {
      showToast(
        t("toast.success"),
        type === "User" ? t("toast.userDeleted") : t("toast.TOTPDisabled"),
        "success"
      );
      onClose();
    },
    onError: () => {
      showToast(t("toast.error"), `${type} t("toast.errorDetail")`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [type === t("common.user") ? "users" : "currentUser"],
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
            <AlertDialogHeader>
              {type === t("common.user")
                ? t("titles.deleteUser")
                : t("titles.disableTotp")}
            </AlertDialogHeader>

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
