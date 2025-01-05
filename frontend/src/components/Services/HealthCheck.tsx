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
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  type ApiError,
  type ServicePublic,
  UserPublic,
  UtilsService,
  UtilsTestEmailData,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface HealthCheckProps {
  service: ServicePublic;
  isOpen: boolean;
  onClose: () => void;
}

const HealthCheck = ({ service, isOpen, onClose }: HealthCheckProps) => {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const [isChecked, setIsChecked] = useState(false);
  const showToast = useCustomToast();
  const { t } = useTranslation();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UtilsTestEmailData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { emailTo: currentUser?.email },
  });

  const mutation = useMutation({
    mutationFn: (data: UtilsTestEmailData) =>
      UtilsService.testEmail({ emailTo: data.emailTo }),
    onSuccess: () => {
      showToast(t("toast.success"), t("toast.healthCheck"), "success");
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
  });

  const onSubmit: SubmitHandler<UtilsTestEmailData> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    onClose();
    setTimeout(() => {
      setIsChecked(false);
    }, 1000);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked); // Update checkbox state
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {service.name}: {service.sub_name} {t("common.healthCheck")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {t(`healthCheck.warning.${service.name}`)}
            <Flex mt={4}>
              <Checkbox
                colorScheme="teal"
                isChecked={isChecked}
                onChange={handleCheckboxChange} // Handle checkbox change
              >
                {t("healthCheck.agree")}
              </Checkbox>
            </Flex>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!isChecked}
            >
              {t("buttons.execute")}
            </Button>
            <Button onClick={onCancel}>{t("common.cancel")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HealthCheck;
