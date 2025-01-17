import { createFileRoute } from "@tanstack/react-router";
import { Container, Text } from "@chakra-ui/react";

export const Route = createFileRoute("/error")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Container
        h="100vh"
        alignItems="stretch"
        justifyContent="center"
        textAlign="center"
        maxW="sm"
        centerContent
      >
        <Text
          fontSize="8xl"
          color="ui.main"
          fontWeight="bold"
          lineHeight="1"
          mb={4}
        >
          500
        </Text>
        <Text fontSize="md">おっと!</Text>
        <Text fontSize="md">何かの問題が発生しました。</Text>
        <Text fontSize="md">管理者へ問い合わせください。</Text>
      </Container>
    </>
  );
}
