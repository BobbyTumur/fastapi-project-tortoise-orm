import React, { useEffect } from "react";
import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  type ApiError,
  type ServicePublic,
  UsersService,
  ServicesService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface EditUserServicesProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EditUserService = ({
  userId,
  isOpen,
  onClose,
}: EditUserServicesProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const { t } = useTranslation();

  const { data: userServices, isLoading: isUserServicesLoading } = useQuery({
    queryKey: ["userServices", userId],
    queryFn: () => UsersService.readUserServices({ userId }),
    enabled: isOpen,
  });

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => ServicesService.readAllServices(),
    enabled: isOpen,
  });

  const isLoading = isUserServicesLoading || isServicesLoading;

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { isSubmitting },
  } = useForm<{
    added_services: number[];
  }>({
    mode: "onBlur",
    defaultValues: { added_services: [] },
  });

  // Watch the added_services field
  const watchedServices = watch("added_services", []);

  // Calculate isFormDirty manually
  const isFormDirty = React.useMemo(() => {
    const originalServices = userServices?.map((service) => service.id) || [];
    return (
      JSON.stringify(originalServices.sort()) !==
      JSON.stringify(watchedServices.sort())
    );
  }, [userServices, watchedServices]);

  useEffect(() => {
    if (userServices) {
      setValue(
        "added_services",
        userServices.map((service) => service.id)
      );
    }
  }, [userServices, setValue]);

  const mutation = useMutation({
    mutationFn: (data: { added_services: number[] }) =>
      UsersService.updateUserService({ requestBody: data, userId }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.userUpdate"), "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userServices", userId] });
    },
  });

  const CheckboxWithControl = ({ service }: { service: ServicePublic }) => {
    const { field } = useController({
      control,
      name: "added_services",
      defaultValue: [],
    });

    const isChecked = (field.value as number[]).includes(service.id);

    return (
      <Checkbox
        id={`service-${service.id}`}
        isChecked={isChecked}
        onChange={() => {
          const currentIds = field.value as number[];
          setValue(
            "added_services",
            isChecked
              ? currentIds.filter((id) => id !== service.id)
              : [...currentIds, service.id]
          );
        }}
      >
        {service.name}
      </Checkbox>
    );
  };

  const onSubmit = (data: { added_services: number[] }) =>
    mutation.mutate(data);

  const onCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{t("titles.editUserService")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <p>{t("loading.services")}</p>
          ) : (
            <Flex direction="column" gap={4}>
              <FormControl>
                {services?.data?.map((service) => (
                  <CheckboxWithControl key={service.id} service={service} />
                )) || <p>{t("loading.noServices")}</p>}
              </FormControl>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isFormDirty}
          >
            {t("common.save2")}
          </Button>
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditUserService;
