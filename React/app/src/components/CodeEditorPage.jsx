import React, { useEffect, useRef, useState } from "react";
import { Box, Text, HStack, Button } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi"; // Back arrow icon
import { useEditorContext } from "./EditorContext";  // Importing context
import LanguageSelector from "./LanguageSelector";
import Output from "./Output"; // The Output component to show the result

const CodeEditorPage = () => {
  const navigate = useNavigate();
  const editorRef = useRef();

  // ✅ FIXED: include updateFileContent from context!
  const {
    fileContent,
    fileName,
    language,
    setLanguage,
    setFileName,
    setFileContent,
    updateFileContent,
  } = useEditorContext();

  const [isLoading, setIsLoading] = useState(false);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    const savedFileName = localStorage.getItem("fileName");
    const savedFileContent = localStorage.getItem("fileContent");

    console.log('Saved File Name:', savedFileName);
    console.log('Saved File Content:', savedFileContent);

    if (!savedFileName) {
      navigate("/dashboard/fileSelection");
    } else {
      setFileName(savedFileName);
      setFileContent(savedFileContent);
      const ext = savedFileName.split(".").pop();
      const languageMode = getLanguageFromExtension(ext);
      setLanguage(languageMode);
    }
  }, [navigate, setFileName, setFileContent, setLanguage]);

  const getLanguageFromExtension = (extension) => {
    const extensionMap = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      java: "java",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      c: "c",
      cpp: "cpp",
      html: "html",
      css: "css",
    };
    return extensionMap[extension] || "plaintext";
  };

  const onEditorChange = (newValue) => {
    updateFileContent(newValue, fileName, language);
  };

  const goBack = () => {
    navigate("/dashboard/fileSelection");
  };

  const handleSave = () => {
    if (!fileName) {
      alert("Please select a file to save.");
      return;
    }

    // ✅ FIXED: get latest editor content instead of possibly stale fileContent
    const contentToSave = editorRef.current?.getValue() || fileContent;

    const blob = new Blob([contentToSave], {
      type: "text/plain;charset=utf-8",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  return (
    <Box>
      <HStack spacing={4} mb={6} align="center">
        <Button leftIcon={<FiArrowLeft />} colorScheme="teal" onClick={goBack}>
          Back to File Selection
        </Button>
        <Text fontSize="2xl" fontWeight="bold" color="teal.600">
          Editing {fileName}
        </Text>
      </HStack>

      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector language={language} onSelect={setLanguage} />
          <Editor
            height="80vh"
            theme="vs-dark"
            language={language}
            value={fileContent}
            onMount={onMount}
            onChange={onEditorChange}
          />
        </Box>
        <Output
          editorRef={editorRef}
          language={language}
          isLoading={isLoading}
        />
      </HStack>

      <Button
        mt={4}
        colorScheme="blue"
        onClick={handleSave}
        isDisabled={!fileContent}
      >
        Save Progress
      </Button>
    </Box>
  );
};

export default CodeEditorPage;
