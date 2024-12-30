import {
  Container,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

import AlertNotificationTemplate from "../../../../components/Services/AlertNotificationTemplate";
import AutoPublishTemplate from "../../../../components/Services/AutoPublishTemplate";
import { type ServiceConfig, ServicesService } from "../../../../client";
import InfoAndQuickEdit from "../../../../components/Services/ServiceQuickEdit";

export const Route = createFileRoute("/_layout/services/$service_id/template")({
  component: Template,
});

function Template() {
  // Use `useParams` with an options object
  const { service_id } = useParams({
    from: "/_layout/services/$service_id/template",
  });
  const { t } = useTranslation();
  const { data: serviceConfig } = useQuery<ServiceConfig, Error>({
    queryKey: ["currentService", service_id],
    queryFn: () => ServicesService.getServiceConfig({ serviceId: service_id }),
  });

  if (!serviceConfig) {
    return <Skeleton height="200px" />;
  }

  const baseTabsConfig = [
    {
      title: t("titles.alertNotificationTemplate"),
      key: "alertNotification", // Add a unique key
      component: () => <AlertNotificationTemplate service={serviceConfig} />,
      condition: serviceConfig.has_alert_notification,
    },
    {
      title: t("titles.autoPublishTemplate"),
      key: "autoPublish", // Add a unique key
      component: () => <AutoPublishTemplate service={serviceConfig} />,
      condition: serviceConfig.has_auto_publish,
    },
    {
      title: t("titles.infoAndQuickEdit"),
      key: "infoAndQuickEdit",
      component: () => <InfoAndQuickEdit service={serviceConfig} />,
      condition: true, // Always show this tab
    },
  ];

  const tabsConfig = baseTabsConfig.filter((tab) => tab.condition);

  return (
    <Container maxW="full">
      <Heading
        size="lg"
        textAlign={{ base: "center", md: "left" }}
        pl={4}
        pt={16}
      >
        {serviceConfig?.name}: {serviceConfig?.sub_name}
      </Heading>
      <Tabs variant="enclosed" align="center">
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
