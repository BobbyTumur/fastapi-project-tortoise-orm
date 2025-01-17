import {
  Badge,
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FiUsers } from "react-icons/fi";
import { RiFileTransferLine } from "react-icons/ri";
import { LuMonitorCog } from "react-icons/lu";
import { BsChatLeftText } from "react-icons/bs";

import type { UserPublic } from "../../client";

interface MenuItem {
  icon: any;
  title: string;
  path: string;
}

const items: MenuItem[] = [
  { icon: LuMonitorCog, title: "Monitoring", path: "/services" },
  { icon: RiFileTransferLine, title: "File Transfer", path: "/file-transfer" },
  { icon: BsChatLeftText, title: "AI chat", path: "/chat" },
];

interface SidebarItemsProps {
  onClose?: () => void;
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const textColor = useColorModeValue("ui.main", "ui.light");
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568");

  const finalItems = currentUser?.is_superuser
    ? [{ icon: FiUsers, title: "Admin", path: "/admin" }, ...items]
    : items;

  const listItems = finalItems.map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      {title == "AI chat" ? (
        <Text ml={2}>
          {title}{" "}
          <Badge ml="1" colorScheme="teal">
            beta
          </Badge>
        </Text>
      ) : (
        <Text ml={2}>{title}</Text>
      )}
    </Flex>
  ));

  return (
    <>
      <Box>{listItems}</Box>
    </>
  );
};

export default SidebarItems;
