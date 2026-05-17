# Sample Outputs

## Example user object

```json
{
  "id": "clx9abc123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Example note list item

```json
{
  "note_id": "clx9note001",
  "title": "Project Planning",
  "tags": ["work", "meeting"],
  "category": "work",
  "archived": false,
  "isPublic": false,
  "shareId": null,
  "updated_at": "2026-05-14T12:00:00.000Z"
}
```

## AI generation response

**POST** `/api/notes/:id/generate-summary`

```json
{
  "summary": "Weekly project planning discussion covering sprint goals, UI mockups, and API structure review. Team aligned on deliverables for the next two weeks.",
  "action_items": [
    "Prepare UI mockups",
    "Review API structure",
    "Schedule follow-up with design team"
  ],
  "suggested_title": "Sprint Planning Notes",
  "note_id": "clx9note001"
}
```

## Public shared note response

**GET** `/api/shared/:shareId`

```json
{
  "title": "Sprint Planning Notes",
  "content": "Discussed Q2 roadmap...\n\n- UI mockups due Friday\n- API review Monday",
  "tags": ["work", "meeting"],
  "category": "work",
  "author": "John Doe",
  "updated_at": "2026-05-14T12:00:00.000Z",
  "updated_at_formatted": "May 14, 2026",
  "summary": "Weekly project planning discussion...",
  "action_items": ["Prepare UI mockups", "Review API structure"]
}
```

## Insights dashboard response

**GET** `/api/insights`

```json
{
  "totalNotes": 12,
  "archivedNotes": 2,
  "recentlyEdited": [
    {
      "note_id": "clx9note001",
      "title": "Project Planning",
      "tags": ["work", "meeting"],
      "category": "work",
      "archived": false,
      "isPublic": true,
      "shareId": "abc123xyz",
      "updated_at": "2026-05-14T12:00:00.000Z"
    }
  ],
  "mostUsedTags": [
    { "tag": "work", "count": 5 },
    { "tag": "ideas", "count": 3 }
  ],
  "aiUsageStats": {
    "totalGenerations": 8,
    "thisWeek": 3,
    "lastGeneration": "2026-05-14T11:30:00.000Z"
  },
  "weeklyActivity": [
    { "day": "Mon", "count": 2 },
    { "day": "Tue", "count": 1 },
    { "day": "Wed", "count": 0 },
    { "day": "Thu", "count": 3 },
    { "day": "Fri", "count": 2 },
    { "day": "Sat", "count": 0 },
    { "day": "Sun", "count": 1 }
  ]
}
```

## Database schema

```prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  notes        Note[]
  aiUsages     AiUsage[]
}

model Note {
  id             String    @id @default(cuid())
  userId         String
  title          String
  content        String
  tags           String    // JSON array
  category       String
  archived       Boolean
  isPublic       Boolean
  shareId        String?   @unique
  aiSummary      String?
  aiActionItems  String?   // JSON array
  suggestedTitle String?
  updatedAt      DateTime  @updatedAt
}

model AiUsage {
  id        String   @id @default(cuid())
  userId    String
  noteId    String?
  type      String
  createdAt DateTime @default(now())
}
```
