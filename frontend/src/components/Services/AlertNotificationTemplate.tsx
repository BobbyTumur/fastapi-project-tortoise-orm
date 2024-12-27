import {
  Box,
  Button,
  Flex,
  Input,
  Tooltip,
  IconButton,
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
} from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

import useCustomToast from "../../hooks/useCustomToast";
import { emailPattern, handleError } from "../../utils";
import {
  type ApiError,
  ServiceConfig,
  ServicesService,
  AlertConfigCreate,
  UserPublic,
} from "../../client";

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

interface AlertNotificationTemplateProps {
  service: ServiceConfig;
}

const AlertNotificationTemplate = ({
  service,
}: AlertNotificationTemplateProps) => {
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
      <Box as="form" height="100vh" onSubmit={handleSubmit(onSubmit)}>
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
                    height="400px"
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
                    height="400px"
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
                      {t("notifConfig.extra_mail_body")}
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
                    height="400px"
                    defaultValue={service.alert_config?.extra_mail_body || ""}
                    {...register("extra_mail_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
          {/* Right Section */}
          <Box flex="0 0 50%" ml={6}>
            <Flex mb={4} direction="column">
              <InputGroup mb={4}>
                <InputLeftAddon>{t("notifConfig.mail_from")}:</InputLeftAddon>
                <Input
                  isInvalid={!!errors.mail_from}
                  flex="2"
                  isDisabled={isTier1}
                  defaultValue={service.alert_config?.mail_from || ""}
                  {...register("mail_from", { pattern: emailPattern })}
                />
                {errors.mail_from && (
                  <FormErrorMessage>
                    {errors.mail_from.message}
                  </FormErrorMessage>
                )}
              </InputGroup>
              <InputGroup mb={4}>
                <InputLeftAddon>
                  {t("notifConfig.mail_to")}:
                  <Tooltip
                    label="For multiple addresses, put comma and space in between"
                    fontSize="md"
                  >
                    <IconButton
                      icon={<LuInfo />}
                      aria-label="info"
                      variant="ghost"
                      size="xs"
                    />
                  </Tooltip>
                </InputLeftAddon>
                <Input
                  flex="2"
                  isDisabled={isTier1}
                  defaultValue={service.alert_config?.mail_to || ""}
                  {...register("mail_to")}
                />
              </InputGroup>
              <InputGroup mb={4}>
                <InputLeftAddon>
                  {t("notifConfig.mail_cc")}:
                  <Tooltip
                    label="For multiple addresses, put comma and space in between"
                    fontSize="md"
                  >
                    <IconButton
                      icon={<LuInfo />}
                      aria-label="info"
                      variant="ghost"
                      size="xs"
                    />
                  </Tooltip>
                </InputLeftAddon>
                <Input
                  flex="2"
                  isDisabled={isTier1}
                  defaultValue={service.alert_config?.mail_cc || ""}
                  {...register("mail_cc")}
                />
              </InputGroup>
              <InputGroup mb={4}>
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
              <InputGroup mb={4}>
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
              <InputGroup mb={4}>
                <InputLeftAddon>
                  {t("notifConfig.extra_mail_to")}:
                  <Tooltip
                    label="For multiple addresses, put comma and space in between"
                    fontSize="md"
                  >
                    <IconButton
                      icon={<LuInfo />}
                      aria-label="info"
                      variant="ghost"
                      size="xs"
                    />
                  </Tooltip>
                </InputLeftAddon>
                <Input
                  flex="2"
                  isDisabled={isTier1}
                  defaultValue={service.alert_config?.extra_mail_to || ""}
                  {...register("extra_mail_to")}
                />
              </InputGroup>
              <Tabs mt={4}>
                <TabList>
                  <Tab>{t("notifConfig.teams_link")}</Tab>
                  <Tab>{t("notifConfig.slack_link")}</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Textarea
                      isDisabled={isTier1}
                      spellCheck={false}
                      resize="none"
                      height="200px"
                      variant={
                        service.alert_config?.slack_link ? "filled" : "outline"
                      }
                      defaultValue={service.alert_config?.slack_link || ""}
                      {...register("slack_link")}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Textarea
                      isDisabled={isTier1}
                      spellCheck={false}
                      resize="none"
                      variant={
                        service.alert_config?.teams_link ? "filled" : "outline"
                      }
                      defaultValue={service.alert_config?.teams_link || ""}
                      {...register("teams_link")}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
              <Flex justify="flex-end" gap={4} mt={6}>
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

export default AlertNotificationTemplate;
