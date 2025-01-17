import { Container, Text } from "@chakra-ui/react";

const NotFound = () => {
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
          404
        </Text>
        <Text fontSize="md">おっと!</Text>
        <Text fontSize="md">お探しのページが見つかりません。</Text>
      </Container>
    </>
  );
};

export default NotFound;
