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
  Spacer,
  Checkbox,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

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
import useCustomToast from "../../hooks/useCustomToast";

const defaultValues = {
  has_extra_email: false,
  has_teams_slack: false,
  mail_from: null,
  mail_cc: null,
  mail_to: null,
  alert_mail_title: null,
  alert_mail_body: null,
  recovery_mail_title: null,
  recovery_mail_body: null,
  extra_mail_to: null,
  extra_mail_body: null,
  slack_link: null,
  teams_link: null,
};

interface AlertNotificationTemplateProps {
  service: ServiceConfig;
}

const AlertNotificationTemplate = ({
  service,
}: AlertNotificationTemplateProps) => {
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AlertConfigCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: service.alert_config || defaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: AlertConfigCreate) =>
      ServicesService.updateServiceAlertConfig({
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

  const onSubmit: SubmitHandler<AlertConfigCreate> = async (data) => {
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
        <Flex>
          {/* Left Section */}
          <Box flex="1" mr={6}>
            <Accordion height="vh" allowToggle defaultIndex={1}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {t("notifConfig.alertMailBody")}
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
                    // defaultValue={service.alert_config?.alert_mail_body || ""}
                    {...register("alert_mail_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      {t("notifConfig.recoveryMailBody")}
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
                    // defaultValue={
                    //   service.alert_config?.recovery_mail_body || ""
                    // }
                    {...register("recovery_mail_body")}
                  />
                </AccordionPanel>
              </AccordionItem>
              {service.alert_config?.has_extra_email && (
                <AccordionItem>
                  <h2>
                    <AccordionButton display="flex" flexDirection="row">
                      <Box as="span" textAlign="left" mr={2}>
                        {t("notifConfig.extraMailBody")}
                      </Box>
                      <InfoTooltip label={t("infos.extraMailBody")} />
                      <Spacer />
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
                      {...register("extra_mail_body")}
                    />
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
          </Box>
          {/* Right Section */}
          <Box flex="1" ml={6}>
            <Flex mb={4} direction="column">
              <FormControl isInvalid={!!errors.mail_from}>
                <InputGroup>
                  <InputLeftAddon>{t("notifConfig.mailFrom")}:</InputLeftAddon>
                  <Input
                    flex="2"
                    spellCheck="false"
                    isDisabled={isTier1}
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
                    {t("notifConfig.mailTo")}:
                    <InfoTooltip label={t("infos.multipleAddresses")} />
                  </InputLeftAddon>
                  <Input
                    flex="2"
                    spellCheck="false"
                    isDisabled={isTier1}
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
                    {t("notifConfig.mailCc")}:
                    <InfoTooltip label={t("infos.multipleAddresses")} />
                  </InputLeftAddon>
                  <Input
                    flex="2"
                    spellCheck="false"
                    isDisabled={isTier1}
                    {...register("mail_cc", { pattern: multiEmailPattern })}
                  />
                </InputGroup>
                {errors.mail_cc && (
                  <FormErrorMessage>{errors.mail_cc.message}</FormErrorMessage>
                )}
              </FormControl>

              <InputGroup mt={4}>
                <InputLeftAddon>
                  {t("notifConfig.alertMailTitle")}:
                </InputLeftAddon>
                <Input
                  flex="2"
                  spellCheck="false"
                  isDisabled={isTier1}
                  {...register("alert_mail_title")}
                />
              </InputGroup>
              <InputGroup mt={4}>
                <InputLeftAddon>
                  {t("notifConfig.recoveryMailTitle")}:
                </InputLeftAddon>
                <Input
                  flex="2"
                  spellCheck="false"
                  isDisabled={isTier1}
                  {...register("recovery_mail_title")}
                />
              </InputGroup>
              {service.alert_config?.has_extra_email && (
                <FormControl isInvalid={!!errors.extra_mail_to}>
                  <InputGroup mt={4}>
                    <InputLeftAddon>
                      {t("notifConfig.extraMailTo")}:
                      <InfoTooltip label={t("infos.extraMailTo")} />
                    </InputLeftAddon>
                    <Input
                      flex="2"
                      spellCheck="false"
                      isDisabled={isTier1}
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
              )}
              {service.alert_config?.has_teams_slack && (
                <Tabs variant="enclosed" mt={8}>
                  <TabList>
                    <Tab>{t("notifConfig.teamsLink")}</Tab>
                    <Tab>{t("notifConfig.slackLink")}</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <FormControl isInvalid={!!errors.teams_link}>
                        <Textarea
                          isDisabled={isTier1}
                          spellCheck={false}
                          resize="none"
                          height="100px"
                          variant="filled"
                          {...register("teams_link", {
                            pattern: webhookPattern,
                          })}
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
                          height="100px"
                          variant="filled"
                          {...register("slack_link", {
                            pattern: webhookPattern,
                          })}
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
              )}
              <Flex justify="flex-end" gap={4} mt={4}>
                {currentUser?.is_superuser && (
                  <>
                    <Checkbox
                      {...register("has_extra_email")}
                      colorScheme="teal"
                      isDisabled={isTier1}
                    >
                      {t("forms.hasExtraAddress")}
                    </Checkbox>
                    <Checkbox
                      {...register("has_teams_slack")}
                      colorScheme="teal"
                      isDisabled={isTier1}
                    >
                      {t("forms.hasTeamsAndSlack")}
                    </Checkbox>
                  </>
                )}
                <Spacer />
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
