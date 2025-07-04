import React, { createContext, useState, useContext, useEffect } from "react";

// Create a context for the editor
const EditorContext = createContext();

export const useEditorContext = () => useContext(EditorContext);

export const EditorProvider = ({ children }) => {
  const [fileContent, setFileContent] = useState(""); // Content of the file
  const [fileName, setFileName] = useState(""); // Name of the file
  const [language, setLanguage] = useState("plaintext"); // Language of the editor

  useEffect(() => {
    // Check sessionStorage for content on initial load
    const savedFileName = sessionStorage.getItem("fileName");
    const savedFileContent = sessionStorage.getItem("fileContent");
    const savedLanguage = sessionStorage.getItem("language");

    if (savedFileName && savedFileContent) {
      setFileName(savedFileName);
      setFileContent(savedFileContent);
      setLanguage(savedLanguage || "plaintext");
    }
  }, []);

  // Function to update file content and related information
  const updateFileContent = (newContent, name, lang) => {
    setFileContent(newContent); // Ensure setFileContent is called here
    setFileName(name);
    setLanguage(lang);
    sessionStorage.setItem("fileName", name);
    sessionStorage.setItem("fileContent", newContent);
    sessionStorage.setItem("language", lang);
  };

  return (
    <EditorContext.Provider value={{ fileContent, fileName, language, setLanguage, setFileName, setFileContent, updateFileContent }}>
      {children}
    </EditorContext.Provider>
  );
};
