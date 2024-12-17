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

// Extend UserUpdate with role
interface UserUpdateWithRole extends UserUpdate {
  role: string; // Add the role field
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
    reset,
    setValue,
    formState: { isSubmitting, isDirty },
    trigger, // Use trigger to manually trigger form validation
  } = useForm<UserUpdateWithRole>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { ...user, role }, // Include role in defaultValues
  });

  const mutation = useMutation({
    mutationFn: (data: UserUpdateWithRole) =>
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

  const onSubmit: SubmitHandler<UserUpdateWithRole> = async (data) => {
    const finalData = {
      ...data,
      is_superuser: role === "admin",
      can_edit: role === "tier2",
    };
    mutation.mutate(finalData);
  };

  const onCancel = () => {
    reset();
    onClose();
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value;
    setRole(newRole);
    setValue("role", newRole, { shouldDirty: true }); // Mark field as dirty
    trigger("role"); // Manually trigger form validation
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
              {t("common.save2")}
            </Button>
            <Button onClick={onCancel}>{t("common.cancel")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditUser;
