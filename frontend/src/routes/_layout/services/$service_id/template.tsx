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

export const Route = createFileRoute("/_layout/services/$service_id/template")({
  component: Template,
});

function Template() {
  // Use `useParams` with an options object
  const { service_id } = useParams({
    from: "/_layout/services/$service_id/template",
  });
  const { t } = useTranslation();
  const { data: serviceConfig, isLoading } = useQuery<ServiceConfig, Error>({
    queryKey: ["currentService", service_id],
    queryFn: () => ServicesService.getServiceConfig({ serviceId: service_id }),
  });

  if (!serviceConfig) {
    return (
      <Skeleton>
        <div></div>
        <div></div>
      </Skeleton>
    ); // Add proper loading state if necessary
  }

  const tabsConfig = [
    {
      title: t("titles.alertNotificationTemplate"),
      component: () => (
        <AlertNotificationTemplate
          service={serviceConfig}
          serviceLoading={isLoading}
        />
      ),
    },
    {
      title: t("titles.autoPublishTemplate"),
      component: () => <AutoPublishTemplate service={serviceConfig} />,
    },
  ];
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} p={4}>
        {serviceConfig?.name}: {serviceConfig?.sub_name}
      </Heading>
      <Tabs variant="enclosed" p={4}>
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
