import {
  Container,
  Flex,
  Heading,
  useColorModeValue,
  Box,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { HiOutlineFolder } from "react-icons/hi2";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_layout/file-transfer/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const iconColor = useColorModeValue("ui.dim", "ui.dim"); // Default color
  const hoverColor = useColorModeValue("ui.main", "ui.light"); // Hover color
  const { t } = useTranslation();

  return (
    <Container maxW="full">
      <Heading
        size="lg"
        textAlign={{ base: "center", md: "left" }}
        paddingY={12}
      >
        {t("titles.fileTransfer")}
      </Heading>
      <Flex gap={8}>
        {/* Folder 1 */}
        <VStack>
          <Box
            as="button"
            onClick={() => navigate({ to: "/file-transfer/outside" })}
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ color: hoverColor }}
          >
            <Icon
              as={HiOutlineFolder}
              boxSize="120px"
              color={iconColor}
              style={{ transition: "color 0.2s" }}
              _hover={{ color: hoverColor }}
            />
          </Box>
          <Text>{t("texts.fileTransferred")}</Text>
        </VStack>

        {/* Folder 2 */}
        <VStack>
          <Box
            as="button"
            onClick={() => navigate({ to: "/file-transfer/inside" })}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={HiOutlineFolder}
              boxSize="120px"
              color={iconColor}
              style={{ transition: "color 0.2s" }}
              _hover={{ color: hoverColor }}
            />
          </Box>
          <Text>{t("texts.fileToBeTransferred")}</Text>
        </VStack>
      </Flex>
    </Container>
  );
}
