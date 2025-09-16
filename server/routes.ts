import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMdxDocumentSchema, insertQuestionResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // MDX Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllMdxDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getMdxDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertMdxDocumentSchema.parse(req.body);
      const document = await storage.createMdxDocument(data);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const data = insertMdxDocumentSchema.partial().parse(req.body);
      const document = await storage.updateMdxDocument(req.params.id, data);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMdxDocument(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Question Responses
  app.post("/api/responses", async (req, res) => {
    try {
      const data = insertQuestionResponseSchema.parse(req.body);
      const response = await storage.createQuestionResponse(data);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  app.get("/api/responses/:documentId/:questionId/counts", async (req, res) => {
    try {
      const counts = await storage.getResponseCounts(req.params.documentId, req.params.questionId);
      res.json(counts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch response counts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
