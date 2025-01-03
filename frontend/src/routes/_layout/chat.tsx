import ReactMarkdown from "react-markdown";
import {
  Box,
  Container,
  Text,
  Textarea,
  SkeletonText,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import useAuth from "../../hooks/useAuth";
import { UserPublic } from "../../client";

export const Route = createFileRoute("/_layout/chat")({
  component: WebSocketComponent,
});

function initializeSocket(
  currentUser: UserPublic,
  onMessage: (data: string) => void,
  onError: (error: Event) => void
): WebSocket | null {
  const token: string | null = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/login";
    return null;
  }

  const socketUrl = `${import.meta.env.VITE_WS_URL}${currentUser?.id}?token=${token}`;
  const socket = new WebSocket(socketUrl);

  socket.onmessage = (event) => {
    onMessage(event.data);
  };

  socket.onerror = (error: Event) => {
    console.error("WebSocket error: ", error); // Log WebSocket errors
    onError(error); // Pass the error event to onError handler
  };

  socket.onclose = (event) => {
    if (!event.wasClean) {
      console.warn("WebSocket connection closed unexpectedly. Reconnecting...");
      // Avoid multiple reconnect attempts at the same time
      if (socket.readyState === WebSocket.CLOSED) {
        setTimeout(
          () => initializeSocket(currentUser, onMessage, onError),
          5000
        ); // Reconnect after 5 seconds
      }
    }
  };

  return socket;
}

function WebSocketComponent() {
  const { user: currentUser } = useAuth();
  const bgColor = useColorModeValue("ui.light", "ui.dark");
  const secBgColor = useColorModeValue("ui.secondary", "ui.darkSlate");
  const [response, setResponse] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { response: string; prompt: string }[]
  >([]);
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser) return; // Skip if no currentUser

    if (!socket) {
      const socketInstance = initializeSocket(
        currentUser,
        (data) => {
          setLoading(false);
          setResponse(data);
        },
        (error) => {
          setLoading(false);
          console.error("Error in WebSocket connection: ", error);
        }
      );

      setSocket(socketInstance);
    }

    // Cleanup socket on component unmount
    return () => {
      socket?.close();
    };
  }, [currentUser, socket]); // Include socket in the dependency array

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, response]);

  const handleSendMessage = () => {
    if (question.trim() !== "" && socket?.readyState === WebSocket.OPEN) {
      setLoading(true);
      socket.send(question);
      setQuestion("");
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { response, prompt: question },
      ]);
    } else {
      console.warn("Socket is not open or question is empty.");
    }
  };

  return (
    <Container
      maxWidth="full"
      display="flex"
      flexDirection="column"
      centerContent
      backgroundColor={bgColor}
    >
      <Box
        width={{ base: "full", lg: "5xl" }}
        justifySelf="center"
        display="flex"
        flexDirection="column"
        flexGrow={1}
      >
        <Heading
          size="lg"
          textAlign={{ base: "center", lg: "left" }}
          position="fixed"
          paddingY={4}
          width={{ base: "full", lg: "5xl" }}
          backgroundColor={bgColor}
        >
          AI Assistant
        </Heading>
        <Box
          flex="1"
          overflowY="auto"
          display="flex"
          flexDirection="column"
          pt={20}
        >
          {chatHistory.map((item, index) => (
            <Box key={index} mb={4} display="flex" flexDirection="column">
              <Box display="flex" width="70%" flexDirection="column" gap={1}>
                <ReactMarkdown>{item.response}</ReactMarkdown>
              </Box>
              <Box display="flex" justifyContent="flex-end">
                <Text
                  width="70%"
                  bg={secBgColor}
                  borderRadius="3xl"
                  maxWidth="fit-content"
                  display="inline-block"
                  paddingY={2}
                  paddingX={4}
                  marginTop={4}
                >
                  {item.prompt}
                </Text>
              </Box>
            </Box>
          ))}
          {loading && <SkeletonText noOfLines={3} gap="4" />}
          {!loading && response && (
            <Box display="flex" width="70%" flexDirection="column">
              <ReactMarkdown>{response}</ReactMarkdown>
            </Box>
          )}
          <div ref={bottomRef}></div>
        </Box>
      </Box>

      {/* Textarea at the bottom of the screen */}
      <Textarea
        id="chat-input"
        name="chatInput"
        width={{ base: "full", lg: "5xl" }}
        variant="filled"
        spellCheck="false"
        borderRadius="3xl"
        paddingX={4}
        paddingY={4}
        marginTop={8}
        marginBottom={4}
        border="none"
        size="md"
        resize="none"
        placeholder="Ask me anything"
        value={question}
        disabled={loading || !socket}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            handleSendMessage();
          }
        }}
        _focus={{
          background: secBgColor,
          border: "none",
          outline: "none",
        }}
        _active={{
          background: secBgColor,
          border: "none",
          outline: "none",
        }}
      />
    </Container>
  );
}
