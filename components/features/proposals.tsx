"use client";

import { useState, useEffect } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"; // Hovercard components
import { supabase } from "@/lib/supabase";

// Define an interface for the file object
interface UploadedFile {
  name: string;
  size: number;
  lastModified: string;
  url: string;
  totalQuote?: string;
  meetingRoomTotal?: string;
  sleepingRoomTotal?: string;
  totalQuoteExplanation?: string;
  meetingRoomExplanation?: string;
  sleepingRoomExplanation?: string;
  isGenerated: boolean;
  loading?: boolean; // Track loading state
}

export default function Proposals() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  /*
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("proposals").select("*");
      if (error) {
        console.error("Error fetching data from Supabase:", error);
      } else {
        console.log("Fetched data from Supabase:", data);

        // Map the data to match the `UploadedFile` interface
        const fetchedFiles = data.map((row) => ({
          id: row.id,
          name: row.name,
          url: row.url,
          totalQuote: row.total_quote,
          meetingRoomTotal: row.meeting_room_total,
          sleepingRoomTotal: row.sleeping_room_total,
          totalQuoteExplanation: row.total_quote_explanation,
          meetingRoomExplanation: row.meeting_room_explanation,
          sleepingRoomExplanation: row.sleeping_room_explanation,
          isGenerated: true, // Since these are from the database, assume generated
          loading: false, // Not loading anymore
        }));

        // Update state with fetched files
        setFiles(fetchedFiles);
      }
    };

    fetchData();
  }, []);
  */
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    if (newFiles.length === 0) return;
  
    const uploadedFiles = await Promise.all(
      newFiles.map(async (file) => {
        try {
          // Upload file to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("proposals")
            .upload(`uploads/${file.name}`, file);
  
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            return null; // Return null for failed uploads
          }
  
          // Get the public URL of the uploaded file
          const { data: publicUrlData } = supabase.storage
            .from("proposals")
            .getPublicUrl(`uploads/${file.name}`);
  
          if (!publicUrlData.publicUrl) {
            console.error("Error fetching public URL for file");
            return null;
          }
  
          return {
            name: file.name,
            size: file.size,
            lastModified: new Date(file.lastModified).toLocaleDateString(),
            url: publicUrlData.publicUrl, // Use the returned public URL
            isGenerated: false,
            loading: false,
          } as UploadedFile; // Explicitly cast to UploadedFile
        } catch (error) {
          console.error("Error processing file upload:", error);
          return null; // Return null for failed uploads
        }
      })
    );
  
    // Ensure we filter out `null` values and cast the result to UploadedFile[]
    const validUploadedFiles: UploadedFile[] = uploadedFiles.filter(
      (file): file is UploadedFile => file !== null
    );
  
    setFiles((prevFiles) => [...prevFiles, ...validUploadedFiles]);
  };  
  
  const triggerFileInput = () => {
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.click();
    }
  };

  const generateValues = async (index: number) => {
    // Set loading state for the specific file
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, loading: true } : file
      )
    );
  
    // Access the file from the state
    const file = files[index];
  
    try {
      // Send the file's public URL to the backend for processing
      const response = await axios.post("http://localhost:5001/generate", {
        name: file.name,
        url: file.url, // Pass the public URL to the backend
      });
  
      console.log("Returned JSON from Backend:", response.data);
  
      const { final_totals = [], explanations = [] } = response.data;
  
      if (final_totals.length === 0 || explanations.length === 0) {
        throw new Error("Incomplete data received from backend");
      }
  
      // Update the file with the generated values
      const updatedFile = {
        ...file,
        totalQuote: final_totals[0] || "-",
        meetingRoomTotal: final_totals[1] || "-",
        sleepingRoomTotal: final_totals[2] || "-",
        totalQuoteExplanation: explanations[0] || "No explanation available",
        meetingRoomExplanation: explanations[1] || "No explanation available",
        sleepingRoomExplanation: explanations[2] || "No explanation available",
        isGenerated: true,
        loading: false,
      };
  
      // Update the state with the new values
      setFiles((prevFiles) =>
        prevFiles.map((f, i) => (i === index ? updatedFile : f))
      );
  
      // Save the generated values to Supabase
      const { error } = await supabase.from("proposals").insert([
        {
          name: updatedFile.name,
          url: updatedFile.url,
          total_quote: updatedFile.totalQuote,
          meeting_room_total: updatedFile.meetingRoomTotal,
          sleeping_room_total: updatedFile.sleepingRoomTotal,
          total_quote_explanation: updatedFile.totalQuoteExplanation,
          meeting_room_explanation: updatedFile.meetingRoomExplanation,
          sleeping_room_explanation: updatedFile.sleepingRoomExplanation,
        },
      ]);
  
      if (error) {
        console.error("Error saving to Supabase:", error);
      } else {
        console.log("Data saved to Supabase:", updatedFile);
      }
    } catch (error) {
      console.error("Error generating values:", error);
  
      // Reset loading state in case of an error
      setFiles((prevFiles) =>
        prevFiles.map((f, i) =>
          i === index ? { ...f, loading: false } : f
        )
      );
    }
  };
  

  return (
    <Card>
      <CardHeader className="px-7 relative">
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute top-0 right-0"
            onClick={triggerFileInput}
          >
            <FileUp />
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <CardTitle className="mb-2">Proposals & Quotes</CardTitle>
          <CardDescription>
            Upload a PDF to store event proposals and their quotes directly in your dashboard.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proposal</TableHead>
              <TableHead className="hidden sm:table-cell">Total Quote</TableHead>
              <TableHead className="hidden sm:table-cell">Meeting Room Total</TableHead>
              <TableHead className="hidden sm:table-cell">Sleeping Room Total</TableHead>
              <TableHead className="hidden md:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, index) => (
              <TableRow key={index}>
                <TableCell>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {file.name}
                  </a>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {file.loading ? (
                    "Loading..."
                  ) : (
                    <HoverCard>
                      <HoverCardTrigger>
                        <span>{file.totalQuote || "-"}</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="max-w-[4j 00px] min-w-[200px] max-h-[300px] overflow-auto p-4 shadow-md rounded-lg bg-white">
                        {file.totalQuoteExplanation || "No explanation available"}
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {file.loading ? (
                    "Loading..."
                  ) : (
                    <HoverCard>
                      <HoverCardTrigger>
                        <span>{file.meetingRoomTotal || "-"}</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="max-w-[4j 00px] min-w-[200px] max-h-[300px] overflow-auto p-4 shadow-md rounded-lg bg-white">
                        {file.meetingRoomExplanation || "No explanation available"}
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {file.loading ? (
                    "Loading..."
                  ) : (
                    <HoverCard>
                      <HoverCardTrigger>
                        <span>{file.sleepingRoomTotal || "-"}</span>
                      </HoverCardTrigger>
                      <HoverCardContent className="max-w-[4j 00px] min-w-[200px] max-h-[300px] overflow-auto p-4 shadow-md rounded-lg bg-white">
                        {file.sleepingRoomExplanation || "No explanation available"}
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {!file.isGenerated && !file.loading && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateValues(index)}
                    >
                      Generate Totals
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
