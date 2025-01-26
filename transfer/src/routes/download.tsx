import { createFileRoute, redirect } from "@tanstack/react-router";
import useAuth, { isLoggedIn } from "../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { handleError } from "../utils";
import { ApiError, FileTransferService } from "../client";
import { Toaster, toaster } from "../components/ui/toaster";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Box,
  Collapsible,
  Container,
  Flex,
  Heading,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";

export const Route = createFileRoute("/download")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/invalid-url",
      });
    }
  },
});

function RouteComponent() {
  const [checked, setChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Control the Collapsible state
  const [successful, setSuccessful] = useState(false);

  const handleCheckboxChange = (e: { checked: boolean }) => {
    setChecked(e.checked);
    if (e.checked) {
      setIsOpen(false); // Close the collapsible when checked
    }
  };
  const handleOpenChange = (details: { open: boolean }) => {
    setIsOpen(details.open);
  };
  const { deleteToken, user: currentUser, isLoading } = useAuth();

  const handleDelToken = async () => {
    deleteToken();
  };

  const mutation = useMutation({
    mutationFn: () => FileTransferService.downloadOwnFile(),
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessful(false);
      setTimeout(() => setSuccessful(true), 1);
      handleDelToken();
    },
    onError: (err: ApiError) => {
      const errorMessage = handleError(err);
      toaster.create({
        description: errorMessage,
        type: "error",
      });
    },
  });

  const handleMutation = () => {
    mutation.mutate();
  };
  return (
    <Container
      h="70vh"
      alignItems="stretch"
      justifyContent="center"
      textAlign="center"
      maxW="460px"
      centerContent
      mt={4}
    >
      {isLoading ? (
        <Flex justify="center" height="70vh" align="center" width="full">
          {" "}
          <Spinner size="xl" color="blackAlpha.50" />
        </Flex>
      ) : (
        <>
          <Heading color={"teal"}>
            {/* <Highlight
              query={currentUser?.company_name || ""}
              styles={{ px: "0.5", color: "teal" }}
            >
              {`${currentUser?.company_name || ""}さま`}
            </Highlight> */}
            {currentUser?.company_name || ""} さま
          </Heading>
          <Text m={6}>
            サイト管理者よりお客へ
            <br />
            以下のファイルが共有されています。
          </Text>
          <Collapsible.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            disabled={successful}
          >
            <Collapsible.Trigger paddingY="3" fontStyle={"italic"}>
              <Link variant="underline">
                {" "}
                <strong>{currentUser?.file_name}</strong>
              </Link>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box padding="4" borderWidth="1px">
                <VStack fontSize={"sm"}>
                  <Text color="red.500">
                    ファイルのダウンロードが成功たら、
                    <br />
                    再びリンクを利用することができませんので、
                    <br />
                    ご了承ください。
                  </Text>
                  <Checkbox
                    onCheckedChange={handleCheckboxChange}
                    colorPalette={"teal"}
                    disabled={successful}
                  >
                    <strong>確認しました</strong>
                  </Checkbox>
                </VStack>
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
          <Box justifyContent="center" mt={4}>
            <Button
              variant="solid"
              colorPalette="teal"
              visibility={checked ? "unset" : "hidden"}
              onClick={handleMutation}
              disabled={successful}
            >
              ダウンロード
            </Button>
          </Box>
        </>
      )}
      <Toaster />
    </Container>
  );
}
