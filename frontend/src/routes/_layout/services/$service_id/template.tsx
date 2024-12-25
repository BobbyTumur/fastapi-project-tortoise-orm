import {
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

import EditServiceTemplate from "../../../../components/Services/EditServiceTemplate";
import LOG from "../../../../components/Services/Log";
import { type ServicePublic,type ServicesPublic, ServicesService } from "../../../../client";

export const Route = createFileRoute('/_layout/services/$service_id/template')({
  component: Template,
});

function Template() {
  // Use `useParams` with an options object
  const { service_id } = useParams({ from: '/_layout/services/$service_id/template' });
  const { t } = useTranslation();
  const { data: service } = useQuery<ServicePublic | null, Error>({
    queryKey: ["currentService"],
    queryFn: () => ServicesService.getService({ serviceId: service_id}),      
  })

  const tabsConfig = [
    { title: t("titles.summary"), component: EditServiceTemplate },
    { title: t("titles.updatePassword"), component: LOG },
  ];
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
        {service?.name} {service?.sub_name}
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
