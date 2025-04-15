"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Entry {
  date: string;
  weight: string;
  fasting: string;
  energy: string;
  notes: string;
}

// Create a form schema with zod
const formSchema = z.object({
  date: z.string(),
  weight: z.string().min(1, "Weight is required"),
  fasting: z.string(),
  energy: z.string(),
  notes: z.string(),
});

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  
  // Create form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weight: "",
      fasting: "",
      energy: "",
      notes: "",
    },
  });

  useEffect(() => {
    console.log("Fetching data...");
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          console.log("Received data array:", data.length, "items");
          setEntries(data);
        } else {
          console.log("Received non-array data:", typeof data, data);
          // Initialize with empty array if response is not an array
          setEntries([]);
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setEntries([]);
      });
  }, []);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const newEntry: Entry = {
      date: values.date,
      weight: values.weight,
      fasting: values.fasting,
      energy: values.energy,
      notes: values.notes
    };
    
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    form.reset({
      date: format(new Date(), "yyyy-MM-dd"),
      weight: "",
      fasting: "",
      energy: "",
      notes: "",
    });
    
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntries),
    });
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Weight Tracker</h1>
      <div className="text-sm text-center mb-2 text-gray-500">
        Storage: {process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === "true" ? "Local (per-device)" : "Cloud (shared across devices)"}
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Entry</CardTitle>
          <CardDescription>Track your weight, fasting, and energy levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your weight" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fasting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fasting (e.g., 16:8)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 16:8" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="energy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy (1-5)</FormLabel>
                      <FormControl>
                        <Input placeholder="1-5" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any notes..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full">Save Entry</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={entries.map(e => ({
                date: e.date,
                weight: parseFloat(e.weight) || null
              }))}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Weight</th>
                  <th className="py-3 px-4 text-left">Fasting</th>
                  <th className="py-3 px-4 text-left">Energy</th>
                  <th className="py-3 px-4 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(entries) && entries.length > 0 ? (
                  entries.map((entry, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{entry.date}</td>
                      <td className="py-3 px-4">{entry.weight}</td>
                      <td className="py-3 px-4">{entry.fasting}</td>
                      <td className="py-3 px-4">{entry.energy}</td>
                      <td className="py-3 px-4">{entry.notes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-center">No entries yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
