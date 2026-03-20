"use client";

import Image from "next/image";

type UserCardProps = {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
};

export default function UserCard({
  name,
  email,
  role,
  avatarUrl,
}: UserCardProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl border shadow-sm"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: "var(--primary)", color: "#fff" }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-xs opacity-60">{email}</span>
        {role && (
          <span
            className="text-[10px] mt-1 px-2 py-0.5 rounded-full w-fit"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--primary)",
            }}
          >
            {role}
          </span>
        )}
      </div>
    </div>
  );
}