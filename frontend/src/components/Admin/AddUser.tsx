import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { type UserRegister, UsersService } from "../../client";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
import { emailPattern, handleError } from "../../utils";

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUser = ({ isOpen, onClose }: AddUserProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [role, setRole] = useState<string>("tier1");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserRegister>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      username: "",
      is_superuser: false,
      is_active: true,
      can_edit: false,
      is_totp_enabled: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      showToast(
        t("toast.userCreateSuccess"),
        t("toast.userCreated"),
        "success"
      );
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsSubmittingLocal(false);
    },
  });

  const onSubmit: SubmitHandler<UserRegister> = (data) => {
    setIsSubmittingLocal(true);
    const finalData = {
      ...data,
      is_superuser: role === "admin",
      can_edit: role === "tier2",
    };
    mutation.mutate(finalData);
  };
  const onCancel = () => {
    onClose();
    setTimeout(() => {
      reset();
    }, 1000);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(event.target.value);
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
          <ModalHeader>{t("titles.addUser")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">{t("common.email")}</FormLabel>
              <Input
                id="email"
                {...register("email", {
                  required: t("forms.emailRequired"),
                  pattern: emailPattern,
                })}
                placeholder={t("common.email")}
                type="email"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.username}>
              <FormLabel htmlFor="name">{t("common.username")}</FormLabel>
              <Input
                id="name"
                {...register("username", {
                  required: t("forms.usernameRequired"),
                })}
                placeholder={t("common.username")}
                type="text"
              />
              {errors.username && (
                <FormErrorMessage>{errors.username.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="role">{t("common.role")}</FormLabel>
              <Select id="role" value={role || ""} onChange={handleRoleChange}>
                <option value="admin">Admin</option>
                <option value="tier2">Tier1</option>
                <option value="tier1">Tier2</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmittingLocal}
              isDisabled={!isDirty}
            >
              {t("common.save1")}
            </Button>
            <Button onClick={onCancel}>{t("common.cancel")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddUser;
