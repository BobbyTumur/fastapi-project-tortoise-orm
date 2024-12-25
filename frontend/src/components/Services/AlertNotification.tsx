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
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useCustomToast from "../../hooks/useCustomToast";

const AlertNotification = () => {
  const { t } = useTranslation();
  const color = useColorModeValue("inherit", "ui.light");
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
  });