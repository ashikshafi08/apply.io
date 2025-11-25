import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  json,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// user and profile

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  searchSessions: many(searchSessions),
  savedJobs: many(savedJobs),
  applications: many(applications),
}));

export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Resume data
  resumeUrl: text("resume_url"),
  resumeText: text("resume_text"),

  // Parsed/structured data (from AI)
  headline: text("headline"),
  summary: text("summary"),
  skills: json("skills").$type<string[]>().default([]),
  experience: json("experience")
    .$type<
      {
        title: string;
        company: string;
        duration: string;
        highlights: string[];
      }[]
    >()
    .default([]),
  education: json("education")
    .$type<{ school: string; degree: string; year: string }[]>()
    .default([]),

  // Preferences
  targetTitles: json("target_titles").$type<string[]>().default([]),
  targetLocations: json("target_locations").$type<string[]>().default([]),
  minSalary: integer("min_salary"),
  maxSalary: integer("max_salary"),
  remotePreference: text("remote_preference"), // "remote" | "hybrid" | "onsite" | "any"
  companySize: json("company_size").$type<string[]>().default([]),
  industries: json("industries").$type<string[]>().default([]),
  searchKeywords: json("search_keywords").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// companies

export const companies = pgTable("companies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  domain: text("domain").unique(),

  // Enrichment data
  description: text("description"),
  industry: text("industry"),
  size: text("size"), // "1-10", "11-50", "51-200", etc.
  founded: integer("founded"),
  headquarters: text("headquarters"),

  // URLs
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  careersUrl: text("careers_url"),
  logoUrl: text("logo_url"),

  // Funding info
  fundingStage: text("funding_stage"),
  isYC: boolean("is_yc").default(false),
  ycBatch: text("yc_batch"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
  contacts: many(contacts),
}));

// jobs

export const jobs = pgTable(
  "jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    externalId: text("external_id"),
    source: text("source").notNull(), // "greenhouse" | "lever" | "linkedin" | "indeed" | whatever else we want to add
    sourceUrl: text("source_url").notNull(),

    // Core info
    title: text("title").notNull(),
    description: text("description").notNull(),
    descriptionHtml: text("description_html"),

    companyId: text("company_id").references(() => companies.id),
    companyName: text("company_name").notNull(),

    // Location
    location: text("location"),
    isRemote: boolean("is_remote").default(false),

    // Compensation
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency"),
    salaryPeriod: text("salary_period"), // "yearly" | "hourly"

    // Classification
    employmentType: text("employment_type"), // "full-time" | "contract" | "part-time"
    seniorityLevel: text("seniority_level"), // "entry" | "mid" | "senior" | "lead" | "staff"
    department: text("department"),

    // AI-extracted data
    requiredSkills: json("required_skills").$type<string[]>().default([]),
    niceToHaveSkills: json("nice_to_have_skills").$type<string[]>().default([]),
    yearsExperience: integer("years_experience"),

    // Status
    isActive: boolean("is_active").default(true),
    postedAt: timestamp("posted_at"),
    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("jobs_source_external_id_unique").on(table.source, table.externalId),
    index("jobs_title_idx").on(table.title),
    index("jobs_company_name_idx").on(table.companyName),
    index("jobs_is_remote_idx").on(table.isRemote),
  ]
);

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  searchResults: many(searchSessionJobs),
  savedBy: many(savedJobs),
  applications: many(applications),
  contacts: many(contacts),
}));

// contacts

export const contacts = pgTable(
  "contacts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    companyId: text("company_id").references(() => companies.id),
    jobId: text("job_id").references(() => jobs.id),

    // Person info
    name: text("name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    title: text("title"),
    role: text("role"), // "hiring_manager" | "recruiter" | "founder" | "engineer"

    // Contact methods
    email: text("email"),
    emailConfidence: real("email_confidence"),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),

    // Source
    source: text("source"), // "apollo" | "hunter" | "linkedin" | "manual" | whatever else we want to add

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("contacts_company_id_idx").on(table.companyId),
    index("contacts_email_idx").on(table.email),
  ]
);

export const contactsRelations = relations(contacts, ({ one }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  job: one(jobs, {
    fields: [contacts.jobId],
    references: [jobs.id],
  }),
}));

// search sessions

export const searchSessions = pgTable("search_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Search parameters
  query: text("query").notNull(),
  parsedQuery: json("parsed_query").$type<{
    titles: string[];
    locations: string[];
    keywords: string[];
  }>(),

  // Results
  status: text("status").default("pending").notNull(), // "pending" | "running" | "completed" | "failed"
  totalFound: integer("total_found").default(0),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const searchSessionsRelations = relations(
  searchSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [searchSessions.userId],
      references: [users.id],
    }),
    jobs: many(searchSessionJobs),
  })
);

export const searchSessionJobs = pgTable(
  "search_session_jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    searchSessionId: text("search_session_id")
      .notNull()
      .references(() => searchSessions.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    // AI scoring
    fitScore: real("fit_score").notNull(), // 0-10
    fitReasons: json("fit_reasons").$type<string[]>().default([]),
    mismatches: json("mismatches").$type<string[]>().default([]),
  },
  (table) => [
    unique("search_session_jobs_unique").on(
      table.searchSessionId,
      table.jobId
    ),
  ]
);

export const searchSessionJobsRelations = relations(
  searchSessionJobs,
  ({ one }) => ({
    searchSession: one(searchSessions, {
      fields: [searchSessionJobs.searchSessionId],
      references: [searchSessions.id],
    }),
    job: one(jobs, {
      fields: [searchSessionJobs.jobId],
      references: [jobs.id],
    }),
  })
);

// user actions

export const savedJobs = pgTable(
  "saved_jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    // User tracking
    status: text("status").default("saved").notNull(), // "saved" | "interested" | "applied" | "interviewing" | "rejected" | "offer"
    notes: text("notes"),

    savedAt: timestamp("saved_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("saved_jobs_user_job_unique").on(table.userId, table.jobId)]
);

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));

export const applications = pgTable(
  "applications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),

    // Application tracking
    status: text("status").default("draft").notNull(), // "draft" | "applied" | "responded" | "interviewing" | "rejected" | "offer"
    appliedAt: timestamp("applied_at"),
    appliedVia: text("applied_via"), // "portal" | "email" | "linkedin" | "referral"

    // Notes & tracking
    notes: text("notes"),
    nextStep: text("next_step"),
    nextStepDate: timestamp("next_step_date"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("applications_user_job_unique").on(table.userId, table.jobId),
  ]
);

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  generatedContent: many(generatedContent),
}));

// generated content

export const generatedContent = pgTable("generated_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),

  type: text("type").notNull(), // "cover_letter" | "cold_email" | "linkedin_message" | "follow_up"

  // Content
  subject: text("subject"),
  body: text("body").notNull(),

  // Generation metadata
  prompt: text("prompt"),
  model: text("model"),

  // User actions
  isCopied: boolean("is_copied").default(false),
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedContentRelations = relations(generatedContent, ({ one }) => ({
  application: one(applications, {
    fields: [generatedContent.applicationId],
    references: [applications.id],
  }),
}));

// type exports

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type SearchSession = typeof searchSessions.$inferSelect;
export type NewSearchSession = typeof searchSessions.$inferInsert;
export type SavedJob = typeof savedJobs.$inferSelect;
export type NewSavedJob = typeof savedJobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type NewGeneratedContent = typeof generatedContent.$inferInsert;
