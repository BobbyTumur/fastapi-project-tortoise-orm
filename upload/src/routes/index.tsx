import {
  Container,
  Box,
  List,
  StepsNextTrigger,
  VStack,
  StepsPrevTrigger,
  Text,
  Heading,
} from "@chakra-ui/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiError } from "../client/core/ApiError";
import useAuth, { isLoggedIn } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  StepsCompletedContent,
  StepsContent,
  StepsItem,
  StepsList,
  StepsRoot,
} from "../components/ui/steps";
import {
  FileUploadList,
  FileUploadRoot,
  FileUploadDropzone,
} from "../components/ui/file-upload";
import { Toaster, toaster } from "../components/ui/toaster";
import {
  UploadService,
  Body_upload___upload_file as fileUpload,
} from "../client";
import { handleError } from "../utils";
import { useRef, useState } from "react";
import AnimatedCheckIcon from "../components/SuccessAnimation";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/invalid-url",
      });
    }
  },
});

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => !!file, "ファイルを選択してください"),
});

type FormValues = z.infer<typeof formSchema>;

function RouteComponent() {
  const [checked, setChecked] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const handleCheck = () => {
    setChecked((prevChecked) => !prevChecked);
  };

  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };
  const stepsNextTriggerRef = useRef<HTMLButtonElement | null>(null);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });
  const file = useWatch({ control, name: "file" });
  const mutation = useMutation({
    mutationFn: (data: fileUpload) =>
      UploadService.uploadFile({ formData: data }),
    onSuccess: () => {
      stepsNextTriggerRef.current?.click();
      setSuccessful(false);
      setTimeout(() => setSuccessful(true), 1);
    },
    onError: (err: ApiError) => {
      const errorMessage = handleError(err);
      toaster.create({
        description: errorMessage,
        type: "error",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ file: data.file });
  };

  const items = [
    "一度にアップロードできるファイルは1個のみです。\n複数ファイルはZip化してアップロードしてください。※Zip化時はパスワードなしでお願いいたします。",
    "一度にアップロードできるファイルの\n最大容量は 5GB です。\n上限を超える場合は、\nサポート窓口にてお問い合わせください。",
    "アップロードが成功したら、\nURLを再び利用することができません。",
  ];

  return (
    <>
      <Container
        h="70vh"
        alignItems="stretch"
        justifyContent="center"
        textAlign="center"
        maxW="460px"
        centerContent
      >
        <Box
          height="150px"
          justifyContent="center"
          display="flex"
          flexDirection="column"
        >
          <Heading>
            {checked ? "アップロード画面" : "こにちは、お客さま"}
          </Heading>
          <Text m={6} display={checked ? "none" : "block"}>
            こちらはファイル転送するためのツールです。
            下記の項目を確認し、アップロード
            <br />
            画面へお進みください。
          </Text>
        </Box>
        <StepsRoot
          defaultValue={2}
          count={2}
          linear={true}
          colorPalette={"green"}
        >
          <StepsList>
            <StepsItem index={0} title="確認事項" />
            <StepsItem index={1} title="アップロード" />
          </StepsList>
          <StepsContent index={0} height="300px">
            <List.Root as="ol" listStyle="decimal" gap={8} mt={8}>
              {items.map((item, index) => (
                <List.Item key={index} _marker={{ color: "inherit" }}>
                  <p key={index}>
                    {item.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </List.Item>
              ))}
            </List.Root>
            <StepsNextTrigger asChild>
              <Button mt={4} colorPalette="red" onClick={handleCheck}>
                確認しました
              </Button>
            </StepsNextTrigger>
          </StepsContent>
          <StepsContent
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            index={1}
            height="300px"
          >
            <Controller
              name="file"
              control={control}
              render={({ field }) => (
                <FileUploadRoot
                  maxW="xl"
                  alignItems="stretch"
                  maxFiles={1}
                  onFileChange={(event) => {
                    const acceptedFiles = event.acceptedFiles;
                    field.onChange(acceptedFiles[0] || null);
                  }}
                  disabled={mutation.isPending}
                >
                  {!file && (
                    <FileUploadDropzone
                      label="Drag and drop"
                      description="ドラッグ＆ドロップ"
                    />
                  )}

                  <FileUploadList clearable />
                </FileUploadRoot>
              )}
            />
            {errors.file && (
              <Box color="red.500" mt={2}>
                {errors.file.message}
              </Box>
            )}
            <VStack>
              {file ? (
                <Button
                  mt={4}
                  type="submit"
                  loading={mutation.isPending}
                  loadingText="アップロード中"
                >
                  アップロード
                </Button>
              ) : (
                <StepsPrevTrigger asChild>
                  <Button colorPalette="red" mt={4} onClick={handleCheck}>
                    確認事項へ戻る
                  </Button>
                </StepsPrevTrigger>
              )}

              <StepsNextTrigger asChild>
                <Button visibility="hidden" ref={stepsNextTriggerRef}>
                  Next
                </Button>
              </StepsNextTrigger>
            </VStack>
          </StepsContent>
          <StepsCompletedContent height="300px">
            {successful && (
              <>
                <Text m={6}>ファイル名: {getValues("file")?.name}</Text>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <AnimatedCheckIcon />
                </Box>
                <Text color="green" m={6}>
                  <br />
                  <strong>アップロードが完了しました。</strong>
                </Text>
                <Text>
                  サポート窓口より回答いたしますので、
                  <br />
                  しばらくお待ちください。
                </Text>
              </>
            )}
            <Button mt={4} onClick={handleLogout} colorPalette="red">
              終了する
            </Button>
          </StepsCompletedContent>
        </StepsRoot>
        <Toaster />
      </Container>
    </>
  );
}
