
"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { format } from "date-fns";

interface Entry {
  date: string;
  weight: string;
  waist: string;
  fasting: string;
  energy: string;
  notes: string;
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<Entry>({
    date: format(new Date(), "yyyy-MM-dd"),
    weight: "",
    waist: "",
    fasting: "",
    energy: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          console.error("Data is not an array:", data);
          setEntries([]);
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setEntries([]);
      });
  }, []);

  const handleSubmit = async () => {
    const newEntries = [...entries, form];
    setEntries(newEntries);
    setForm({ ...form, weight: "", waist: "", fasting: "", energy: "", notes: "" });
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntries),
    });
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Weight Tracker</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input value={form.date} disabled className="col-span-2" />
        <Input placeholder="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <Input placeholder="Waist (cm)" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
        <Input placeholder="Fasting (e.g., 16:8)" value={form.fasting} onChange={(e) => setForm({ ...form, fasting: e.target.value })} />
        <Input placeholder="Energy (1-5)" value={form.energy} onChange={(e) => setForm({ ...form, energy: e.target.value })} />
        <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2" />
      </div>
      <button onClick={handleSubmit}>Save Entry</button>

      <h2 className="text-xl font-semibold mt-8 mb-2">History</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Weight</th>
            <th className="border p-2">Waist</th>
            <th className="border p-2">Fasting</th>
            <th className="border p-2">Energy</th>
            <th className="border p-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(entries) && entries.length > 0 ? (
            entries.map((entry, idx) => (
              <tr key={idx}>
                <td className="border p-2">{entry.date}</td>
                <td className="border p-2">{entry.weight}</td>
                <td className="border p-2">{entry.waist}</td>
                <td className="border p-2">{entry.fasting}</td>
                <td className="border p-2">{entry.energy}</td>
                <td className="border p-2">{entry.notes}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="border p-2 text-center">No entries yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
