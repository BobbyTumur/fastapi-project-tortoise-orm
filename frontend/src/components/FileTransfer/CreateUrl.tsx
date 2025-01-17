import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  useClipboard,
  Box,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { type PromptUrl, FileTransferService } from "../../client";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import { useState } from "react";

interface CreateUrlProps {
  isOpen: boolean;
  onClose: () => void;
  fileKey?: string;
  type: "download" | "upload";
}
const CreateUrl = ({ type, fileKey, isOpen, onClose }: CreateUrlProps) => {
  const { t } = useTranslation();
  const { onCopy, value, setValue, hasCopied } = useClipboard("");
  const [success, setSuccess] = useState<boolean>(false);
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PromptUrl>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      company_name: "",
      expiry_hours: 1,
      type: type,
      file_name: fileKey || null,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PromptUrl) =>
      FileTransferService.generateUrl({ requestBody: data }),
    onSuccess: (response) => {
      showToast(t("toast.success"), t("toast.urlCreated"), "success");
      setSuccess(true);
      setValue(
        `username: ${response.username}\npassword: ${response.password}\nurl: ${response.url}`
      );
      reset();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });

  const onSubmit: SubmitHandler<PromptUrl> = (data) => {
    mutation.mutate(data);
  };
  const onCancel = () => {
    onClose();
    setSuccess(false);
    setTimeout(() => {
      reset();
    }, 1000);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {t(`common.${type}`)} {t("modal.createUrl")}
          </ModalHeader>
          <ModalCloseButton />
          {success ? (
            <>
              <ModalBody>
                <Box
                  as="pre"
                  whiteSpace="pre-wrap"
                  wordBreak="break-word"
                  p={4}
                  borderRadius="md"
                  fontSize="sm"
                  fontFamily="monospace"
                >
                  {value}
                </Box>
              </ModalBody>
              <ModalFooter gap={3} alignItems={"center"}>
                <Button variant="primary" onClick={onCopy}>
                  {hasCopied ? "Copied!" : "Copy"}
                </Button>
                <Button onClick={onCancel}>{t("buttons.close")}</Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalBody pb={6}>
                {fileKey && (
                  <Text pb={4}>
                    {t("common.file")}: {fileKey.split("/").pop()}
                  </Text>
                )}
                <FormControl isRequired isInvalid={!!errors.company_name}>
                  <FormLabel htmlFor="companyName">
                    {t("forms.companyName")}
                  </FormLabel>
                  <Input
                    id="companyName"
                    spellCheck="false"
                    {...register("company_name", {
                      required: t("required.companyName"),
                    })}
                    placeholder={t("forms.companyName")}
                    type="text"
                  />
                  {errors.company_name && (
                    <FormErrorMessage>
                      {errors.company_name.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel htmlFor="expiryHours">
                    {t("forms.expiryDuration")}
                  </FormLabel>
                  <Flex gap={4} alignItems={"center"}>
                    <NumberInput min={1} max={50} maxW={20}>
                      <NumberInputField
                        id="expiryHours"
                        {...register("expiry_hours")}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text>{t("common.hour")}</Text>
                  </Flex>
                </FormControl>
              </ModalBody>
              <ModalFooter gap={3} alignItems={"center"}>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  isDisabled={!isDirty}
                >
                  {t("buttons.create")}
                </Button>
                <Button onClick={onCancel}>{t("buttons.cancel")}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateUrl;
