import {
  Badge,
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

import { type UserPublic, UsersService } from "../../client";
import AddUser from "../../components/Admin/AddUser";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";

const usersSearchSchema = z.object({
  page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
});

const PER_PAGE = 5;

function getUsersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      UsersService.readUsers({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["users", { page }],
  };
}

function UsersTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { page } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) });

  const {
    data: users,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getUsersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const hasNextPage = !isPlaceholderData && users?.data.length === PER_PAGE;
  const hasPreviousPage = page > 1;

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getUsersQueryOptions({ page: page + 1 }));
    }
  }, [page, queryClient, hasNextPage]);

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th width="20%">{t("common.username")}</Th>
              <Th width="50%">{t("common.email")}</Th>
              <Th width="10%">{t("common.role")}</Th>
              <Th width="10%">{t("common.status")}</Th>
              <Th width="10%">{t("common.actions")}</Th>
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
              {users?.data.map((user) => (
                <Tr key={user.id}>
                  <Td
                    color={!user.username ? "ui.dim" : "inherit"}
                    isTruncated
                    maxWidth="150px"
                  >
                    {user.username || t("common.noName")}
                    {currentUser?.id === user.id && (
                      <Badge ml="1" colorScheme="teal">
                        {t("common.you")}
                      </Badge>
                    )}
                  </Td>
                  <Td isTruncated maxWidth="150px">
                    {user.email}
                  </Td>
                  <Td>
                    {user.is_superuser
                      ? "Admin"
                      : user.can_edit
                        ? "Tier2"
                        : "Tier1"}
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Box
                        w="2"
                        h="2"
                        borderRadius="50%"
                        bg={user.is_active ? "ui.success" : "ui.danger"}
                        alignSelf="center"
                      />
                      {user.is_active
                        ? t("common.active")
                        : t("common.inactive")}
                    </Flex>
                  </Td>
                  <Td>
                    <ActionsMenu
                      type={t("common.user")}
                      value={user}
                      disabled={currentUser?.id === user.id ? true : false}
                    />
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

function Admin() {
  const { t } = useTranslation();
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        {t("titles.userManagement")}
      </Heading>

      <Navbar text={t("titles.addUser")} addModalAs={AddUser} />
      <UsersTable />
    </Container>
  );
}
