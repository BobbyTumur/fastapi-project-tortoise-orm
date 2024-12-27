import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Flex,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { type ServiceCreate, ServicesService } from "../../client";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface AddServiceProps {
  isOpen: boolean;
  onClose: () => void;
}
const AddService = ({ isOpen, onClose }: AddServiceProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ServiceCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      sub_name: "",
      has_extra_email: false,
      has_teams_slack: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceCreate) =>
      ServicesService.createService({ requestBody: data }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.serviceCreated"), "success");
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const onSubmit: SubmitHandler<ServiceCreate> = (data) => {
    mutation.mutate(data);
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
          <ModalHeader>{t("titles.addService")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">{t("services.name")}</FormLabel>
              <Input
                id="name"
                {...register("name", {
                  required: t("required.serviceName"),
                })}
                placeholder={t("services.name")}
                type="text"
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.sub_name}>
              <FormLabel htmlFor="name">{t("services.subName")}</FormLabel>
              <Input
                id="subName"
                {...register("sub_name", {
                  required: t("required.serviceSubName"),
                })}
                placeholder={t("services.subName")}
                type="text"
              />
              {errors.sub_name && (
                <FormErrorMessage>{errors.sub_name.message}</FormErrorMessage>
              )}
            </FormControl>
            <Flex mt={4} flexDirection="column">
              <FormControl m={1}>
                <Checkbox {...register("has_extra_email")} colorScheme="teal">
                  {t("forms.hasExtraAddress")}
                </Checkbox>
              </FormControl>
              <FormControl m={1}>
                <Checkbox {...register("has_teams_slack")} colorScheme="teal">
                  {t("forms.hasTeamsAndSlack")}
                </Checkbox>
              </FormControl>
            </Flex>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isDirty}
            >
              {t("buttons.register")}
            </Button>
            <Button onClick={onClose}>{t("buttons.cancel")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddService;
