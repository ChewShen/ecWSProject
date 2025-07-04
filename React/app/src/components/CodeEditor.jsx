import { useState, useEffect, useRef } from "react";
import { Box, Text, HStack, Button, Input } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useLocation, useNavigate } from "react-router-dom"; // To access the file passed via state
import LanguageSelector from "./LanguageSelector";
//import { CODE_SNIPPETS } from "../constants"; // For default snippets (optional)
import Output from "./Output"; // The Output component to show the result

const CodeEditorPage = () => {
  const location = useLocation(); // Access the state passed from the previous page
  const navigate = useNavigate();
  const editorRef = useRef();
  const [fileContent, setFileContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState(""); // State to store the file name for saving

  // On mount, set editor focus
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  // Check file passed through location.state and load it
  useEffect(() => {
    if (location.state && location.state.file) {
      const file = location.state.file;
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result;
        setFileContent(content);

        // Extract file extension and set the language mode for the Monaco editor
        const fileExtension = file.name.split(".").pop();
        setLanguage(getLanguageFromExtension(fileExtension));
        setFileName(file.name); // Set the file name for saving
      };

      reader.readAsText(file); // Read the file as text
    } else {
      // If no file is passed in location.state, navigate back to file selection page
      navigate("/files");
    }
  }, [location.state, navigate]);

  // Function to map file extensions to language modes
  const getLanguageFromExtension = (extension) => {
    const extensionMap = {
      js: "javascript",
      py: "python",
      java: "java",
      rb: "ruby",
      c: "c",
      cpp: "cpp",
      html: "html",
      css: "css",
    };
    return extensionMap[extension] || "plaintext"; // Default to plaintext if no match
  };

  const onSelectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    //setFileContent(CODE_SNIPPETS[selectedLanguage] || ""); // Use default code snippets if available
  };

  // Function to handle saving the file
  const handleSave = () => {
    // If no file is selected or specified, prompt the user for a name
    if (!fileName) {
      alert("Please select a file to save.");
      return;
    }

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // Save as the original file name
    link.click(); // Trigger the download
  };

  return (
    <Box>
      <Text fontSize="2xl" mb={4}>
        Editing File: {location.state?.file?.name}
      </Text>

      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelectLanguage} />
          <Editor
            height="80vh"
            theme="vs-dark"
            language={language}
            value={fileContent}
            onMount={onMount}
            onChange={(newValue) => setFileContent(newValue)} // Update the content in the editor
          />
        </Box>
        <Output editorRef={editorRef} language={language} isLoading={isLoading} />
      </HStack>

      {/* Save Button */}
      <Button
        mt={4}
        colorScheme="blue"
        onClick={handleSave}
        isDisabled={!fileContent} // Disable the button if there is no content to save
      >
        Save Progress
      </Button>
    </Box>
  );
};

export default CodeEditorPage;
