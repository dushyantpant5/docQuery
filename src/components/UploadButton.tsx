

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import UploadDropzone from "./UploadDropzone";

const UploadButton = () => {

    const [isopen, setIsOpen] = useState<boolean>(false)
    return (
        <Dialog open={isopen} onOpenChange={(visible) => {
            if (!visible) {
                setIsOpen(visible)
            }
        }} >

            <DialogTrigger onClick={() => setIsOpen(true)} asChild >
                <Button> Upload PDF </Button>
            </DialogTrigger>

            <DialogContent>
                Something Something
                <UploadDropzone />
            </DialogContent>

        </Dialog>
    )
}

export default UploadButton