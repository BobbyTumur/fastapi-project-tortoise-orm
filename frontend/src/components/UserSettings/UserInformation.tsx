import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  Input,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  type ApiError,
  type UserPublic,
  type UserUpdateMe,
  UsersService,
} from "../../client";
import useAuth from "../../hooks/useAuth";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

const UserInformation = () => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const [editMode, setEditMode] = useState(false);
  const { user: currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UserPublic>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: currentUser?.username,
    },
  });

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "User updated successfully.", "success");
    },
    onError: (err: ApiError) => {
      handleError(err, showToast);
    },
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });

  const onSubmit: SubmitHandler<UserUpdateMe> = async (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
    toggleEditMode();
  };

  return (
    <>
      <Container maxW="full">
        <Box
          w={{ sm: "full", md: "50%" }}
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormControl>
            {editMode ? (
              <Input
                id="name"
                {...register("username", { maxLength: 30 })}
                type="text"
                size="md"
                w="auto"
              />
            ) : (
              <Text
                size="md"
                py={2}
                color={!currentUser?.username ? "ui.dim" : "inherit"}
                isTruncated
                maxWidth="250px"
              >
                {currentUser?.username || "N/A"}
              </Text>
            )}
          </FormControl>
          <Flex mt={4} gap={3}>
            <Button
              variant="primary"
              onClick={toggleEditMode}
              type={editMode ? "button" : "submit"}
              isLoading={editMode ? isSubmitting : false}
              isDisabled={editMode ? !isDirty : false}
            >
              {editMode ? "Save" : "Edit"}
            </Button>
            {editMode && (
              <Button onClick={onCancel} isDisabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </Flex>
        </Box>
      </Container>
    </>
  );
};

export default UserInformation;
