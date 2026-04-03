import React from "react";

const page = () => {
  return (
    <div>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          This is your dashboard. You can manage your account and view your
          activity here.
        </p>
      </div>
      <div className="max-w-lg">
        <p className="text-sm text-muted-foreground">
          This is a placeholder dashboard page. You can customize this page to
          show your users relevant information and actions.
        </p>
      </div>
    </div>
  );
};

export default page;
