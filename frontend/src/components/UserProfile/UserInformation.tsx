import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Tr,
  Td,
  Container,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import useAuth from "../../hooks/useAuth";

const UserInformation = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Container>
        <Box textAlign="center" mt={2}>
          {t("No user information available.")}
        </Box>
      </Container>
    );
  }

  const role = currentUser.is_superuser
    ? "Admin"
    : currentUser.can_edit
      ? "Tier2"
      : "Tier1";

  return (
    <>
      <Container maxW="full">
        <Box w={{ sm: "full", md: "30%" }}>
          <TableContainer>
            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Td fontWeight="bold">{t("common.username")}</Td>
                  <Td>{currentUser.username}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold">{t("common.email")}</Td>
                  <Td>{currentUser.email}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold">{t("common.status")}</Td>
                  <Td>
                    {currentUser.is_active
                      ? t("common.active")
                      : t("common.inactive")}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold">{t("common.role")}</Td>
                  <Td>{t(role)}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </>
  );
};

export default UserInformation;
