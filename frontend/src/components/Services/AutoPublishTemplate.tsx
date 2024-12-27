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
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Textarea,
  FormErrorMessage,
  FormControl,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

import useCustomToast from "../../hooks/useCustomToast";
import {
  emailPattern,
  handleError,
  multiEmailPattern,
  webhookPattern,
} from "../../utils";
import {
  type ApiError,
  ServiceConfig,
  ServicesService,
  AlertConfigCreate,
  UserPublic,
} from "../../client";
import InfoTooltip from "../Common/InfoToolTip";

const defaultValues = {
  mail_from: "",
  mail_cc: "",
  mail_to: "",
  alert_mail_title: "",
  alert_mail_body: "",
  recovery_mail_title: "",
  recovery_mail_body: "",
  extra_mail_to: "",
  extra_mail_body: "",
  slack_link: "",
  teams_link: "",
};

interface AutoPublishTemplateProps {
  service: ServiceConfig;
}

const AutoPublishTemplate = ({ service }: AutoPublishTemplateProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const showToast = useCustomToast();
  const isTier1 = currentUser
    ? !currentUser.is_superuser && !currentUser.can_edit
    : false;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AlertConfigCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: AlertConfigCreate) =>
      ServicesService.updateServiceConfig({
        serviceId: service.id,
        requestBody: data,
      }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.passwordUpdate"), "success");
      reset();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentService"] });
    },
  });

  const onSubmit: SubmitHandler<AlertConfigCreate> = async (data) => {
    mutation.mutate(data);
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
        <Flex mt={4}>
          {/* Left Section */}
          <Box flex="1" mr={6}>
            <Accordion height="vh">
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {t("notifConfig.alert_mail_body")}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} height="vh">
                  <Textarea
                    isDisabled={isTier1}
                    resize="none"
                    height="500px"
                    defaultValue={service.alert_config?.alert_mail_body || ""}
                    {...register("alert_mail_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {t("notifConfig.recovery_mail_body")}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} height="vh">
                  <Input
                    isDisabled={isTier1}
                    as="textarea"
                    resize="none"
                    spellCheck={false}
                    height="500px"
                    defaultValue={
                      service.alert_config?.recovery_mail_body || ""
                    }
                    {...register("recovery_mail_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {t("notifConfig.extra_mail_body")}{" "}
                      <InfoTooltip label={t("infos.extraMailBody")} />
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} height="vh">
                  <Input
                    isDisabled={isTier1}
                    as="textarea"
                    spellCheck={false}
                    resize="none"
                    height="500px"
                    defaultValue={service.alert_config?.extra_mail_body || ""}
                    {...register("extra_mail_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
          {/* Right Section */}
          <Box flex="0 0 50%" ml={6} mr={2}>
            <Flex mb={4} direction="column">
              <FormControl isInvalid={!!errors.mail_from}>
                <InputGroup>
                  <InputLeftAddon>{t("notifConfig.mail_from")}:</InputLeftAddon>
                  <Input
                    flex="2"
                    isDisabled={isTier1}
                    defaultValue={service.alert_config?.mail_from || ""}
                    {...register("mail_from", { pattern: emailPattern })}
                  />
                </InputGroup>
                {errors.mail_from && (
                  <FormErrorMessage>
                    {errors.mail_from.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.mail_to}>
                <InputGroup mt={4}>
                  <InputLeftAddon>
                    {t("notifConfig.mail_to")}:
                    <InfoTooltip label={t("infos.multipleAddresses")} />
                  </InputLeftAddon>
                  <Input
                    flex="2"
                    isDisabled={isTier1}
                    defaultValue={service.alert_config?.mail_to || ""}
                    {...register("mail_to", { pattern: multiEmailPattern })}
                  />
                </InputGroup>
                {errors.mail_to && (
                  <FormErrorMessage>{errors.mail_to.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.mail_cc}>
                <InputGroup mt={4}>
                  <InputLeftAddon>
                    {t("notifConfig.mail_cc")}:
                    <InfoTooltip label={t("infos.multipleAddresses")} />
                  </InputLeftAddon>
                  <Input
                    flex="2"
                    isDisabled={isTier1}
                    defaultValue={service.alert_config?.mail_cc || ""}
                    {...register("mail_cc", { pattern: multiEmailPattern })}
                  />
                </InputGroup>
                {errors.mail_cc && (
                  <FormErrorMessage>{errors.mail_cc.message}</FormErrorMessage>
                )}
              </FormControl>

              <InputGroup mt={4}>
                <InputLeftAddon>
                  {t("notifConfig.alert_mail_title")}:
                </InputLeftAddon>
                <Input
                  flex="2"
                  isDisabled={isTier1}
                  defaultValue={service.alert_config?.alert_mail_title || ""}
                  {...register("alert_mail_title")}
                />
              </InputGroup>
              <InputGroup mt={4}>
                <InputLeftAddon>
                  {t("notifConfig.recovery_mail_title")}:
                </InputLeftAddon>
                <Input
                  flex="2"
                  isDisabled={isTier1}
                  defaultValue={service.alert_config?.recovery_mail_title || ""}
                  {...register("recovery_mail_title")}
                />
              </InputGroup>

              <FormControl isInvalid={!!errors.extra_mail_to}>
                <InputGroup mt={4}>
                  <InputLeftAddon>
                    {t("notifConfig.extra_mail_to")}:
                    <InfoTooltip label={t("infos.extraMailTo")} />
                  </InputLeftAddon>
                  <Input
                    flex="2"
                    isDisabled={isTier1}
                    defaultValue={service.alert_config?.extra_mail_to || ""}
                    {...register("extra_mail_to", {
                      pattern: multiEmailPattern,
                    })}
                  />
                </InputGroup>
                {errors.extra_mail_to && (
                  <FormErrorMessage>
                    {errors.extra_mail_to.message}
                  </FormErrorMessage>
                )}
              </FormControl>

              <Tabs mt={4}>
                <TabList>
                  <Tab>{t("notifConfig.teams_link")}</Tab>
                  <Tab>{t("notifConfig.slack_link")}</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <FormControl isInvalid={!!errors.teams_link}>
                      <Textarea
                        isDisabled={isTier1}
                        spellCheck={false}
                        resize="none"
                        height="150px"
                        variant={
                          service.alert_config?.teams_link
                            ? "filled"
                            : "outline"
                        }
                        defaultValue={service.alert_config?.teams_link || ""}
                        {...register("teams_link", { pattern: webhookPattern })}
                      />
                      {errors.teams_link && (
                        <FormErrorMessage>
                          {errors.teams_link.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </TabPanel>
                  <TabPanel>
                    <FormControl isInvalid={!!errors.slack_link}>
                      <Textarea
                        isDisabled={isTier1}
                        spellCheck={false}
                        resize="none"
                        height="150px"
                        variant={
                          service.alert_config?.slack_link
                            ? "filled"
                            : "outline"
                        }
                        defaultValue={service.alert_config?.slack_link || ""}
                        {...register("slack_link", { pattern: webhookPattern })}
                      />
                      {errors.slack_link && (
                        <FormErrorMessage>
                          {errors.slack_link.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </TabPanel>
                </TabPanels>
              </Tabs>
              <Flex
                justify="flex-end"
                gap={4}
                position="fixed"
                bottom="40px" // Adjust the distance from the bottom as needed
                right="20px"
              >
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
