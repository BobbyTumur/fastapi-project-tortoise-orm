import {
  Box,
  Container,
  Text,
  Textarea,
  SkeletonText,
  Heading,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_layout/chat")({
  component: WebSocketComponent,
});

const socket = new WebSocket("ws://127.0.0.1:8000/api/v1/ws/");

function WebSocketComponent() {
  const [response, setResponse] = useState<string>(""); // Latest response
  const [chatHistory, setChatHistory] = useState<
    { response: string; prompt: string }[]
  >([]); // Array to hold prompt and response pairs
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    socket.onmessage = (event) => {
      setLoading(false);
      setResponse(event.data); // Update latest response
    };
  }, []);

  const handleSendMessage = () => {
    if (question.trim() !== "" && socket.readyState === WebSocket.OPEN) {
      setLoading(true);
      socket.send(question);
      setQuestion(""); // Clear the input field after sending the message
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { response, prompt: question }, // Store both prompt and response
      ]);
    }
  };

  return (
    <Container
      maxWidth="full"
      height="100vh"
      display="flex"
      flexDirection="column"
      centerContent
    >
      <Box
        width="5xl"
        justifySelf="center"
        display="flex"
        flexDirection="column"
        flexGrow={1} // Ensure this box takes up available space
      >
        {/* Display chat history */}
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
          AI Assistant
        </Heading>
        <Box flex="1" overflowY="auto" display="flex" flexDirection="column">
          {chatHistory.map((item, index) => (
            <Box key={index} mb={4} display="flex" flexDirection="column">
              {/* Left-aligned prompt */}
              <Text p={2} paddingX={4}>
                {item.response}
              </Text>
              <Box display="flex" justifyContent="flex-end">
                <Text
                  textAlign="right"
                  bg="gray.100"
                  borderRadius="3xl"
                  maxWidth="fit-content"
                  display="inline-block"
                  paddingY={2}
                  paddingX={4}
                >
                  {item.prompt}
                </Text>
              </Box>
            </Box>
          ))}
          {loading && <SkeletonText noOfLines={3} gap="4" />}
          {!loading && response && (
            <Text p={2} paddingX={4}>
              {response}
            </Text>
          )}
        </Box>
      </Box>

      {/* Textarea at the bottom of the screen */}
      <Textarea
        width="5xl"
        variant="filled"
        borderRadius="3xl"
        paddingX={4}
        paddingY={2}
        marginBottom={4}
        border="none"
        size="md"
        resize="none"
        placeholder="Ask me anything"
        value={question}
        disabled={loading}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
          }
        }}
        _focus={{
          background: "gray.100",
          border: "none",
          outline: "none",
        }}
        _active={{
          background: "gray.100",
          border: "none",
          outline: "none",
        }}
      />
    </Container>
  );
}
