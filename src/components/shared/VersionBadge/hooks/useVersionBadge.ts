"use client";

import { useState } from "react";

export const useVersionBadge = () => {
  const [open, setOpen] = useState(false);

  return { open, openModal: () => setOpen(true), closeModal: () => setOpen(false) };
};
