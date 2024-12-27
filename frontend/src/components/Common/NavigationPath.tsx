import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
} from "@chakra-ui/react";

interface NavigationPathProps {
  sectionHref: string;
  sectionName: string;
  currentPageName: string;
}

const NavigationPath = ({
  sectionHref,
  sectionName,
  currentPageName,
}: NavigationPathProps) => {
  return (
    <Box
      display={{ base: "none", md: "block" }}
      position="fixed"
      top={3}
      left={8}
    >
      <Breadcrumb
        spacing="4px"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        {/* Home is constant */}
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {/* Section navigation item */}
        <BreadcrumbItem>
          <BreadcrumbLink href={sectionHref}>{sectionName}</BreadcrumbLink>
        </BreadcrumbItem>

        {/* Current page navigation item */}
        <BreadcrumbItem isCurrentPage color="ui.main">
          <BreadcrumbLink href="#">{currentPageName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    </Box>
  );
};

export default NavigationPath;
