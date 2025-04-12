"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "../supabase";

interface Scam {
  id: string;
  title: string;
  ai_summary: string;
  timestamp: string;
}

function calculateCoins(reportCount: number): number {
  if (reportCount > 15) return reportCount * 20;
  if (reportCount > 5) return reportCount * 15;
  return reportCount * 10;
}

export default function UserProfileCard() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [userReports, setUserReports] = useState<Scam[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("scams")
        .select("id, title, ai_summary, timestamp")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching reports:", error);
        return;
      }

      setUserReports(data);
    };

    if (open) fetchReports();
  }, [open, user?.id]);

  const totalReports = userReports.length;
  const coins = calculateCoins(totalReports);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-8 w-10 h-10 rounded-full bg-gray-800 text-white text-xl flex items-center justify-center shadow hover:bg-gray-700 hover:cursor-pointer"
        aria-label="Profile"
      >
        👤
      </button>

      {open && (
        <div className="fixed top-16 right-8 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg p-5 space-y-4 animate-slide-in z-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Your Profile</h2>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl leading-none hover:cursor-pointer">
              &times;
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Reports submitted:</span> {totalReports}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Coins earned:</span> 🪙 {coins}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Recent Reports</p>
            {userReports.length === 0 ? (
              <p className="text-sm text-gray-400">No reports yet.</p>
            ) : (
              <ul className="space-y-2">
                {userReports.map((report) => (
                  <li key={report.id} className="text-sm text-gray-700 border rounded p-2">
                    <p className="font-medium">{report.title}</p>
                    <p className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">{report.ai_summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
