import React, { useState } from "react";
import { Box, Button, Text, Center, VStack, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // React Router's navigate hook
import { FiUpload } from "react-icons/fi"; // For upload icon

const FileSelectionPage = () => {
  const [fileName, setFileName] = useState(""); // File name state
  const [fileContent, setFileContent] = useState(""); // File content state
  const [proceedToNavigate, setProceedToNavigate] = useState(false);  // State to show the "Proceed" button
  const navigate = useNavigate(); // For navigating to the code editor page
  const toast = useToast(); // For showing notifications

  // Handle file selection using the File System API
  const handleFileSelect = async () => {
    try {
      let file;

      // Use the File System API if supported
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{
            description: 'Programming Files',
            accept: {
              'application/javascript': ['.js'],
              'application/typescript': ['.ts'],
              'application/python': ['.py'],
              'application/java': ['.java'],
              'application/csharp': ['.cs'],
              'application/php': ['.php'],
              'text/html': ['.html'],
              'text/css': ['.css'],
              'text/plain': ['.txt'],
            },
          }]
        });

        file = await fileHandle.getFile(); // Fetch the selected file
      } else {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".js, .ts, .py, .java, .cs, .php, .html, .css, .txt";
        input.onchange = async (e) => {
          file = e.target.files[0];
        };
        input.click();
      }

      if (file) {
        const content = await file.text();

        // Check if the file is empty and inform the user
        if (content.trim() === "") {
          toast({
            title: "Empty file",
            description: "The file you selected is empty. You can still proceed, but make sure to add content.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }

        // Store file content in localStorage
        localStorage.setItem("fileName", file.name);
        localStorage.setItem("fileContent", content);

        setFileName(file.name);
        setFileContent(content);

        toast({
          title: "File selected",
          description: `You selected ${file.name}. Now proceed to edit.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Set state to show the proceed button
        setProceedToNavigate(true);
      }
    } catch (err) {
      console.error("File selection error:", err);
      toast({
        title: "Error",
        description: "An error occurred while selecting the file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle the "Proceed to Code Editor" button click
  const handleProceedClick = () => {
    navigate("/dashboard/codeEditor");
  };

  return (
    <Box bg="gray.50" minH="100vh" py="6">
      <Center>
        <VStack
          spacing={6}
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          w={["90%", "80%", "60%"]}
        >
          <Text fontSize="2xl" fontWeight="bold" color="teal.600">
            Select a file to edit:
          </Text>

          <Box w="full">
            <Button
              leftIcon={<FiUpload />}
              colorScheme="teal"
              variant="solid"
              w="full"
              size="lg"
              _hover={{ bg: "teal.500" }}
              onClick={handleFileSelect} // Trigger file selection on button click
            >
              Upload File
            </Button>
          </Box>

          {fileName && (
            <Text fontSize="lg" color="gray.600" mt={4}>
              Selected file:{" "}
              <Text as="span" fontWeight="bold" color="teal.500">
                {fileName}
              </Text>
            </Text>
          )}

          {/* Show "Proceed" button if a file is selected */}
          {proceedToNavigate && (
            <Box w="full">
              <Button
                colorScheme="blue"
                size="md"
                w="full"
                onClick={handleProceedClick} // Trigger navigation on button click
                _hover={{ bg: "blue.500" }}
              >
                Proceed to Code Editor
              </Button>
            </Box>
          )}
        </VStack>
      </Center>
    </Box>
  );
};

export default FileSelectionPage;
