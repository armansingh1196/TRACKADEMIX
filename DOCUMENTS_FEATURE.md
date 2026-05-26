# 📄 Documents Feature — Trackademics

## Overview

The **Documents** module is a centralized document distribution system that enables administrators (HOD) and professors to upload and share academic files with students. Students can access marksheets, exam schedules, exam forms, and important institutional documents from a dedicated, filterable library within their dashboard.

---

## Feature Highlights

| Capability | Description |
|---|---|
| **File Upload** | HOD and professors can upload PDFs, DOCs, Excel sheets, and images |
| **Category System** | Documents are tagged into 5 categories for easy organization |
| **Class Targeting** | Files can be targeted to specific classes or made available globally |
| **Student Access** | Students see only documents relevant to their class (+ general documents) |
| **Role-Based Access** | Admin/Teachers can upload & delete; Students can view & download |
| **Supabase Storage** | Files stored securely in Supabase Storage with public URL access |

---

## Document Categories

| Category | Color | Use Case |
|---|---|---|
| 🟡 **Exam Schedule** | Amber | Exam timetables, date sheets |
| 🔵 **Exam Form** | Blue | Exam registration forms, application forms |
| 🔴 **Important Notice** | Red | Urgent circulars, deadline notifications |
| 🟣 **Syllabus** | Purple | Subject syllabi, course outlines |
| ⚪ **General** | Gray | Miscellaneous documents |

---

## Secure Marksheets (Bulk Upload)

In addition to general documents, Trackademics includes a highly secure, automated flow for distributing confidential marksheets:

1. **Bulk Uploading**: Administrators and Teachers can use the **"Bulk Upload Marksheets"** tab. They simply drop multiple PDFs named by roll number (e.g., `2022027.pdf`), select the semester, and click upload.
2. **Auto-Mapping**: The backend automatically parses the roll numbers from the filenames and links each document directly to the respective student's UUID in the `personal_documents` table.
3. **Password-Protected Access**: Students accessing the **"My Marksheets"** tab are met with a secure gate. They must re-enter their Trackademics password to unlock the vault. The backend uses `bcrypt` to verify the hash before transmitting any confidential files.

---

## Database Architecture

### `documents` (Shared Repository)

```sql
CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    category text NOT NULL DEFAULT 'General',
    description text,
    file_url text NOT NULL,
    file_name text,
    file_size bigint,
    uploaded_by text,
    uploader_role text DEFAULT 'Admin',
    admin_id uuid NOT NULL,
    target_class uuid REFERENCES public.sclasses(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);
```

### Storage

- **Bucket Name:** `documents`
- **Access:** Public bucket (read access without auth, upload requires signed URL)
- **File Path Pattern:** `uploads/<timestamp>_<filename>`

### API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/DocumentUpload` | Save document metadata | Admin, Teacher |
| `POST` | `/DocumentUploadUrl` | Get signed upload URL for Supabase Storage | Admin, Teacher |
| `GET` | `/DocumentList/:adminId` | List all documents for institution | Admin, Teacher |
| `GET` | `/DocumentListStudent/:adminId/:classId` | List documents for a student's class | Student |
| `DELETE` | `/Document/:id` | Delete a single document | Admin, Teacher |
| `DELETE` | `/Documents/:adminId` | Delete all documents | Admin |

---

## File Structure

```
backend/
├── controllers/
│   └── document-controller.js     # CRUD operations + signed URL
├── routes/
│   └── route.js                   # Document routes added
└── database/
    └── complete_schema.sql        # Reference schema

frontend/src/pages/
├── admin/
│   ├── documentRelated/
│   │   └── ManageDocuments.js     # Admin upload & management page
│   ├── SideBar.js                 # Updated with Documents nav item
│   └── AdminDashboard.js          # Updated with /Admin/documents route
├── teacher/
│   ├── TeacherDocuments.js        # Teacher upload & management page
│   ├── TeacherSideBar.js          # Updated with Documents nav item
│   └── TeacherDashboard.js        # Updated with /Teacher/documents route
└── student/
    ├── StudentDocuments.js        # Student document library (read-only)
    ├── StudentSideBar.js          # Updated with Documents nav item
    └── StudentDashboard.js        # Updated with /Student/documents route
```

---

## User Experience

### Admin (HOD) View
- Full upload form with title, category, optional class targeting, and file drop zone
- Complete list of all uploaded documents with delete controls
- Category filter dropdown to quickly find specific document types

### Teacher (Professor) View
- Upload form scoped to their assigned class
- View and manage documents they've uploaded
- Same glassmorphic design as admin but with teacher-specific context

### Student View
- **Category summary cards** at the top showing document counts per type
- Clickable category cards to filter documents
- Each document shows title, category chip, upload date, uploader name, and file size
- **Download button** on each document for direct file access
- Only sees documents targeted to their class + globally shared documents

---

## Design System

The Documents pages follow the established **Frosted Night** glassmorphism aesthetic:

- `GlassCard` — Semi-transparent cards with blur backdrop and purple-tinted borders
- `IconBadge` — Rounded icon containers with subtle gradient backgrounds
- `CategoryStripe` — Color-coded left border on each document card
- `DropZone` — Dashed-border file selection area with hover effects
- `fadeUp` — Consistent entry animation across all elements
- Scrollable document lists with custom purple-tinted scrollbars

---

## Supported File Types

| Type | Extensions |
|---|---|
| Documents | `.pdf`, `.doc`, `.docx` |
| Spreadsheets | `.xls`, `.xlsx` |
| Images | `.jpg`, `.jpeg`, `.png`, `.webp` |

**Maximum file size:** 10MB (configurable via Supabase Storage bucket settings)
