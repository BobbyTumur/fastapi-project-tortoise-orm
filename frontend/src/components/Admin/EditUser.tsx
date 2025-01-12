import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  type ApiError,
  type UserPublic,
  type UserUpdate,
  UsersService,
} from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface EditUserProps {
  user: UserPublic;
  isOpen: boolean;
  onClose: () => void;
}

const EditUser = ({ user, isOpen, onClose }: EditUserProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const { t } = useTranslation();
  const [role, setRole] = useState<string>(
    user.is_superuser ? "admin" : user.can_edit ? "tier2" : "tier1"
  );
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UserUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { ...user },
  });

  const mutation = useMutation({
    mutationFn: (data: UserUpdate) =>
      UsersService.updateUser({ userId: user.id, requestBody: data }),
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

  const onSubmit: SubmitHandler<UserUpdate> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    onClose();
    setRole(user.is_superuser ? "admin" : user.can_edit ? "tier2" : "tier1");
    setTimeout(() => {
      reset();
    }, 1000);
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value;
    setRole(newRole);

    if (newRole === "admin") {
      setValue("is_superuser", true, { shouldDirty: true });
      setValue("can_edit", false, { shouldDirty: true });
    } else if (newRole === "tier2") {
      setValue("is_superuser", false, { shouldDirty: true });
      setValue("can_edit", true, { shouldDirty: true });
    } else {
      setValue("is_superuser", false, { shouldDirty: true });
      setValue("can_edit", false, { shouldDirty: true });
    }
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
          <ModalHeader>{t("titles.editUser")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel htmlFor="name">{t("common.username")}</FormLabel>
              <Input
                id="name"
                {...register("username")}
                type="text"
                spellCheck="false"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="role">{t("common.role")}</FormLabel>
              <Select id="role" value={role} onChange={handleRoleChange}>
                <option value="admin">Admin</option>
                <option value="tier2">Tier2</option>
                <option value="tier1">Tier1</option>
              </Select>
            </FormControl>
            <Flex mt={4}>
              <FormControl ml={4}>
                <Checkbox {...register("is_active")} colorScheme="teal">
                  {t("forms.isActive")}
                </Checkbox>
              </FormControl>
            </Flex>
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
    </>
  );
};

export default EditUser;
