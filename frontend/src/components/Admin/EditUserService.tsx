import { useEffect } from "react";
import {
  Button,
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
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { type ApiError, UsersService, ServicesService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import CheckboxWithControl from "../Common/CheckboxWithControl";
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
  });

  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => ServicesService.readAllServices(),
  });

  const isLoading = isUserServicesLoading || isServicesLoading;

  const { handleSubmit, reset, setValue, control, watch } = useForm<{
    added_services: number[];
  }>({
    mode: "onBlur",
    defaultValues: { added_services: [] },
  });

  useEffect(() => {
    if (isOpen && userServices) {
      reset({
        added_services: userServices.map((service) => service.id),
      });
    }
  }, [isOpen, userServices, reset]);

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
  const hasChanges = () => {
    if (!userServices) return false;
    const originalServices = userServices.map((service) => service.id).sort();
    const currentServices = watch("added_services").sort();
    return JSON.stringify(originalServices) !== JSON.stringify(currentServices);
  };

  const onSubmit = (data: { added_services: number[] }) =>
    mutation.mutate(data);

  const onCancel = () => {
    if (userServices) {
      reset({
        added_services: userServices.map((service) => service.id),
      });
    }
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
            <Flex justifyContent="center" alignItems="center" height="100%">
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Flex direction="column" gap={4}>
              {services?.data?.map((service) => (
                <CheckboxWithControl
                  key={service.id}
                  service={service}
                  control={control}
                  setValue={setValue}
                />
              )) || <p>{t("loading.noServices")}</p>}
            </Flex>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="primary" type="submit" isDisabled={!hasChanges()}>
            {t("common.save2")}
          </Button>
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditUserService;
