"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AntennaExamples from "@/components/antenna-examples"

interface LoadDesignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectExample: (example: any) => void
}

export default function LoadDesignDialog({ open, onOpenChange, onSelectExample }: LoadDesignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Load Example Design</DialogTitle>
          <DialogDescription>
            Select a pre-configured antenna design to load into the studio.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <AntennaExamples onSelectExample={(example) => {
            onSelectExample(example)
            onOpenChange(false) // Close dialog after selecting
          }} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
