import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  Box,
  Flex,
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
import { useQuery } from "@tanstack/react-query";
import Delete from "../Common/DeleteAlert";
import { type ApiError, type TOTPToken, UsersService } from "../../client";

function getUserQuery() {
  return {
    queryFn: () => UsersService.readUserMe(),
    queryKey: ["currentUser"],
  };
}

const TOTP: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({
    ...getUserQuery(),
  });
  const [qrUri, setQrUri] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const showToast = useCustomToast();
  const isTotpEnabled = currentUser?.is_totp_enabled ?? false;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    formState: { isDirty },
  } = useForm<TOTPToken>({
    mode: "onBlur",
    criteriaMode: "all",
  });

  // Mutation to enable TOTP
  const enableTotpMutation = useMutation({
    mutationFn: UsersService.enableTOTP,
    onSuccess: (data) => {
      setQrUri(data.uri); // Set QR code URI
      onOpen(); // Open the modal to display QR code
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
      setQrUri(null); // Clear QR URI after verification
      reset(); // Reset the form
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
  });

  // Handle enabling TOTP
  const handleEnableTotp = () => {
    enableTotpMutation.mutate();
  };

  const handleVerifyTotp: SubmitHandler<TOTPToken> = (data) => {
    verifyTotpMutation.mutate(data);
  };

  return (
    <Box>
      {/* Conditionally render Enable/Disable button */}
      {isTotpEnabled ? (
        <Button variant="danger" mt={4} onClick={deleteModal.onOpen}>
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

      <Delete
        type="TOTP"
        id="TOTP"
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
      />
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
              <Flex direction="column" align="center" gap={4}>
                {qrUri ? (
                  <Box mb={4}>
                    <QRCodeSVG value={qrUri} size={128} />
                  </Box>
                ) : (
                  <p>{t("qrCodeNotAvailable")}</p>
                )}
                <form
                  onSubmit={handleSubmit(handleVerifyTotp)}
                  style={{ width: "100%" }}
                >
                  <Flex direction="column" align="center" gap={4}>
                    <Input
                      placeholder={t("enterTotpToken")}
                      {...register("token", { required: t("tokenRequired") })}
                      size="md"
                      w="auto"
                      sx={{
                        "::placeholder": {
                          fontStyle: "italic",
                          fontSize: "sm",
                        },
                      }}
                    />
                    {errors.token && (
                      <Box color="red.500">{errors.token.message}</Box>
                    )}
                    <Button
                      variant="primary"
                      type="submit"
                      isLoading={verifyTotpMutation.isPending}
                      isDisabled={!isDirty}
                    >
                      {t("verifyTotp")}
                    </Button>
                  </Flex>
                </form>
              </Flex>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TOTP;
