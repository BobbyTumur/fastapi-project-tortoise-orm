import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { type SubmitHandler, useForm } from "react-hook-form";

import useCustomToast from "../../hooks/useCustomToast";
import { type ApiError, type UpdatePassword, UsersService } from "../../client";
import { confirmPasswordRules, handleError, passwordRules } from "../../utils";

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string;
}

const ChangePassword = () => {
  const { t } = useTranslation();
  const color = useColorModeValue("inherit", "ui.light");
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
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
  // Watch form fields
  const currentPassword = watch("current_password");
  const newPassword = watch("new_password");
  const confirmPassword = watch("confirm_password");

  // Disable logic for the submit button
  const isButtonDisabled =
    !currentPassword || // Current password is empty
    newPassword.length < 8 || // New password is less than 8 characters
    confirmPassword !== newPassword;

  return (
    <>
      <Container maxW="full">
        <Box
          w={{ sm: "full", md: "50%" }}
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormControl isRequired isInvalid={!!errors.current_password}>
            <FormLabel color={color} htmlFor="current_password">
              {t("forms.currentPassword")}
            </FormLabel>
            <Input
              id="current_password"
              {...register("current_password")}
              placeholder={t("common.password")}
              type="password"
              w="auto"
            />
            {errors.current_password && (
              <FormErrorMessage>
                {errors.current_password.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.new_password}>
            <FormLabel htmlFor="password">{t("forms.setPassword")}</FormLabel>
            <Input
              id="password"
              {...register("new_password", passwordRules())}
              placeholder={t("common.password")}
              type="password"
              w="auto"
            />
            {errors.new_password && (
              <FormErrorMessage>{errors.new_password.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl mt={4} isRequired isInvalid={!!errors.confirm_password}>
            <FormLabel htmlFor="confirm_password">
              {t("forms.confirmPassword")}
            </FormLabel>
            <Input
              id="confirm_password"
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder={t("common.password")}
              type="password"
              w="auto"
            />
            {errors.confirm_password && (
              <FormErrorMessage>
                {errors.confirm_password.message}
              </FormErrorMessage>
            )}
          </FormControl>
          <Button
            variant="primary"
            mt={4}
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isButtonDisabled}
          >
            {t("common.save2")}
          </Button>
        </Box>
      </Container>
    </>
  );
};
export default ChangePassword;
