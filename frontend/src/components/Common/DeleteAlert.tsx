import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";

import { UsersService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface DeleteProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

const Delete = ({ id, isOpen, onClose }: DeleteProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteUser = async (id: string) => {
    await UsersService.deleteUser({ userId: id });
  };

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      showToast("Success", `The user was deleted successfully.`, "success");
      onClose();
    },
    onError: () => {
      showToast(
        "An error occurred.",
        `An error occurred while deleting the user.`,
        "error"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  const onSubmit = async () => {
    mutation.mutate(id);
  };

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
            <AlertDialogHeader>Delete user</AlertDialogHeader>

            <AlertDialogBody>
              <span>
                All items associated with this user will also be{" "}
                <strong>permantly deleted. </strong>
              </span>
              Are you sure? You will not be able to undo this action.
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button variant="danger" type="submit" isLoading={isSubmitting}>
                Delete
              </Button>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Delete;
