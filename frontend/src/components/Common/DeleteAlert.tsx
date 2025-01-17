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

import { UsersService, TotpService, ServicesService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { useTranslation } from "react-i18next";

// Define the class to map types to their properties
class DeleteEntity {
  title: string;
  warning: JSX.Element;
  successMessage: string;
  errorMessage: string;
  queryKey: string;
  button: string;

  constructor(type: string, t: any) {
    this.errorMessage =
      type === t("common.totp")
        ? t("toast.totpErrorDetail")
        : `${type} t("toast.errorDetail")`;
    this.button =
      type === t("common.totp") ? t("buttons.disable") : t("buttons.delete");

    if (type === t("common.user")) {
      this.title = t("titles.deleteUser");
      this.warning = (
        <span>
          {t("warnings.deleteUserAlert")}{" "}
          <strong>{t("warnings.permaDelete")}</strong>
        </span>
      );
      this.successMessage = t("toast.userDeleted");
      this.errorMessage = `${type} ${t("toast.errorDetail")}`;
      // this.button = t("buttons.delete");
      this.queryKey = "users";
    } else if (type === t("common.service")) {
      this.title = t("titles.deleteService");
      this.warning = (
        <span>
          {t("warnings.deleteServiceAlert")}{" "}
          <strong>{t("warnings.permaServiceDelete")}</strong>
        </span>
      );
      this.successMessage = t("toast.serviceDeleted");
      this.errorMessage = `${type} ${t("toast.errorDetail")}`;
      // this.button = t("buttons.delete");
      this.queryKey = "services";
    } else if (type === t("common.totp")) {
      this.title = t("titles.disableTotp");
      this.warning = (
        <span>
          {t("warnings.disableOtpAlert")}{" "}
          <strong>{t("warnings.permaOtpDisable")}</strong>
        </span>
      );
      this.successMessage = t("toast.totpDisabled");
      this.errorMessage = t("toast.totpErrorDetail");
      // this.button = t("buttons.disable");
      this.queryKey = "currentUser";
    } else {
      throw new Error(`Unexpected type: ${type}`);
    }
  }
}

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

  // Instantiate the class with the type and id
  const entity = new DeleteEntity(type, t);

  // Define the mutation logic directly in the component
  const mutation = useMutation({
    mutationFn: async () => {
      if (type === t("common.user") && id) {
        await UsersService.deleteUser({ userId: id });
      } else if (type === t("common.service") && id) {
        await ServicesService.deleteService({ serviceId: id });
      } else if (type === t("common.totp")) {
        await TotpService.disableTotp();
      } else {
        throw new Error(`Unexpected type or missing id: ${type}`);
      }
    },
    onSuccess: () => {
      showToast(t("toast.success"), entity.successMessage, "success");
      onClose();
    },
    onError: () => {
      showToast(t("toast.error"), entity.errorMessage, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [entity.queryKey],
      });
    },
  });

  const onSubmit = async () => {
    mutation.mutate();
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
            <AlertDialogHeader>{entity.title}</AlertDialogHeader>

            <AlertDialogBody>
              {entity.warning}
              {t("warnings.areYouSure")}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button variant="danger" type="submit" isLoading={isSubmitting}>
                {entity.button}
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
