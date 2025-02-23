import { SignOutButton } from "@clerk/clerk-react";

export default function Logout() {
  return (
    <SignOutButton>
      <button className="px-4 py-2 absolute top-2 right-2 cursor-pointer z-10 text-white rounded-md">
        Sign Out
      </button>
    </SignOutButton>
  );
}
