import { createFileRoute } from "@tanstack/react-router";
import { Container, Text } from "@chakra-ui/react";

export const Route = createFileRoute("/invalid-url")({
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
          401
        </Text>
        <Text fontSize="md">おっと!</Text>
        <Text fontSize="md">URLが正しくありません。</Text>
      </Container>
    </>
  );
}
