"use client";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import UserCard from "@/components/UserCard";
import { dok } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RightRail() {
  const { demo } = useAuth();
  const [people, setPeople] = useState([]);

  useEffect(() => {
    dok.follows.suggestions().then((d) => setPeople(d.suggestions || [])).catch(() => setPeople([]));
  }, []);

  return (
    <aside className="no-scrollbar sticky top-[5.5rem] hidden max-h-[calc(100vh-7rem)] w-80 shrink-0 space-y-5 overflow-y-auto overscroll-contain xl:block">
      <div className="card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900"><Sparkles size={16} className="text-brand-600" /> Suggested for you</h3>
        <div className="no-scrollbar max-h-[18rem] space-y-3.5 overflow-y-auto overscroll-contain pr-1">
          {people.length === 0
            ? <p className="text-xs text-ink-400">No suggestions yet.</p>
            : people.map((u) => <UserCard key={u._id || u.id} user={u} demo={demo} />)}
        </div>
      </div>

      <p className="px-2 text-xs leading-relaxed text-ink-400">
        Orovion · A trusted network for clinicians, students & patients. © 2026
      </p>
    </aside>
  );
}
