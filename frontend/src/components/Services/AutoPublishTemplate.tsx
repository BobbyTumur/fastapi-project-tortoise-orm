import {
  Box,
  Button,
  Flex,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  InputLeftAddon,
  Textarea,
  Checkbox,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

import { handleError } from "../../utils";
import {
  type ApiError,
  ServiceConfig,
  ServicesService,
  UserPublic,
  PublishConfigCreate,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

const defaultValues = {
  alert_publish_title: null,
  alert_publish_body: null,
  show_influenced_user: false,
  send_mail: false,
};

interface AutoPublishTemplateProps {
  service: ServiceConfig;
}

const AutoPublishTemplate = ({ service }: AutoPublishTemplateProps) => {
  const { t } = useTranslation();
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const isTier1 = currentUser
    ? !currentUser.is_superuser && !currentUser.can_edit
    : false;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<PublishConfigCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: service.publish_config || defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: PublishConfigCreate) =>
      ServicesService.updateServicePublishConfig({
        serviceId: service.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.templateUpdated"), "success");
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentService"] });
    },
  });

  const onSubmit: SubmitHandler<PublishConfigCreate> = async (data) => {
    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, value]) => value !== null && value !== ""
      )
    );
    mutation.mutate(sanitizedData);
  };

  const onCancel = () => {
    reset();
  };

  return (
    <>
      <Box
        as="form"
        height="80vh"
        onSubmit={handleSubmit(onSubmit)}
        overflow={"hidden"}
      >
        <Flex flexDirection={{ base: "column", md: "row" }} gap={6}>
          {/* Left Section */}
          <Box flex="1">
            <Accordion height="vh" allowToggle defaultIndex={0}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {t("publishConfig.alertPublishBody")}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <Textarea
                    isDisabled={isTier1}
                    spellCheck={false}
                    resize="none"
                    variant="filled"
                    height="550px"
                    {...register("alert_publish_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
          {/* Right Section */}
          <Box flex="1">
            <Flex mb={4} direction="column">
              <InputGroup mt={4}>
                <InputLeftAddon>
                  {t("publishConfig.alertPublishTitle")}:
                </InputLeftAddon>
                <Input
                  flex="2"
                  spellCheck="false"
                  isDisabled={isTier1}
                  {...register("alert_publish_title")}
                />
              </InputGroup>
              <Flex flexDirection="column" gap={4} mt={4}>
                <Checkbox
                  pt={2}
                  {...register("show_influenced_user")}
                  colorScheme="teal"
                  isDisabled={isTier1}
                  defaultChecked={
                    service.publish_config?.show_influenced_user || false
                  }
                >
                  {t("publishConfig.showInfluencedUser")}
                </Checkbox>
                <Checkbox
                  {...register("send_mail")}
                  colorScheme="teal"
                  isDisabled={isTier1}
                  defaultChecked={service.publish_config?.send_mail || false}
                >
                  {t("publishConfig.sendEmail")}
                </Checkbox>
              </Flex>
              <Flex justify="flex-end" gap={4} mt={4}>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  isDisabled={!isDirty || isTier1}
                >
                  {t("buttons.reset")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  isDisabled={!isDirty || isTier1}
                >
                  {t("buttons.save")}
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default AutoPublishTemplate;
