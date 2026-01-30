// Complaints API exports
export {
  complaintsService,
  complaintsQueryKeys,
  useComplaints,
  useComplaint,
  useCreateComplaint,
  useUpdateStatus,
  useAddMessage,
  useDeleteComplaint,
} from "./complaintsService";

export type {
  Complaint,
  ComplaintMessage,
  ComplaintCreator,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  CreateComplaintDTO,
  UpdateStatusDTO,
  AddMessageDTO,
  ComplaintFilters,
} from "./types";

export {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  getComplaintPriorityColor,
  getComplaintStatusColor,
  getComplaintCategoryColor,
  formatRelativeTime,
} from "./types";

export {
  createComplaintSchema,
  updateStatusSchema,
  addMessageSchema,
} from "./schemas";

export type {
  CreateComplaintFormData,
  UpdateStatusFormData,
  AddMessageFormData,
} from "./schemas";
