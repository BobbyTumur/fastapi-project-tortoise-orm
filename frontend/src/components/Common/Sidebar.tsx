import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { FiMenu } from "react-icons/fi";
import { Link, useLocation } from "@tanstack/react-router";

import Logo from "/assets/images/bobby-logo.png";
import type { UserPublic } from "../../client";
import SidebarItems from "./SidebarItems";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const bgColor = useColorModeValue("ui.light", "ui.dark");
  const textColor = useColorModeValue("ui.dark", "ui.light");
  const secBgColor = useColorModeValue("ui.secondary", "ui.darkSlate");
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  {/* Log page should have shrinked sidebar */}
  const isServicePage =location.pathname.endsWith("/log");

  return (
    <>
      {/* Mobile, /log */}
        <>
              <IconButton
              onClick={onOpen}
              display={isServicePage ? ({ base: "flex", md: "flex" }) : ({ base: "flex", md: "none" })}
              aria-label="Open Menu"
              position="absolute"
              fontSize="20px"
              m={4}
              icon={<FiMenu />}
            />
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent maxW="250px">
                <DrawerCloseButton />
                <DrawerBody py={8}>
                  <Flex flexDir="column" justify="space-between">
                    <Box>
                      <Link to="/">
                        <Image src={Logo} alt="logo" p={6} />
                      </Link>
                      <SidebarItems onClose={onClose} />
                    </Box>
                    {currentUser?.email && (
                      <Text color={textColor} noOfLines={2} fontSize="sm" p={2}>
                        Logged in as: {currentUser.email}
                      </Text>
                    )}
                  </Flex>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            </>


      {/* Desktop */}
      {!isServicePage &&(
      <Box
        bg={bgColor}
        p={3}
        h="100vh"
        position="sticky"
        top="0"
        display={{ base: "none", md: "flex" }}
      >
        <Flex
          flexDir="column"
          justify="space-between"
          bg={secBgColor}
          p={4}
          borderRadius={12}
        >
          <Box>
            <Link to="/">
              <Image src={Logo} alt="Logo" w="180px" maxW="2xs" p={6} />
            </Link>
            <SidebarItems />
          </Box>
          {currentUser?.email && (
            <Text
              color={textColor}
              noOfLines={2}
              fontSize="sm"
              p={2}
              maxW="180px"
            >
              Logged in as: {currentUser.email}
            </Text>
          )}
        </Flex>
      </Box>
      )}
    </>
  );
};

export default Sidebar;
