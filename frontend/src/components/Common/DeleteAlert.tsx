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

import { UsersService, TotpService } from "../../client";
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
      await TotpService.disableTotp();
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
        type === t("common.user") ? t("toast.userDeleted") : t("toast.totpDisabled"),
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
              {
                type === t("common.user") ? (
                  <span>
                    {t("warnings.deleteUserAlert")}{" "}
                    <strong>{t("warnings.permaUserDelete")}</strong>
                  </span>
                ) : (
                  <span>
                    {t("warnings.disableOtpAlert")}{" "}
                    <strong>{t("warnings.permaOtpDisable")}</strong>
                  </span>
                )
              }
              {t("warnings.areYouSure")}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button variant="danger" type="submit" isLoading={isSubmitting}>
                {t("buttons.disable")}
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

export default Delete;
