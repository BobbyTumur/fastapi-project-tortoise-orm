import {
  Box,
  Divider,
  Heading,
  SimpleGrid,
  Avatar,
  Text,
  Spinner,
  Flex,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useCustomToast from "../../hooks/useCustomToast";
import {
  ApiError,
  ServiceConfig,
  ServicesService,
  ServiceUpdate,
  Usernames,
  UserPublic,
} from "../../client";
import { handleError } from "../../utils";

interface InfoAndQuickEditProps {
  service: ServiceConfig;
}

const InfoAndQuickEdit = ({ service }: InfoAndQuickEditProps) => {
  const { t } = useTranslation();
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const isTier1 = currentUser
    ? !currentUser.is_superuser && !currentUser.can_edit
    : false;
  const { data: serviceUsers, isLoading } = useQuery<Usernames>({
    queryKey: ["serviceUsers", service.id],
    queryFn: () => ServicesService.getServiceUsers({ serviceId: service.id }),
    staleTime: 1000 * 60 * 5,
  });
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<ServiceUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: service,
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceUpdate) =>
      ServicesService.updateService({
        requestBody: data,
        serviceId: service.id,
      }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.templateUpdated"), "success");
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentService"],
      });
    },
  });

  const onSubmit: SubmitHandler<ServiceUpdate> = async (data) => {
    mutation.mutate(data);
  };
  return (
    <Flex
      width="100%"
      height="60vh"
      gap={4}
      alignItems="center" /* Centers items vertically */
      paddingX={20}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        gap={6}
        alignItems="center"
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Checkbox
          {...register("has_alert_notification")}
          colorScheme="teal"
          isDisabled={isTier1}
        >
          <Heading size="sm">{t("titles.notification")}</Heading>
        </Checkbox>
        <Checkbox
          {...register("has_auto_publish")}
          colorScheme="teal"
          isDisabled={isTier1}
        >
          <Heading size="sm">{t("titles.publish")}</Heading>
        </Checkbox>
        <Button
          variant="primary"
          type="submit"
          isLoading={isSubmitting}
          isDisabled={!isDirty || isTier1}
        >
          {t("buttons.update")}
        </Button>
      </Box>
      <Divider orientation="vertical" h={300} />
      {/* Part 3 */}
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        gap={2}
        alignItems="center"
      >
        <Heading size="md" pb={4}>
          {t("titles.peopleWhoCanEdit")}
        </Heading>
        {isLoading ? (
          <Spinner size="xl" />
        ) : (
          <SimpleGrid columns={5} spacing={4} p={4}>
            {serviceUsers?.usernames?.map((username, index) => (
              <Box key={index} textAlign="center">
                <Avatar />
                <Text mt={2} fontSize={"sm"}>
                  {username.split(" ")[0]}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Flex>
  );
};

export default InfoAndQuickEdit;
