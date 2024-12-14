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
                  <Td fontWeight="bold">{t("Username")}</Td>
                  <Td>{currentUser.username}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold">{t("Email")}</Td>
                  <Td>{currentUser.email}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold">{t("Status")}</Td>
                  <Td>{currentUser.is_active ? t("Active") : t("Inactive")}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="bold">{t("Role")}</Td>
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
