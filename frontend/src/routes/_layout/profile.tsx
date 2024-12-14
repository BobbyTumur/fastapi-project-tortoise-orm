import {
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import ChangePassword from "../../components/UserProfile/ChangePassword";
import UserInformation from "../../components/UserProfile/UserInformation";

export const Route = createFileRoute("/_layout/profile")({
  component: UserProfile,
});

function UserProfile() {
  const { t } = useTranslation();
  const tabsConfig = [
    { title: t("titles.myProfile"), component: UserInformation },
    { title: t("titles.updatePassword"), component: ChangePassword },
  ];
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
        {t("titles.myProfile")}
      </Heading>
      <Tabs variant="enclosed">
        <TabList>
          {tabsConfig.map((tab, index) => (
            <Tab key={index}>{tab.title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsConfig.map((tab, index) => (
            <TabPanel key={index}>
              <tab.component />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Container>
  );
}
