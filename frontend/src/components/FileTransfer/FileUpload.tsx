import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiUpload } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import useCustomToast from "../../hooks/useCustomToast";

import React, { useRef, useState } from "react";
interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileUpload = ({ isOpen, onClose }: FileUploadProps) => {
  const { t } = useTranslation();
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1 GB in bytes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset error message
    setUploading(false); // Reset upload status
    const file = event.target.files?.[0]; // Single file selection

    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`File exceeds the maximum size of 1 GB.`);
        return;
      }

      setSelectedFile(file); // Update selected file state
    }
  };
  const reset = () => {
    setUploading(false);
    onClose();
    setSelectedFile(null);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }

    try {
      setUploading(true);

      const authToken = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/file-transfer/upload/to-customer`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        reset();
        throw new Error("Upload failed.");
      }

      queryClient.invalidateQueries({
        queryKey: ["to_customer", "fileObjects"],
      });
      reset();
      showToast(t("toast.success"), t("toast.fileUploaded"), "success");
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "An unknown error occurred.";
      showToast(t("toast.error"), error, "error");
      reset();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("modal.uploadFile")}</ModalHeader>
          <ModalCloseButton />
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*" // Accept all file types
            multiple={false} // Allow only one file
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <ModalBody>
            {selectedFile ? (
              <HStack gap={0}>
                <Text>
                  {selectedFile.name}{" "}
                  {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                </Text>
                <Button
                  size="xs"
                  variant="unstyled"
                  onClick={() => setSelectedFile(null)}
                >
                  x
                </Button>
              </HStack>
            ) : (
              <Button
                leftIcon={<FiUpload />}
                variant="unstyled"
                onClick={handleButtonClick}
              >
                Choose File
              </Button>
            )}

            {error && <Text style={{ color: "red" }}>{error}</Text>}
          </ModalBody>
          <ModalFooter gap={3} justifyContent="center">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              isLoading={uploading}
            >
              Upload
            </Button>
            <Button onClick={reset}>{t("buttons.cancel")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileUpload;
