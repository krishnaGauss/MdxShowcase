import { type User, type InsertUser, type MdxDocument, type InsertMdxDocument, type QuestionResponse, type InsertQuestionResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // MDX Documents
  getMdxDocument(id: string): Promise<MdxDocument | undefined>;
  getAllMdxDocuments(): Promise<MdxDocument[]>;
  createMdxDocument(doc: InsertMdxDocument): Promise<MdxDocument>;
  updateMdxDocument(id: string, doc: Partial<InsertMdxDocument>): Promise<MdxDocument | undefined>;
  deleteMdxDocument(id: string): Promise<boolean>;
  
  // Question Responses
  getQuestionResponses(documentId: string, questionId: string): Promise<QuestionResponse[]>;
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  getResponseCounts(documentId: string, questionId: string): Promise<{ yes: number; no: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mdxDocuments: Map<string, MdxDocument>;
  private questionResponses: Map<string, QuestionResponse>;

  constructor() {
    this.users = new Map();
    this.mdxDocuments = new Map();
    this.questionResponses = new Map();
    
    // Create default document
    const defaultDoc: MdxDocument = {
      id: "default",
      title: "Interactive MDX Showcase",
      content: `# Interactive MDX Showcase

Welcome to the **MDX Interactive Platform**! This editor supports real-time preview with custom shortcodes.

[interactivesection]
## Try Our Interactive Features

This section is automatically highlighted and animated when you use the \`[interactivesection]\` shortcode.
[/interactivesection]

## Interactive Questions

[yesno-question question="Do you find this platform useful?"]

[yesno-question question="Would you like to learn more about MDX?"]

## Standard Markdown

You can still use regular markdown features:

- **Bold text**
- *Italic text*
- \`Code snippets\`
- [Links](https://example.com)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.mdxDocuments.set("default", defaultDoc);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMdxDocument(id: string): Promise<MdxDocument | undefined> {
    return this.mdxDocuments.get(id);
  }

  async getAllMdxDocuments(): Promise<MdxDocument[]> {
    return Array.from(this.mdxDocuments.values());
  }

  async createMdxDocument(doc: InsertMdxDocument): Promise<MdxDocument> {
    const id = randomUUID();
    const now = new Date();
    const document: MdxDocument = {
      ...doc,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.mdxDocuments.set(id, document);
    return document;
  }

  async updateMdxDocument(id: string, doc: Partial<InsertMdxDocument>): Promise<MdxDocument | undefined> {
    const existing = this.mdxDocuments.get(id);
    if (!existing) return undefined;
    
    const updated: MdxDocument = {
      ...existing,
      ...doc,
      updatedAt: new Date(),
    };
    this.mdxDocuments.set(id, updated);
    return updated;
  }

  async deleteMdxDocument(id: string): Promise<boolean> {
    return this.mdxDocuments.delete(id);
  }

  async getQuestionResponses(documentId: string, questionId: string): Promise<QuestionResponse[]> {
    return Array.from(this.questionResponses.values()).filter(
      (response) => response.documentId === documentId && response.questionId === questionId
    );
  }

  async createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse> {
    const id = randomUUID();
    const questionResponse: QuestionResponse = {
      ...response,
      id,
      createdAt: new Date(),
      sessionId: response.sessionId || null,
    };
    this.questionResponses.set(id, questionResponse);
    return questionResponse;
  }

  async getResponseCounts(documentId: string, questionId: string): Promise<{ yes: number; no: number }> {
    const responses = await this.getQuestionResponses(documentId, questionId);
    return {
      yes: responses.filter(r => r.response === 'yes').length,
      no: responses.filter(r => r.response === 'no').length,
    };
  }
}

export const storage = new MemStorage();
