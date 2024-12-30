import { Box, Container, Text, Link } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useQueryClient } from "@tanstack/react-query";
import { UserPublic } from "../../client";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { t } = useTranslation();

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            {t("index.greet")}, {currentUser?.username || currentUser?.email} 👋🏼
          </Text>
          <Text>{t("index.welcome")}</Text>
          <Link
            href="https://github.com/BobbyTumur/fastapi-project-tortoise-orm"
            color="blue.500"
            _hover={{ textDecoration: "underline" }}
            isExternal
          >
            {t("index.body")}
          </Link>
        </Box>
      </Container>
    </>
  );
}
