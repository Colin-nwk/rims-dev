# API Layer Documentation

This document covers how to use the API layer for making HTTP requests with React Query.

## Quick Start

### 1. Create a Service

```typescript
// src/services/documentService.ts
import { createService, createQueryHooks } from "../lib/api";
import { Document } from "../types";

// Define DTOs (optional, defaults to Partial<T>)
interface CreateDocumentDTO {
  title: string;
  category: string;
  file?: File;
}

interface UpdateDocumentDTO {
  title?: string;
  category?: string;
}

// Create service
export const documentService = createService<
  Document,
  CreateDocumentDTO,
  UpdateDocumentDTO
>("/documents");

// Generate hooks
export const {
  useList: useDocuments,
  useById: useDocument,
  useCreate: useCreateDocument,
  useUpdate: useUpdateDocument,
  usePatch: usePatchDocument,
  useDelete: useDeleteDocument,
  useUpload: useUploadDocument,
  useUploadForItem: useUploadDocumentFile,
  useCreateWithFiles: useCreateDocumentWithFile,
  useUpdateWithFiles: useUpdateDocumentWithFile,
  queryKey: documentQueryKey,
} = createQueryHooks(documentService, "documents");
```

---

## Available Service Methods

| Method                                                   | Description                   |
| -------------------------------------------------------- | ----------------------------- |
| `getAll(options?, filters?)`                             | Get paginated list            |
| `getById(id)`                                            | Get single item               |
| `create(data)`                                           | Create new item (JSON)        |
| `update(id, data)`                                       | Full update (JSON)            |
| `patch(id, data)`                                        | Partial update (JSON)         |
| `delete(id)`                                             | Delete item                   |
| `upload(files, options?, endpoint?)`                     | Upload file(s)                |
| `uploadForItem(id, files, options?)`                     | Upload for specific item      |
| `createWithFiles(data, files, fieldName?, options?)`     | Create with files (multipart) |
| `updateWithFiles(id, data, files, fieldName?, options?)` | Update with files (multipart) |

---

## Using Hooks

### List with Pagination & Filters

```typescript
function DocumentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useDocuments(
    // QueryOptions
    { page, per_page: 10, search, sort_by: "created_at", sort_order: "desc" },
    // Filters
    { status: "approved", category: ["ID", "Certificate"] }
  );

  // keepPreviousData ensures no flicker during pagination
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        data?.data.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
      )}
      <Pagination
        current={data?.meta.current_page}
        total={data?.meta.last_page}
        onChange={setPage}
        loading={isFetching}
      />
    </div>
  );
}
```

### Get Single Item

```typescript
function DocumentDetail({ id }: { id: string }) {
  const { data, isLoading, error } = useDocument(id);

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return <div>{data?.data.title}</div>;
}
```

### Create (JSON)

```typescript
function CreateForm() {
  const create = useCreateDocument();

  const handleSubmit = (formData: CreateDocumentDTO) => {
    create.mutate(formData, {
      onSuccess: () => toast.success("Created!"),
      onError: (error) => toast.error(error.message),
    });
  };

  return <Form onSubmit={handleSubmit} loading={create.isPending} />;
}
```

### Update (JSON)

```typescript
function EditForm({ id }: { id: string }) {
  const update = useUpdateDocument();

  const handleSubmit = (data: UpdateDocumentDTO) => {
    update.mutate(
      { id, data },
      {
        onSuccess: () => toast.success("Updated!"),
      }
    );
  };

  return <Form onSubmit={handleSubmit} loading={update.isPending} />;
}
```

### Delete

```typescript
function DeleteButton({ id }: { id: string }) {
  const remove = useDeleteDocument();

  return (
    <button onClick={() => remove.mutate(id)} disabled={remove.isPending}>
      {remove.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

---

## File Uploads

### Upload Only

```typescript
function UploadForm() {
  const [progress, setProgress] = useState(0);
  const upload = useUploadDocument();

  const handleUpload = (files: FileList) => {
    upload.mutate({
      files: Array.from(files),
      options: { onProgress: setProgress },
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleUpload(e.target.files!)}
      />
      {upload.isPending && <ProgressBar value={progress} />}
    </div>
  );
}
```

### Create with File

```typescript
function CreateWithFileForm() {
  const [progress, setProgress] = useState(0);
  const create = useCreateDocumentWithFile();

  const handleSubmit = (data: CreateDocumentDTO, file: File) => {
    create.mutate({
      data,
      files: file,
      fileFieldName: "document", // defaults to 'file'
      options: { onProgress: setProgress },
    });
  };

  return (
    <Form
      onSubmit={handleSubmit}
      loading={create.isPending}
      progress={progress}
    />
  );
}
```

### Update with File

```typescript
function UpdateWithFileForm({ id }: { id: string }) {
  const update = useUpdateDocumentWithFile();

  const handleSubmit = (data: UpdateDocumentDTO, file: File | null) => {
    if (file) {
      update.mutate({ id, data, files: file });
    }
  };

  return <Form onSubmit={handleSubmit} loading={update.isPending} />;
}
```

---

## Manual Cache Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query";
import { documentQueryKey } from "../services/documentService";

function SomeComponent() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [documentQueryKey] });
  };

  const refreshOne = (id: string) => {
    queryClient.invalidateQueries({
      queryKey: [documentQueryKey, "detail", id],
    });
  };
}
```

---

## Custom Query Options

```typescript
const { data } = useDocuments(
  { page: 1 },
  { status: "pending" },
  {
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 30, // Poll every 30s
    enabled: isReady, // Conditional fetching
  }
);
```

---

## Error Handling

Errors are typed as `ApiError`:

```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // Validation errors
  status: number;
}
```

```typescript
const create = useCreateDocument();

create.mutate(data, {
  onError: (error) => {
    if (error.errors) {
      // Validation errors
      Object.entries(error.errors).forEach(([field, messages]) => {
        setFieldError(field, messages[0]);
      });
    } else {
      toast.error(error.message);
    }
  },
});
```

---

## Environment Configuration

Set `VITE_API_URL` in `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```
