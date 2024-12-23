import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  List,
  ListItem,
  IconButton,
  Text,
  Checkbox,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const EditServiceTemplate: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [task, setTask] = useState("");

  const addTodo = () => {
    if (task.trim() === "") return;
    const newTodo: TodoItem = {
      id: Date.now(),
      text: task.trim(),
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
    setTask("");
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>
        Todo List
      </Heading>
      <Flex mb={4} gap={2}>
        <Input
          placeholder="Add a new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <Button onClick={addTodo} colorScheme="blue">
          Add
        </Button>
      </Flex>
      <List spacing={3}>
        {todos.map((todo) => (
          <ListItem
            key={todo.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bg={todo.completed ? "green.100" : "white"}
            p={2}
            borderRadius="md"
            borderWidth="1px"
          >
            <Flex align="center" gap={2}>
              <Checkbox
                isChecked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <Text as={todo.completed ? "s" : undefined}>{todo.text}</Text>
            </Flex>
            <IconButton
              aria-label="Delete task"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              onClick={() => deleteTodo(todo.id)}
            />
          </ListItem>
        ))}
      </List>
      {todos.length === 0 && (
        <Text mt={4} textAlign="center" color="gray.500">
          No tasks yet. Add some!
        </Text>
      )}
    </Box>
  );
};

export default EditServiceTemplate;
