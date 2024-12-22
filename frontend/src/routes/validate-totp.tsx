import {
  Container,
  FormControl,
  FormErrorMessage,
  PinInput,
  PinInputField,
  Flex,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { type TOTPToken } from "../client";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/validate-totp")({
  component: ValidateTotp,
});

function ValidateTotp() {
  const { t } = useTranslation();
  const { totpMutation, error, resetError } = useAuth();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<TOTPToken>({
    mode: "onBlur",
    defaultValues: { token: "" },
  });

  const onSubmit = async (data: TOTPToken) => {
    if (isSubmitting) return;

    resetError();

    try {
      await totpMutation.mutateAsync(data);
    } catch {
      // Error handled in hook
    }
  };

  const handlePinChange = (value: string) => {
    setValue("token", value); // Set the whole token value
  };

  const handlePinComplete = (value: string) => {
    setValue("token", value); // Set the value to the form
    handleSubmit(onSubmit)(); // Automatically submit the form
  };

  return (
    <Container
      as="form"
      maxW="sm"
      h="100vh"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <h2>{t("forms.enterTotp")}</h2>
      <FormControl isInvalid={!!errors.token || !!error}>
        <Flex justify="center" gap={1}>
          <PinInput
            type="number"
            otp
            placeholder=""
            onChange={handlePinChange}
            onComplete={handlePinComplete} // Trigger submission when all fields are filled
          >
            {[...Array(6)].map(() => (
              <PinInputField
                fontSize="2xl"
                textAlign="center"
                width="60px"
                height="60px"
              />
            ))}
          </PinInput>
        </Flex>
        {errors.token && (
          <FormErrorMessage>{errors.token.message}</FormErrorMessage>
        )}
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    </Container>
  );
}
