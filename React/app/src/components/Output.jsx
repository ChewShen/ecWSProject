import {Box,Text,Button,useToast,Image} from "@chakra-ui/react"
import { executeCode } from "../api";
import { useState } from "react";


const Output = ({ editorRef, language }) => {
    const toast = useToast();
    const [output, setOutput] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);   
    const [isError,setIsError]=useState(false);

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue()
        if (!sourceCode) return;
        try{
            setIsLoading(true);
            const {run:result} = await executeCode(language, sourceCode);
            setOutput(result.output.split("\n"));
            result.stderr ? setIsError(true) : setIsError(false);
        }catch (error){
            console.log(error);
            toast({
                title:"An error occurred",
                description:error.message || "Unable to run code",
                status:"error",
                duration: 6000,
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box w='50%'>
            <Text mb={2} fontSize="lg"> Output </Text>
            <Button variant="outline" colorScheme="green" mb={4} onClick={runCode}
            isLoading={isLoading}
            > 
                {isLoading ? (
                <Image
                    src="/images/loading.gif" // Path to your loading GIF in public folder
                    alt="loading..."
                    boxSize="45px"  
                    display="inline-block"
                />
                ) : ("Run Code")}
            </Button>
            <Box 
                height="50vh"
                p={2}
                color={ isError ? "red.500" : ""}
                border="1px solid"
                borderRadius={4}
                borderColor={
                    isError ? "red.500" : "#333"
                }
                
                >
                {output ? 
                    output.map(
                        (line, i) => <Text key = {i}> {line} </Text>
                    ): "Execute the code using the Run button above"}
            </Box>
        </Box>
       
    )
}


export default Output