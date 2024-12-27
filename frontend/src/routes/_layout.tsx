import { Flex, Spinner, Spacer } from "@chakra-ui/react";
import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router";

import Sidebar from "../components/Common/Sidebar";
import UserMenu from "../components/Common/UserMenu";
import useAuth, { isLoggedIn } from "../hooks/useAuth";
import Appearance from "../components/Common/Appearance";
import Language from "../components/Common/Language";
import NavigationPath from "../components/Common/NavigationPath";

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Layout() {
  const { isLoading } = useAuth();
  const location = useLocation();

  {
    /* Log Page */
  }
  const navigationDetails = (() => {
    if (location.pathname.endsWith("/log")) {
      return {
        sectionName: "Services",
        sectionHref: "/services",
        currentPageName: "Log",
      };
    }
    {
      /* Template Page */
    }
    if (location.pathname.endsWith("/template")) {
      return {
        sectionName: "Services",
        sectionHref: "/services",
        currentPageName: "Template",
      };
    }
    return null;
  })();

  const noNeedSidebar = !!navigationDetails;

  return (
    <Flex maxW="large" h="auto" position="relative">
      {!noNeedSidebar ? (
        <Sidebar />
      ) : (
        <NavigationPath
          sectionName={navigationDetails.sectionName}
          sectionHref={navigationDetails.sectionHref}
          currentPageName={navigationDetails.currentPageName}
        />
      )}

      {isLoading ? (
        <Flex justify="center" height="100vh" align="center" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Outlet />
      )}

      <Spacer />
      <Language />
      <Appearance />
      <UserMenu />
    </Flex>
  );
}
