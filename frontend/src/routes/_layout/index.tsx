import { Box, Container, Text, Link } from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import useAuth from "../../hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Text fontSize="2xl">
            Hi, {currentUser?.username || currentUser?.email} 👋🏼
          </Text>
          <Text>{t("welcome")}</Text>
          <Link
            href="https://github.com/BobbyTumur/fastapi-project-tortoise-orm"
            color="blue.500"
            _hover={{ textDecoration: "underline" }}
            isExternal
          >
            Check out my github for this project!
          </Link>
        </Box>
      </Container>
    </>
  );
}
