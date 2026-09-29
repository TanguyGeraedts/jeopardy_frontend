"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";

/** Temporary: the backend has no "list my quizzes" endpoint yet, so open one by id. */
export function OpenQuizForm() {
  const router = useRouter();
  const [id, setId] = useState("");

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (id.trim()) router.push(`/creator/quizzes/${id.trim()}`);
        }}
      >
        <h2 className="text-lg font-bold">Open a quiz</h2>
        <TextField label="Quiz id" value={id} onChange={(e) => setId(e.target.value)} placeholder="UUID" />
        <Button type="submit" variant="secondary" disabled={!id.trim()}>
          Open
        </Button>
      </form>
    </Card>
  );
}
