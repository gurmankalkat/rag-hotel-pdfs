"use client";

import { useState } from "react";
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
  isGenerated?: boolean;
  loading?: boolean; // Track loading state
}

export default function Proposals() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    if (newFiles.length === 0) return;

    setFiles((prevFiles) => [
      ...prevFiles,
      ...newFiles.map((file) => ({
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified).toLocaleDateString(),
        url: URL.createObjectURL(file),
        isGenerated: false,
        loading: false, // Initially, not loading
      })),
    ]);

    console.log("Uploaded files:", newFiles);
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.click();
    }
  };

  const generateValues = async (index: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, loading: true } : file
      )
    );

    const file = files[index];
    try {
      const response = await axios.post("http://localhost:5001/generate", {
        name: file.name,
        size: file.size,
      });

      console.log("Returned JSON from Backend:", response.data);

      const {
        final_totals = [],
        explanations = [], // Default to empty array if undefined
      } = response.data;

      const hasData = final_totals.length && explanations.length;

      if (!hasData) {
        console.error("Incomplete data received from backend:", response.data);
        return;
      }

      const updatedFile = {
        ...file,
        totalQuote: final_totals[0] || "-",
        meetingRoomTotal: final_totals[1] || "-",
        sleepingRoomTotal: final_totals[2] || "-",
        totalQuoteExplanation: explanations[0] || "No explanation available",
        meetingRoomExplanation: explanations[1] || "No explanation available",
        sleepingRoomExplanation: explanations[2] || "No explanation available",
        isGenerated: true,
        loading: false, // Set loading to false after processing
      };

      setFiles((prevFiles) =>
        prevFiles.map((f, i) => (i === index ? updatedFile : f))
      );
    } catch (error) {
      console.error("Error generating values:", error);

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
                      <HoverCardContent className="max-w-[400px] min-w-[200px] max-h-[300px] overflow-auto p-4 shadow-md rounded-lg bg-white">
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
                      <HoverCardContent>
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
                      <HoverCardContent>
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
