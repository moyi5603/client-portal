// Core UI Components - Based on shadcn/ui with CSS variables
// These components replace Ant Design throughout the application

// Layout & Container
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Separator } from './separator';
export { ScrollArea, ScrollBar } from './scroll-area';

// Form Inputs
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';
export { 
  Select, 
  SelectGroup, 
  SelectValue, 
  SelectTrigger, 
  SelectContent, 
  SelectLabel, 
  SelectItem, 
  SelectSeparator 
} from './select';
export { DatePicker, DateRangePicker } from './date-picker';
export { Calendar } from './calendar';

// Buttons & Actions
export { Button, type ButtonProps } from './button';
export { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

// Feedback & Overlays
export { 
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription 
} from './dialog';
export { Alert, AlertTitle, AlertDescription } from './alert';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './popover';

// Display
export { Badge, type BadgeProps } from './badge';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './table';
export { Tree, type TreeNode } from './tree';

// Loading & Empty States
export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar } from './skeleton';
export { Empty, type EmptyVariant } from './empty';

// Navigation
export { Pagination } from './pagination';

// Toast
export { Toaster } from './toaster';
export { useToast, toast } from './use-toast';
