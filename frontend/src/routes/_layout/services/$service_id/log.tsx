import {
  Box,
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
import {
  createFileRoute,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { z } from "zod";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ServicesService } from "../../../../client";
import { PaginationFooter } from "../../../../components/Common/PaginatorFooter";

const servicesSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/services/$service_id/log")({
  component: LogsTable,
  validateSearch: (search) => servicesSearchSchema.parse(search),
});

const PER_PAGE = 50;

function LogsTable() {
  const { service_id } = useParams({
    from: "/_layout/services/$service_id/log",
  });

  function getServiceLogQueryOptions({ page }: { page: number }) {
    return {
      queryFn: () =>
        ServicesService.getServiceLogs({
          serviceId: service_id,
          skip: (page - 1) * PER_PAGE,
          limit: PER_PAGE,
        }),
      queryKey: ["logs", { service_id }, { page }],
    };
  }
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) });

  const {
    data: service,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getServiceLogQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage = !isPlaceholderData && service?.logs?.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getServiceLogQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  return (
    <Container maxW="full">
      <Heading
        size="lg"
        textAlign={{ base: "center", md: "left" }}
        mt={8}
        p={4}
      >
        {service?.name}: {service?.sub_name}
      </Heading>
      <TableContainer>
        <Table size={{ base: "sm", md: "sm" }} align="center">
          <Thead>
            <Tr>
              <Th width="15%" textAlign="center">
                {t("logs.startTime")}
              </Th>
              <Th width="15%" textAlign="center">
                {t("logs.endTime")}
              </Th>
              <Th width="15%" textAlign="center">
                {t("logs.elapsedTime")}
              </Th>
              <Th width="15%" textAlign="center">
                {t("logs.status")}
              </Th>
              <Th width="15%" textAlign="center">
                {t("logs.content")}
              </Th>
              <Th width="20%" textAlign="center">
                {t("logs.screenshot")}
              </Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(6).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : service?.logs?.length === 0 ? (
            <Flex
              justify="center"
              height="80vh"
              align="center"
              width="full"
              position="absolute"
            >
              <Heading size="md" textAlign="center" mt={8} p={4}>
                {t("logs.noLogsYet")}
              </Heading>
            </Flex>
          ) : (
            <Tbody>
              {service?.logs?.map((log) => (
                <Tr key={log.id}>
                  <Td color={!log.id ? "ui.dim" : "inherit"} textAlign="center">
                    {log.start_time}
                  </Td>
                  <Td textAlign="center">{log.end_time}</Td>
                  <Td textAlign="center">{log.elapsed_time}</Td>
                  <Td>
                    <Flex gap={2} justify="center">
                      <Box
                        w="2"
                        h="2"
                        borderRadius="50%"
                        bg={log.is_ok ? "ui.success" : "ui.danger"}
                        alignSelf="center"
                      />
                      {log.is_ok ? t("logs.success") : t("logs.failure")}
                    </Flex>
                  </Td>
                  <Td textAlign="center">{log.content}</Td>
                  <Td textAlign="center">{log.screenshot}</Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <PaginationFooter
        onChangePage={setPage}
        page={page}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </Container>
  );
}
