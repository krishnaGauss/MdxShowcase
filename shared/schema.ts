import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mdxDocuments = pgTable("mdx_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionResponses = pgTable("question_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => mdxDocuments.id).notNull(),
  questionId: text("question_id").notNull(),
  response: text("response").notNull(), // 'yes' or 'no'
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMdxDocumentSchema = createInsertSchema(mdxDocuments).pick({
  title: true,
  content: true,
});

export const insertQuestionResponseSchema = createInsertSchema(questionResponses).pick({
  documentId: true,
  questionId: true,
  response: true,
  sessionId: true,
});

export type InsertMdxDocument = z.infer<typeof insertMdxDocumentSchema>;
export type MdxDocument = typeof mdxDocuments.$inferSelect;
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;
export type QuestionResponse = typeof questionResponses.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
