import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Text,
  Tooltip,
  Divider,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import {
  type ApiError,
  ServiceConfig,
  ServicesService,
  AlertConfigCreate,
} from "../../client";

interface AlertNotificationTemplateProps {
  service: ServiceConfig;
}

const AlertNotificationTemplate = ({
  service,
}: AlertNotificationTemplateProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<AlertConfigCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: service.alert_config ?? {
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
    },
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
    <Box as="form" height={100} onSubmit={handleSubmit(onSubmit)}>
      <Flex>
        {/* Left Section */}
        <Box flex="1" mr={6}>
          {Object.keys(service.alert_config ?? {})
            .filter(
              (key) => !["alert_mail_body", "recovery_mail_body"].includes(key)
            )
            .map((key) => (
              <Flex key={key} mb={4} direction="column">
                <InputGroup>
                  <InputLeftAddon color="gray.600" bgColor="gray.400">
                    {t(`notifConfig.${key}`)}:
                    {["mail_to", "mail_cc"].includes(key) && (
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
                    )}
                  </InputLeftAddon>
                  <Input
                    flex="2"
                    isDisabled={!isDirty}
                    variant={
                      service.alert_config?.[key as keyof AlertConfigCreate]
                        ? "filled"
                        : "outline"
                    }
                    defaultValue={(service.alert_config as any)[key] || ""}
                    {...register(key as keyof AlertConfigCreate)}
                  />
                </InputGroup>
              </Flex>
            ))}
        </Box>
        <Divider orientation="vertical" />
        {/* Right Section as Accordion */}
        <Box flex="1">
          <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    {t("notifConfig.alert_mail_body")}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Input
                  as="textarea"
                  resize="none"
                  rows={10}
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
              <AccordionPanel pb={4}>
                <Input
                  as="textarea"
                  rows={10}
                  defaultValue={service.alert_config?.recovery_mail_body || ""}
                  {...register("recovery_mail_body")}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Flex>
      <Flex justify="flex-end" gap={4} mt={6}>
        <Button onClick={onCancel} variant="outline" isDisabled={!isDirty}>
          {t("buttons.reset")}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          isDisabled={!isDirty}
        >
          {t("buttons.save")}
        </Button>
      </Flex>
    </Box>
  );
};

export default AlertNotificationTemplate;
