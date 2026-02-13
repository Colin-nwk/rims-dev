import type { ElementType } from "react";
import {
  User,
  MapPin,
  FileText,
  Heart,
  Home,
  Users,
  CreditCard,
  GraduationCap,
  Eye,
} from "lucide-react";

export interface StaffFormTabConfig {
  id: string;
  title: string;
  icon: ElementType;
}

export const staffFormTabs: StaffFormTabConfig[] = [
  { id: "basic", title: "Basic Info", icon: User },
  { id: "posting", title: "Posting & Origin", icon: MapPin },
  { id: "identity", title: "Identity & Docs", icon: FileText },
  { id: "physical", title: "Physical & Medical", icon: Heart },
  { id: "addresses", title: "Addresses", icon: Home },
  { id: "family", title: "Family & NOK", icon: Users },
  { id: "banking", title: "Banking", icon: CreditCard },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "review", title: "Review", icon: Eye },
];
