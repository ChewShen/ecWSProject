import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";  // Assuming you have the language versions defined here

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVATE_COLOR = "blue.400";

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg">Language</Text>
      <Menu isLazy>
        <MenuButton as={Button} colorScheme="teal">
          {language} {/* Display selected language */}
        </MenuButton>
        <MenuList bg="#110c1b">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? "blue.400" : ""}  // Highlight selected language
              bg={lang === language ? "gray.900" : "transparent"}
              _hover={{
                color: ACTIVATE_COLOR,
                bg: "gray.900"
              }}
              onClick={() => onSelect(lang)} // Call onSelect to update language
            >
              {lang} <Text as="span" color="gray.600" fontSize="sm">({version})</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
