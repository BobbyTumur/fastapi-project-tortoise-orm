import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import Navbar from "../../../components/Common/Navbar";
import CreateUrl from "../../../components/FileTransfer/CreateUrl";
import { type S3Object, FileTransferService } from "../../../client";
import MenuFile from "../../../components/FileTransfer/MenuFile";

export const Route = createFileRoute("/_layout/file-transfer/outside")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { data: objects, isLoading } = useQuery<Array<S3Object>>({
    queryKey: ["from_customer", "fileObjects"],
    queryFn: async () =>
      FileTransferService.listFiles({ folder: "from_customer" }),
  });

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        {t("titles.fileTransferred")}
      </Heading>
      <Navbar
        text={t("titles.createUrl")}
        addModalAs={CreateUrl}
        addModalProps={{ type: "upload" }}
      />
      {isLoading ? (
        <Flex justify="center" height="100vh" align="center" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <SimpleGrid
          spacing={4}
          templateColumns="repeat(auto-fill, minmax(160px, 1fr))"
        >
          {objects?.map((obj) => {
            const parts = obj.Key.split("/");
            const companyName = parts[1]; // "CompanyA"
            const fileName = parts[2]; // "website_login.log"
            // Truncate file name to first 15 characters followed by "..." if longer
            const truncatedFileName =
              fileName.length > 16 ? `${fileName.slice(0, 16)}...` : fileName;

            // Format date as MM/DD HH:mm
            const formattedDate = new Date(obj.LastModified).toLocaleString(
              "en-US",
              {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // Use 24-hour format
              }
            );
            const sizeInMB = (obj.Size / (1024 * 1024)).toFixed(2);

            return (
              <Card size="md" variant="outline" key={obj.Key}>
                <CardHeader>
                  <Flex>
                    <Heading size="xs">{companyName}</Heading>
                    <Spacer />
                    <MenuFile fileKey={obj.Key} />
                  </Flex>
                </CardHeader>
                <CardBody fontSize="xs">
                  {truncatedFileName}
                  <br />
                  {sizeInMB}MB
                  <br />
                  <br />
                  {formattedDate}
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}
