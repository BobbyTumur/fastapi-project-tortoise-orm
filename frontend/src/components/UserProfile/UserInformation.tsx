import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Tr,
  Td,
  Container,
  SkeletonText,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { type UserPublic, UsersService } from "../../client";

const UserInformation = () => {
  const { t } = useTranslation();
  const { data: currentUser, isLoading } = useQuery<UserPublic>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    refetchOnWindowFocus: false, // Optionally disable refetch on window focus
  });

  const role = currentUser?.is_superuser
    ? t("texts.admin")
    : currentUser?.can_edit
      ? t("texts.tier2")
      : t("texts.tier1");
  const totp = currentUser?.is_totp_enabled
    ? t("common.enabled")
    : t("common.notEnabled");
  return (
    <>
      <Container maxW="full">
        <Box w={{ sm: "full", md: "50%" }}>
          <TableContainer>
            <Table variant="simple">
              {isLoading ? (
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
                  <Tr>
                    <Td fontWeight="bold">{t("common.username")}</Td>
                    <Td>{currentUser?.username}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">{t("common.email")}</Td>
                    <Td>{currentUser?.email}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">{t("common.status")}</Td>
                    <Td>
                      {currentUser?.is_active
                        ? t("common.active")
                        : t("common.inactive")}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">{t("common.role")}</Td>
                    <Td>{t(role)}</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">{t("common.totp")}</Td>
                    <Td>{t(totp)}</Td>
                  </Tr>
                </Tbody>
              )}
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </>
  );
};

export default UserInformation;
