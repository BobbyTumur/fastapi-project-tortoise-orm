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

import ChangePassword from "../../components/UserSettings/ChangePassword";
import UserInformation from "../../components/UserSettings/UserInformation";

const tabsConfig = [
  { title: "Edit Name", component: UserInformation },
  { title: "Update Password", component: ChangePassword },
];

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
});

function UserSettings() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
        Edit Profile
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
