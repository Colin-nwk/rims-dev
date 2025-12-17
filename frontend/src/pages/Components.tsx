import React, { useState } from 'react';
import { 
  Button, Card, Input, Select, TextArea, Badge, Switch, Checkbox, 
  Alert, Accordion, DropdownMenu, Modal, Tabs, TabsList, TabsTrigger, TabsContent,
  SearchableSelect, MultiSelect, PaginatedSelect, Stepper, NumberInput, DatePicker, TimePicker, CurrencyInput, Slider
} from '../components/ui/Components';
import { DataTable } from '../components/ui/DataTable';
import { useToast } from '../App';
import { 
  Bell, CheckCircle, AlertTriangle, Info, MoreVertical, 
  Trash2, Edit2, Copy, ShoppingCart, CreditCard, Box, User, ArrowRight, ArrowLeft, BarChart as BarChartIcon
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

// --- Mock Data for Table ---
type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  date: string;
}

const payments: Payment[] = [
  { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com", date: "2023-01-01" },
  { id: "489e1d42", amount: 125, status: "processing", email: "example@gmail.com", date: "2023-02-14" },
  { id: "129e1d45", amount: 50, status: "success", email: "success@test.com", date: "2023-03-10" },
  { id: "999e1d99", amount: 75, status: "failed", email: "fail@test.com", date: "2023-04-05" },
  { id: "12345678", amount: 200, status: "success", email: "admin@nexus.com", date: "2023-05-20" },
  { id: "87654321", amount: 300, status: "pending", email: "staff@nexus.com", date: "2023-06-15" },
]

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'success' ? 'success' : status === 'failed' ? 'error' : status === 'processing' ? 'default' : 'warning';
        return <Badge variant={variant as any}>{status}</Badge>
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
      accessorKey: "date",
      header: "Date"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu 
            trigger={<button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-navy-700"><MoreVertical className="w-4 h-4" /></button>}
            items={[
                { label: 'Copy Payment ID', onClick: () => navigator.clipboard.writeText(row.original.id) },
                { label: 'View Details', onClick: () => alert(`Viewing ${row.original.id}`) },
                { label: 'Refund Payment', onClick: () => alert('Refunded!'), danger: true },
            ]}
        />
      )
    },
  },
]

// --- Mock Data for Charts ---
const chartData = [
  { name: 'Jan', sales: 4000, revenue: 2400, amt: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398, amt: 2210 },
  { name: 'Mar', sales: 2000, revenue: 9800, amt: 2290 },
  { name: 'Apr', sales: 2780, revenue: 3908, amt: 2000 },
  { name: 'May', sales: 1890, revenue: 4800, amt: 2181 },
  { name: 'Jun', sales: 2390, revenue: 3800, amt: 2500 },
  { name: 'Jul', sales: 3490, revenue: 4300, amt: 2100 },
];

const pieData = [
  { name: 'Engineering', value: 400 },
  { name: 'Marketing', value: 300 },
  { name: 'Sales', value: 300 },
  { name: 'HR', value: 200 },
];

const radarData = [
  { subject: 'Leadership', A: 120, B: 110, fullMark: 150 },
  { subject: 'Technical', A: 98, B: 130, fullMark: 150 },
  { subject: 'Communication', A: 86, B: 130, fullMark: 150 },
  { subject: 'Teamwork', A: 99, B: 100, fullMark: 150 },
  { subject: 'Punctuality', A: 85, B: 90, fullMark: 150 },
  { subject: 'Initiative', A: 65, B: 85, fullMark: 150 },
];

const COLORS = ['#008751', '#f59e0b', '#0ea5e9', '#64748b'];

const Components = () => {
  const { toast } = useToast();
  const [switchState, setSwitchState] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // State for Advanced Inputs
  const [searchValue, setSearchValue] = useState('');
  const [multiValue, setMultiValue] = useState<string[]>([]);
  const [paginatedValue, setPaginatedValue] = useState('');
  
  // State for New Inputs
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState('199.99');
  const [sliderValue, setSliderValue] = useState(50);

  // State for Paginated Form (Stepper)
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { id: 1, title: 'Account Details' },
    { id: 2, title: 'Personal Info' },
    { id: 3, title: 'Review' }
  ];

  const searchOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' },
  ];

  // Mock Async Load
  const loadMockData = async (page: number) => {
    // Simulating fetching 5 items per page
    const start = (page - 1) * 5;
    const allItems = Array.from({length: 25}, (_, i) => ({ value: `item-${i+1}`, label: `Paginated Item ${i+1}` }));
    const pageItems = allItems.slice(start, start + 5);
    return {
        options: pageItems,
        hasMore: start + 5 < allItems.length
    };
  };

  const handleNextStep = () => {
      if (currentStep < steps.length - 1) {
          setCurrentStep(curr => curr + 1);
      } else {
          toast('success', 'Form submitted successfully!', 'Completed');
          setCurrentStep(0);
      }
  };

  const handlePrevStep = () => {
      if (currentStep > 0) {
          setCurrentStep(curr => curr - 1);
      }
  };

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h1 className="text-3xl font-medium text-navy-900 dark:text-white">UI Components</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">A reusable component library for the NCoS Staff Management System.</p>
      </div>

      {/* --- Buttons --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
            <Button isLoading>Loading</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
            <Button><User className="w-4 h-4 mr-2" /> Icon Left</Button>
            <Button variant="outline">Icon Right <ArrowRight className="w-4 h-4 ml-2" /></Button>
            <Button variant="secondary"><ShoppingCart className="w-4 h-4 mr-2" /> Buy Now</Button>
            <Button size="sm" variant="ghost" title="Delete"><Trash2 className="w-4 h-4" /></Button>
            <Button size="md" variant="outline" className="gap-2"><Box className="w-4 h-4" /> Flex Gap</Button>
        </div>
      </section>

      {/* --- Alerts --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Alert variant="info" title="Information">This is an informational alert to notify the user of something neutral.</Alert>
            <Alert variant="success" title="Success">Operation completed successfully. Changes have been saved.</Alert>
            <Alert variant="warning" title="Warning">Please verify your data before proceeding to the next step.</Alert>
            <Alert variant="error" title="Critical Error">Failed to connect to the server. Please try again later.</Alert>
        </div>
      </section>

      {/* --- Toasts --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Toasts</h2>
        <div className="flex flex-wrap gap-4">
            <Button onClick={() => toast('success', 'Your profile has been updated successfully.', 'Changes Saved')}>Success Toast</Button>
            <Button variant="outline" onClick={() => toast('error', 'Could not save file.', 'Upload Failed')}>Error Toast</Button>
            <Button variant="outline" onClick={() => toast('info', 'New version available.', 'System Update')}>Info Toast</Button>
            <Button variant="outline" onClick={() => toast('warning', 'Session expiring soon.', 'Warning')}>Warning Toast</Button>
        </div>
      </section>

      {/* --- Inputs & Forms --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Inputs & Switches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="space-y-4">
                <Input label="Text Input" placeholder="Type something..." />
                <Select label="Native Select">
                    <option>Option 1</option>
                    <option>Option 2</option>
                </Select>
                <TextArea label="Text Area" placeholder="Enter detailed description..." />
            </Card>
            <Card className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-3">Toggles</h4>
                    <div className="space-y-3">
                        <Switch checked={switchState} onChange={setSwitchState} label="Email Notifications" />
                        <Switch checked={true} onChange={() => {}} label="Auto-Save (Fixed)" />
                        <Switch checked={false} onChange={() => {}} disabled label="Disabled Switch" />
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-3">Checkboxes</h4>
                    <div className="space-y-2">
                        <Checkbox label="I agree to the terms and conditions" defaultChecked />
                        <Checkbox label="Subscribe to newsletter" />
                        <Checkbox label="Disabled option" disabled />
                    </div>
                </div>
            </Card>
        </div>
      </section>

      {/* --- Advanced Form Controls (New) --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Advanced Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-4">
                <h3 className="font-medium">Number & Currency</h3>
                <NumberInput 
                    label="Quantity" 
                    value={qty} 
                    onChange={setQty} 
                    min={0} 
                    max={10} 
                />
                <CurrencyInput 
                    label="Price" 
                    value={price} 
                    onChange={setPrice} 
                />
            </Card>
            
            <Card className="space-y-4">
                <h3 className="font-medium">Date & Time</h3>
                <DatePicker label="Select Date" />
                <TimePicker label="Select Time" />
            </Card>

            <Card className="space-y-4">
                <h3 className="font-medium">Sliders</h3>
                <div className="pt-4">
                    <Slider 
                        label="Progress" 
                        value={sliderValue} 
                        onChange={(e) => setSliderValue(Number(e.target.value))} 
                    />
                </div>
                <div className="pt-2">
                    <Slider 
                        label="Volume" 
                        value={75} 
                        disabled
                    />
                </div>
            </Card>
        </div>
      </section>

      {/* --- Advanced Selects --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Advanced Selects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-6">
               <h3 className="font-medium">Searchable Select</h3>
               <SearchableSelect 
                  label="Pick a Fruit"
                  options={searchOptions}
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search fruits..."
               />
               <p className="text-xs text-slate-500">Selected Value: {searchValue || 'None'}</p>
            </Card>

            <Card className="space-y-6">
               <h3 className="font-medium">Multi-Select</h3>
               <MultiSelect 
                  label="Select Favorites"
                  options={searchOptions}
                  value={multiValue}
                  onChange={setMultiValue}
                  placeholder="Select multiple..."
               />
               <p className="text-xs text-slate-500">Selected: {multiValue.join(', ') || 'None'}</p>
            </Card>

            <Card className="space-y-6">
               <h3 className="font-medium">Paginated Select</h3>
               <PaginatedSelect 
                  label="Load Async Data"
                  loadOptions={loadMockData}
                  value={paginatedValue}
                  onChange={setPaginatedValue}
                  placeholder="Scroll to load more..."
               />
               <p className="text-xs text-slate-500">Selected ID: {paginatedValue || 'None'}</p>
            </Card>
        </div>
      </section>

      {/* --- Tabs & Accordion --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Tabs & Layouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <Tabs defaultValue="account">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <div className="space-y-4 py-4">
                            <h4 className="font-medium">Account Settings</h4>
                            <p className="text-sm text-slate-500">Manage your account details and preferences here.</p>
                            <Input label="Username" defaultValue="@nexus_user" />
                            <Button>Save Changes</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="password">
                        <div className="space-y-4 py-4">
                            <h4 className="font-medium">Change Password</h4>
                            <p className="text-sm text-slate-500">Ensure your new password is at least 8 characters long.</p>
                            <Input type="password" label="Current Password" />
                            <Input type="password" label="New Password" />
                            <Button>Update Password</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            <div className="space-y-6">
                <Card>
                    <h4 className="font-medium mb-4">Accordion</h4>
                    <Accordion items={[
                        { title: "What is the NCoS System?", content: "It is a staff management platform for the Nigerian Correctional Service." },
                        { title: "How do I reset my password?", content: "Go to the login page and click 'Forgot Password' to receive a reset link." },
                        { title: "Can I access this on mobile?", content: "Yes, the system is fully responsive and works on mobile devices." }
                    ]} />
                </Card>
            </div>
        </div>
      </section>

      {/* --- Paginated Form (Stepper) --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Paginated Form (Wizard)</h2>
        <div className="max-w-2xl mx-auto">
            <Card>
                <div className="mb-8">
                    <Stepper steps={steps} currentStep={currentStep} />
                </div>
                
                <div className="min-h-[200px] mb-6">
                    {currentStep === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-medium text-navy-900 dark:text-white">Account Details</h3>
                            <Input label="Username" placeholder="Enter username" />
                            <Input label="Email Address" placeholder="Enter email" type="email" />
                        </div>
                    )}
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-medium text-navy-900 dark:text-white">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" placeholder="John" />
                                <Input label="Last Name" placeholder="Doe" />
                            </div>
                            <Input label="Address" placeholder="123 Main St" />
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-medium text-navy-900 dark:text-white">Review & Submit</h3>
                            <div className="bg-slate-50 dark:bg-navy-800 p-4 rounded-lg text-sm space-y-2 text-slate-600 dark:text-slate-300">
                                <p><strong>Username:</strong> johndoe123</p>
                                <p><strong>Email:</strong> john@example.com</p>
                                <p><strong>Name:</strong> John Doe</p>
                                <p><strong>Address:</strong> 123 Main St</p>
                            </div>
                            <Alert variant="info" title="Confirmation">Please verify all details before submitting.</Alert>
                        </div>
                    )}
                </div>

                <div className="flex justify-between border-t border-slate-100 dark:border-navy-800 pt-4">
                    <Button 
                        variant="ghost" 
                        onClick={handlePrevStep} 
                        disabled={currentStep === 0}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleNextStep}>
                        {currentStep === steps.length - 1 ? 'Submit' : 'Next'} 
                        {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
      </section>

      {/* --- Charts --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Charts & Data Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-96 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium text-navy-900 dark:text-white">Revenue Trend</h3>
                    <Select className="w-32 h-8 text-xs">
                        <option>This Year</option>
                        <option>Last Year</option>
                    </Select>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#008751" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#008751" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <RechartsTooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                                cursor={{stroke: '#94a3b8', strokeWidth: 1}}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area type="monotone" dataKey="sales" name="Sales" stroke="#008751" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="h-96 flex flex-col">
                <h3 className="text-base font-medium text-navy-900 dark:text-white mb-4">Monthly Comparisons</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Legend verticalAlign="top" height={36} iconType="circle"/>
                            <Bar dataKey="sales" name="Sales" fill="#008751" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="revenue" name="Revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="h-96 flex flex-col">
                <h3 className="text-base font-medium text-navy-900 dark:text-white mb-4">Staff Distribution</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="h-96 flex flex-col">
                <h3 className="text-base font-medium text-navy-900 dark:text-white mb-4">Performance Metrics</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar
                                name="Employee Average"
                                dataKey="A"
                                stroke="#008751"
                                strokeWidth={2}
                                fill="#008751"
                                fillOpacity={0.3}
                            />
                            <Radar
                                name="Department Target"
                                dataKey="B"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="#f59e0b"
                                fillOpacity={0.3}
                            />
                            <Legend />
                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </section>

      {/* --- Checkout / Summary Card --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Checkout & Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Simple Checkout Form */}
            <Card className="md:col-span-2">
                <h3 className="font-medium text-lg mb-4">Payment Details</h3>
                <div className="space-y-4">
                    <Input label="Cardholder Name" placeholder="John Doe" />
                    <Input label="Card Number" placeholder="0000 0000 0000 0000" icon={<CreditCard className="w-4 h-4" />} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Expiry Date" placeholder="MM/YY" />
                        <Input label="CVC" placeholder="123" />
                    </div>
                    <div className="pt-4">
                        <Button className="w-full">Pay $1,200.00</Button>
                    </div>
                </div>
            </Card>

            {/* Order Summary */}
            <Card className="bg-slate-50 dark:bg-navy-800 border-none">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-navy-900 dark:text-gold-500" /> Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Pro Plan (Yearly)</span>
                        <span className="font-medium">$1,200.00</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Tax (0%)</span>
                        <span className="font-medium">$0.00</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-navy-700 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-navy-900 dark:text-white">
                        <span>Total</span>
                        <span>$1,200.00</span>
                    </div>
                </div>
            </Card>
        </div>
      </section>

      {/* --- Interactive Menus --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Interactive Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-3">Dropdown Menu</h4>
                    <DropdownMenu 
                        trigger={<Button variant="outline">Options <MoreVertical className="w-4 h-4 ml-2" /></Button>}
                        items={[
                            { label: 'Edit Profile', onClick: () => {} },
                            { label: 'Settings', onClick: () => {} },
                            { label: 'Delete Account', danger: true, onClick: () => {} }
                        ]}
                        align="left"
                    />
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-3">Modal Sizes</h4>
                    <div className="flex flex-wrap gap-3">
                        <Button size="sm" onClick={() => setActiveModal('sm')}>Small</Button>
                        <Button size="sm" onClick={() => setActiveModal('default')}>Default</Button>
                        <Button size="sm" onClick={() => setActiveModal('lg')}>Large</Button>
                        <Button size="sm" onClick={() => setActiveModal('xl')}>Extra Large</Button>
                        <Button size="sm" onClick={() => setActiveModal('full')}>Full Width</Button>
                    </div>

                    {/* Small Modal */}
                    <Modal
                        isOpen={activeModal === 'sm'}
                        onClose={() => setActiveModal(null)}
                        title="Small Modal"
                        className="max-w-sm"
                        footer={<Button size="sm" onClick={() => setActiveModal(null)}>Close</Button>}
                    >
                        <p className="text-slate-600 dark:text-slate-300">This is a small modal suitable for simple confirmations or alerts.</p>
                    </Modal>

                    {/* Default Modal */}
                    <Modal
                        isOpen={activeModal === 'default'}
                        onClose={() => setActiveModal(null)}
                        title="Default Modal"
                        // Default max-w-md is applied by component
                        footer={<Button onClick={() => setActiveModal(null)}>Close</Button>}
                    >
                        <p className="text-slate-600 dark:text-slate-300">This is the default size modal, perfect for standard forms and dialogs.</p>
                    </Modal>

                    {/* Large Modal */}
                    <Modal
                        isOpen={activeModal === 'lg'}
                        onClose={() => setActiveModal(null)}
                        title="Large Modal"
                        className="max-w-2xl"
                        footer={<Button onClick={() => setActiveModal(null)}>Close</Button>}
                    >
                        <p className="text-slate-600 dark:text-slate-300 mb-4">This is a large modal (max-w-2xl). It offers more space for complex content.</p>
                        <div className="h-32 bg-slate-100 dark:bg-navy-900 rounded-lg flex items-center justify-center text-slate-400">
                            Placeholder Content
                        </div>
                    </Modal>

                    {/* Extra Large Modal */}
                    <Modal
                        isOpen={activeModal === 'xl'}
                        onClose={() => setActiveModal(null)}
                        title="Extra Large Modal"
                        className="max-w-5xl"
                        footer={<Button onClick={() => setActiveModal(null)}>Close</Button>}
                    >
                        <p className="text-slate-600 dark:text-slate-300 mb-4">This is an extra large modal (max-w-5xl), great for data tables or wide layouts.</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-32 bg-slate-100 dark:bg-navy-900 rounded-lg"></div>
                            <div className="h-32 bg-slate-100 dark:bg-navy-900 rounded-lg"></div>
                            <div className="h-32 bg-slate-100 dark:bg-navy-900 rounded-lg"></div>
                        </div>
                    </Modal>

                    {/* Full Width Modal */}
                    <Modal
                        isOpen={activeModal === 'full'}
                        onClose={() => setActiveModal(null)}
                        title="Full Width Modal"
                        className="w-[95vw] max-w-none h-[80vh]"
                        footer={<Button onClick={() => setActiveModal(null)}>Close</Button>}
                    >
                        <p className="text-slate-600 dark:text-slate-300 mb-4">This modal takes up most of the screen width.</p>
                        <div className="h-full bg-slate-50 dark:bg-navy-900 rounded-lg border-2 border-dashed border-slate-200 dark:border-navy-700 flex items-center justify-center text-slate-400">
                            Extensive Content Area
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
      </section>

      {/* --- Data Table --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-medium border-b border-slate-200 dark:border-navy-800 pb-2">Data Table</h2>
        <DataTable columns={columns} data={payments} searchKey="email" />
      </section>

    </div>
  );
};

export default Components;