import {
  Box,
  Divider,
  Heading,
  SimpleGrid,
  Avatar,
  Text,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { ServiceConfig, ServicesService, Usernames } from "../../client";

interface InfoAndQuickEditProps {
  service: ServiceConfig;
}

const InfoAndQuickEdit = ({ service }: InfoAndQuickEditProps) => {
  const { t } = useTranslation();
  const { data: serviceUsers, isLoading } = useQuery<Usernames>({
    queryKey: ["serviceUsers", service.id],
    queryFn: () => ServicesService.getServiceUsers({ serviceId: service.id }),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
  });

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.passwordUpdate"), "success");
      reset();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Flex width="100%" height="auto">
      {/* First part */}
      <Box flex="0 0 30%" p={4}>
        <Heading size="md">{t("Service Title 1")}</Heading>
        {/* Checkboxs with texts */}
      </Box>

      <Divider orientation="vertical" height="auto" />

      {/* Second part */}
      <Box flex="0 0 30%" p={4}>
        <Heading size="md">{t("Service Title 2")}</Heading>
        {/* Checkboxs with texts */}
      </Box>

      {/* Third part - Grid of avatars and usernames */}
      <Box flex="1" p={4}>
        <Heading size="md">{t("Users")}</Heading>

        {isLoading ? (
          <Spinner size="xl" />
        ) : (
          <SimpleGrid columns={5} spacing={4}>
            {serviceUsers?.usernames?.map((username, index) => (
              <Box key={index} textAlign="center">
                <Avatar />
                <Text mt={2}>{username}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Flex>
  );
};

export default InfoAndQuickEdit;
