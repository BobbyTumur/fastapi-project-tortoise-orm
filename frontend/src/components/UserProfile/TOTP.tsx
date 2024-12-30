import {
  Box,
  Text,
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
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import { handleError } from "../../utils";
import Delete from "../Common/DeleteAlert";
import useCustomToast from "../../hooks/useCustomToast";
import {
  type ApiError,
  TotpService,
  TOTPToken,
  UsersService,
} from "../../client";

const TOTP = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => UsersService.readUserMe(),
  });

  const [qrUri, setQrUri] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const showToast = useCustomToast();
  const isTotpEnabled = currentUser?.is_totp_enabled ?? false;

  const { register, handleSubmit, reset, watch, setValue } = useForm<TOTPToken>(
    {
      mode: "onBlur",
      criteriaMode: "all",
    }
  );

  // Mutation to enable TOTP
  const enableTotpMutation = useMutation({
    mutationFn: TotpService.enableTotp,
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
      TotpService.totpLoginVerify({ requestBody: data }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.totpEnabled"), "success");
      setQrUri(null); // Clear QR URI after verification
      reset(); // Reset the form
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
      reset();
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
  });

  const currentToken = watch("token") || "";
  const isDisabled = currentToken.length !== 6;

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setValue("token", value); // Update form value using setValue
  };

  // Handle enabling TOTP
  const handleEnableTotp = () => {
    enableTotpMutation.mutate();
  };

  const handleVerifyTotp: SubmitHandler<TOTPToken> = (data) => {
    verifyTotpMutation.mutate(data);
  };

  return (
    <Box>
      {isTotpEnabled ? (
        <Flex direction="column" align="start" gap={4}>
          <Text>{t("texts.totpIsEnabled")}</Text>
          <Button variant="danger" onClick={deleteModal.onOpen}>
            {t("buttons.disableTotp")}
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" align="start" gap={4}>
          <Text>{t("texts.totpIsDisabled")}</Text>
          <Button
            variant="primary"
            onClick={handleEnableTotp}
            isLoading={enableTotpMutation.isPending}
          >
            {t("buttons.enableTotp")}
          </Button>
        </Flex>
      )}

      <Delete
        type={t("common.totp")}
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
          <ModalHeader textAlign="center">{t("titles.scanQrCode")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {qrUri && (
              <Flex direction="column" align="center" gap={4}>
                {qrUri ? (
                  <Box mb={4} bgColor="#FFFFFF" p={4}>
                    <QRCodeSVG value={qrUri} size={128} />
                  </Box>
                ) : (
                  <p>"QR code is not available"</p>
                )}
                <form
                  onSubmit={handleSubmit(handleVerifyTotp)}
                  style={{ width: "100%" }}
                >
                  <Flex direction="column" align="center" gap={4}>
                    <Input
                      maxLength={6}
                      textAlign="center"
                      placeholder={t("forms.enterTotp")}
                      {...register("token", {
                        required: t("required.totpRequired"),
                      })}
                      w="150px"
                      onChange={handleTokenChange}
                    />
                    <Button
                      variant="primary"
                      type="submit"
                      isLoading={verifyTotpMutation.isPending}
                      isDisabled={isDisabled}
                    >
                      {t("buttons.verifyTotp")}
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

// eslint-disable-next-line react-refresh/only-export-components
export default TOTP;
