import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import {
  type ApiError,
  ServiceConfig,
  ServicesService,
  ConfigPublic,
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
  const [selectedBody, setSelectedBody] = useState<"alert" | "recovery">(
    "alert"
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ConfigPublic>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: service.config ?? {
      mail_from: null,
      mail_cc: null,
      mail_to: null,
      alert_mail_title: null,
      recovery_mail_title: null,
      alert_mail_body: null,
      recovery_mail_body: null,
      slack_link: null,
      teams_link: null,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ConfigPublic) =>
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
      queryClient.invalidateQueries({ queryKey: ["currentServiceConfig"] });
    },
  });

  const onSubmit: SubmitHandler<ConfigPublic> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      bg={useColorModeValue("white", "gray.800")}
      p={6}
      borderRadius="md"
      boxShadow="md"
    >
      <Heading as="h2" size="md" mb={4}>
        {t("serviceConfig.title")}
      </Heading>
      <Flex gap={6}>
        {/* Left Section */}
        <Box flex="1">
          {Object.keys(service.config ?? {})
            .filter(
              (key) => !["alert_mail_body", "recovery_mail_body"].includes(key)
            )
            .map((key) => (
              <Flex key={key} mb={4} align="center">
                <Text flex="1" fontWeight="bold">
                  {t(`serviceConfig.fields.${key}`)}
                </Text>
                <Input
                  flex="2"
                  defaultValue={(service.config as any)[key] || ""}
                  {...register(key as keyof ConfigPublic)}
                />
              </Flex>
            ))}
        </Box>

        {/* Right Section */}
        <Box flex="1">
          <Flex mb={4} align="center">
            <Text flex="1" fontWeight="bold">
              {t("serviceConfig.selectMailBody")}
            </Text>
            <Select
              flex="2"
              value={selectedBody}
              onChange={(e) =>
                setSelectedBody(e.target.value as "alert" | "recovery")
              }
            >
              <option value="alert">
                {t("serviceConfig.fields.alert_mail_body")}
              </option>
              <option value="recovery">
                {t("serviceConfig.fields.recovery_mail_body")}
              </option>
            </Select>
          </Flex>
          <Input
            as="textarea"
            rows={10}
            defaultValue={
              selectedBody === "alert"
                ? service.config?.alert_mail_body || ""
                : service.config?.recovery_mail_body || ""
            }
            {...register(
              selectedBody === "alert"
                ? "alert_mail_body"
                : "recovery_mail_body"
            )}
          />
        </Box>
      </Flex>
      <Flex justify="flex-end" gap={4} mt={6}>
        <Button onClick={onCancel} variant="outline" colorScheme="gray">
          {t("form.cancel")}
        </Button>
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          isDisabled={!isDirty}
        >
          {t("form.save")}
        </Button>
      </Flex>
    </Box>
  );
};

export default AlertNotificationTemplate;
