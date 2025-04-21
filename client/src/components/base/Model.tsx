

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReactNode } from "react"

type DialogDemoProps = {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    modelClassName?: string
    header?: ReactNode
    body?: ReactNode
    footer?: ReactNode
}

export function Model({ open, onOpenChange, header, body, footer, modelClassName = 'sm:max-w-[425px]' }: DialogDemoProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={modelClassName}>
                {header}

                {body}
                {footer}
            </DialogContent>
        </Dialog>
    )
}
