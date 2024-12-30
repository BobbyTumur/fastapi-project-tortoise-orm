import {
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  type ApiError,
  ServicesService,
  UserPublic,
  UsersServicesService,
  UserUpdateServices,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface EditUserServicesProps {
  user: UserPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditUserService = ({ user, isOpen, onClose }: EditUserServicesProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const { t } = useTranslation();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => ServicesService.getServices(),
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { isDirty, isSubmitting },
  } = useForm<UserUpdateServices>({
    mode: "onBlur",
    defaultValues: {
      added_services: user?.services?.map((service) => service.id) || [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserUpdateServices) =>
      UsersServicesService.addServicesToUser({
        requestBody: data,
        userId: user.id,
      }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.userUpdate"), "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const onSubmit: SubmitHandler<UserUpdateServices> = async (data) =>
    mutation.mutate(data);

  const onCancel = () => {
    onClose();
    setTimeout(() => {
      reset();
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{t("titles.editUserService")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" height="100%">
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Flex direction="column" gap={4}>
              {services?.data?.map((service) => (
                <Checkbox
                  key={service.id}
                  colorScheme="teal"
                  value={service.id.toString()}
                  {...register("added_services")}
                >
                  {service.name}: {service.sub_name}
                </Checkbox>
              ))}
            </Flex>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isDirty}
          >
            {t("buttons.update")}
          </Button>
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditUserService;
