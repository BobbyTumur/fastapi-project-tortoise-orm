import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";

import { type UserPublic, ServicesService } from "../../../client";
import AddService from "../../../components/Admin/AddService";
import ActionsMenu from "../../../components/Common/ActionsMenu";
import Navbar from "../../../components/Common/Navbar";

const servicesSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/services/")({
  component: Services,
  validateSearch: (search) => servicesSearchSchema.parse(search),
});

const PER_PAGE = 10;

function getServicesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      ServicesService.getServices({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["services", { page }],
  };
}

function ServicesTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) });

  const {
    data: services,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getServicesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage = !isPlaceholderData && services?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getServicesQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "sm" }}>
          <Thead>
            <Tr>
              <Th width="25%">{t("services.name")}</Th>
              <Th width="25%">{t("services.subName")}</Th>
              <Th width="10%">{t("services.status")}</Th>
              <Th width="10%">{t("services.actions")}</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {services?.data.map((service) => (
                <Tr key={service.id}>
                  <Td
                    color={!service.name ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {service.name}
                  </Td>
                  <Td isTruncated maxWidth="150px">
                    {service.sub_name}
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Box
                        w="2"
                        h="2"
                        borderRadius="50%"
                        bg={"ui.success"}
                        alignSelf="center"
                      />
                      {t("common.healthy")}
                    </Flex>
                  </Td>
                  <Td>
                    <ActionsMenu type={t("common.service")} value={service} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <Flex
        gap={4}
        alignItems="center"
        mt={4}
        direction="row"
        justifyContent="flex-end"
      >
        <Button onClick={() => setPage(page - 1)} isDisabled={!hasPreviousPage}>
          {t("common.previous")}
        </Button>
        <span>
          {t("common.page")} {page}
        </span>
        <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
          {t("common.next")}
        </Button>
      </Flex>
    </>
  );
}

function Services() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        {t("titles.services")}
      </Heading>
      {currentUser?.is_superuser ? (
        <Navbar text={t("titles.addService")} addModalAs={AddService} />
      ) : (
        <Box h={20} />
      )}
      <ServicesTable />
    </Container>
  );
}
