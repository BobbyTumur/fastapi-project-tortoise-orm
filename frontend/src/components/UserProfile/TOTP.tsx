import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { handleError } from "../../utils";
import useCustomToast from "../../hooks/useCustomToast";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ApiError,
  type TOTPToken,
  type UserPublic,
  UsersService,
} from "../../client";

const TOTP: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const [qrUri, setQrUri] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showToast = useCustomToast();
  const [isTotpEnabled, setIsTotpEnabled] = useState(false); // Track TOTP status

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TOTPToken>({
    mode: "onBlur",
    criteriaMode: "all",
  });

  // Set TOTP status based on current user data
  React.useEffect(() => {
    if (currentUser) {
      setIsTotpEnabled(currentUser.is_totp_enabled ?? false);
    }
  }, [currentUser]);

  // Mutation to enable TOTP
  const enableTotpMutation = useMutation({
    mutationFn: UsersService.enableTOTP,
    onSuccess: (data) => {
      setQrUri(data.uri); // Set QR code URI
      onOpen(); // Open the modal to display QR code
      showToast(t("toast.success"), t("toast.totpEnabled"), "success");
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });

  // Mutation to disable TOTP
  const disableTotpMutation = useMutation({
    mutationFn: UsersService.disableTOTP,
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.totpDisabled"), "success");
      setIsTotpEnabled(false); // Mark TOTP as disabled
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });

  // Mutation to verify TOTP token
  const verifyTotpMutation = useMutation({
    mutationFn: (data: TOTPToken) =>
      UsersService.verifyTOTP({ requestBody: data }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.totpVerified"), "success");
      setIsTotpEnabled(true); // Mark TOTP as enabled
      setQrUri(null); // Clear QR URI after verification
      reset(); // Reset the form
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });

  // Handle enabling TOTP
  const handleEnableTotp = () => {
    enableTotpMutation.mutate();
  };

  // Handle disabling TOTP
  const handleDisableTotp = () => {
    disableTotpMutation.mutate();
  };

  // Handle verifying TOTP token
  const handleVerifyTotp: SubmitHandler<TOTPToken> = (data) => {
    verifyTotpMutation.mutate(data);
  };

  return (
    <Box>
      {/* Conditionally render Enable/Disable button */}
      {isTotpEnabled ? (
        <Button
          variant="primary"
          mt={4}
          onClick={handleDisableTotp}
          isLoading={disableTotpMutation.isPending}
        >
          {t("disableTotp")}
        </Button>
      ) : (
        <Button
          variant="primary"
          mt={4}
          onClick={handleEnableTotp}
          isLoading={enableTotpMutation.isPending}
        >
          {t("enableTotp")}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("scanQrCode")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {qrUri && (
              <Box textAlign="center">
                {qrUri ? (
                  <QRCodeSVG value={qrUri} size={256} />
                ) : (
                  <p>{t("qrCodeNotAvailable")}</p>
                )}
                <form onSubmit={handleSubmit(handleVerifyTotp)}>
                  <Input
                    mt={4}
                    placeholder={t("enterTotpToken")}
                    {...register("token", { required: t("tokenRequired") })}
                    size="md"
                    w="auto"
                  />
                  {errors.token && (
                    <Box color="red.500" mt={2}>
                      {errors.token.message}
                    </Box>
                  )}
                  <Button
                    variant="primary"
                    mt={4}
                    type="submit"
                    isLoading={verifyTotpMutation.isPending}
                  >
                    {t("verifyTotp")}
                  </Button>
                </form>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TOTP;
