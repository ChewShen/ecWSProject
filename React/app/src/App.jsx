import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import FileSelectionPage from "./components/FileSelectionPage";  // Your file selection page
import CodeEditorPage from "./components/CodeEditorPage";  // Your code editor page
import { EditorProvider } from './components/EditorContext';  // Correct relative path


function App() {
  return (
    <EditorProvider> {/* Wrap the entire app or specific parts that need access to context */}
      <Router>
        <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
          {/* Define routes for file selection and code editor pages */}
          <Routes>
            <Route path="/dashboard/fileSelection" element={<FileSelectionPage />} />
            <Route path="/dashboard/codeEditor" element={<CodeEditorPage />} />
          </Routes>
        </Box>
      </Router>
    </EditorProvider>
  );
}

export default App;
