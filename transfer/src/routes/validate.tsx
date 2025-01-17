import { Button, Container, Fieldset, Input, Stack } from "@chakra-ui/react";

import {
  // Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

import useAuth from "../hooks/useAuth";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  type Body_file_transfer___login_access_token as AccessToken,
  FileTransferService,
} from "../client";
import { Field } from "../components/ui/field";

export const Route = createFileRoute("/validate")({
  component: Validate,
  beforeLoad: async () => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      throw redirect({
        to: "/invalid-url",
      });
    }

    try {
      const response = await FileTransferService.validateUrlRoute({ token });
      if (!response) {
        throw redirect({
          to: "/invalid-url",
        });
      }
      return true;
    } catch (error) {
      if (isRedirectError(error)) {
        throw error; // Re-throw redirect errors
      }
      console.error("Unexpected error during validation:", error);
      throw redirect({
        to: "/error",
      });
    }
  },
});

function isRedirectError(error: unknown): error is { isRedirect: boolean } {
  return typeof error === "object" && error !== null && "isRedirect" in error;
}

function Validate() {
  const { loginMutation, error, resetError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return;

    resetError();

    try {
      await loginMutation.mutateAsync(data);
    } catch {
      // error is handled by useAuth hook
    }
  };

  return (
    <>
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        gap={4}
        centerContent
      >
        <Fieldset.Root size="lg" maxW="md">
          <Stack>
            <Fieldset.Legend textAlign={"center"}>
              アップロードツール
            </Fieldset.Legend>
            <Fieldset.HelperText mb={4} textAlign={"center"}>
              お送りしたログイン情報を入力してください。
            </Fieldset.HelperText>
          </Stack>
          <Fieldset.Content>
            <Field id="username">
              <Input
                {...register("username")}
                placeholder="ユーザー名"
                type="password"
              />
            </Field>
            <Field id="password">
              <Input
                {...register("password")}
                placeholder="パスワード"
                type="password"
              />
            </Field>
            {error && <Field invalid errorText={error}></Field>}
          </Fieldset.Content>
          <Button type="submit" disabled={isSubmitting}>
            ログイン
          </Button>
        </Fieldset.Root>
      </Container>
    </>
  );
}
