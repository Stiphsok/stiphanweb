import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const genId = () => crypto.randomUUID();

export const platformEnum = pgEnum("platform", [
  "youtube",
  "facebook",
  "instagram",
  "tiktok",
  "other",
]);

export const downloadStatusEnum = pgEnum("download_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const formatEnum = pgEnum("media_format", ["mp4", "mp3"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(genId),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarColor: text("avatar_color").notNull().default("#6d5efc"),
  plan: text("plan").notNull().default("مجاني"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const folders = pgTable("folders", {
  id: text("id").primaryKey().$defaultFn(genId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6d5efc"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const downloads = pgTable("downloads", {
  id: text("id").primaryKey().$defaultFn(genId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
  sourceUrl: text("source_url").notNull(),
  platform: platformEnum("platform").notNull().default("other"),
  title: text("title").notNull(),
  author: text("author"),
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  quality: text("quality").notNull().default("720p"),
  format: formatEnum("format").notNull().default("mp4"),
  fileSizeMb: real("file_size_mb").notNull().default(0),
  status: downloadStatusEnum("status").notNull().default("queued"),
  progress: integer("progress").notNull().default(0),
  isFavorite: boolean("is_favorite").notNull().default(false),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const usersRelations = relations(users, ({ many }) => ({
  downloads: many(downloads),
  folders: many(folders),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, { fields: [folders.userId], references: [users.id] }),
  downloads: many(downloads),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, { fields: [downloads.userId], references: [users.id] }),
  folder: one(folders, { fields: [downloads.folderId], references: [folders.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;
