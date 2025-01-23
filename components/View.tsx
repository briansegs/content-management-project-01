"use client";

import React, { useEffect, useState } from "react";
import Ping from "./Ping";
import { client } from "@/sanity/lib/client";
import { STARTUP_VIEWS_QUERY } from "@/sanity/lib/queries";

const View = ({ id }: { id: string }) => {
  const [totalViews, setTotalViews] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the current views count and increment it
    const fetchAndIncrementViews = async () => {
      try {
        // Fetch current views
        const { views } = await client
          .withConfig({ useCdn: false })
          .fetch(STARTUP_VIEWS_QUERY, { id });

        setTotalViews(views);

        // Increment views by calling the API route
        await fetch(`/api/views/${id}`, { method: "POST" });
      } catch (error) {
        console.error("Error fetching or updating views:", error);
      }
    };

    fetchAndIncrementViews();
  }, [id]);

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text">
        <span className="font-black">Views: {totalViews}</span>
      </p>
    </div>
  );
};

export default View;
