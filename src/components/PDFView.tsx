'use client'

import { ChevronDown, ChevronLeft, ChevronRight, Loader2, RotateCw, Search } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { useToast } from "./ui/use-toast"
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
import { useResizeDetector } from "react-resize-detector"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import SimpleBar from 'simplebar-react';

interface PDFViewProps {
    url: string
}

const PDFView = ({ url }: PDFViewProps) => {

    const { toast } = useToast()

    const { width, ref } = useResizeDetector()

    const customPageValidator = z.object({
        page: z.string().refine((inputNumber) => Number(inputNumber) > 0 && Number(inputNumber) <= totalPages!)
    })

    type TCustomPageValidator = z.infer<typeof customPageValidator>

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: "1"
        },
        resolver: zodResolver(customPageValidator)
    })

    const handlePageSubmit = ({ page }: TCustomPageValidator) => {
        setCurrentPage(Number(page))
        setValue("page", String(page))
    }

    const [totalPages, setTotalPages] = useState<number>()
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1)
    const [currentRotation, setCurrentRotation] = useState<number>(0)

    return (
        <div className="w-full  rounded-md bg-white shadow flex flex-col items-center " >
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2 " >
                <div className=" flex items-center gap-1.5 " >
                    <Button variant="ghost" aria-label="previous-button"
                        disabled={currentPage <= 1}
                        onClick={() => {
                            setCurrentPage((prevPage) => (prevPage <= 1 ? prevPage : prevPage - 1))
                            setValue("page", String(currentPage - 1))
                        }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1.5 " >
                        <Input {...register("page")}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit(handlePageSubmit)()
                                }
                            }}

                            className={cn(" w-12 h-8 ", errors.page && "focus-visible:ring-red-400")} />
                        <p className="text-zinc-700 text-sm space-x-1 flex items-center " >
                            <span>/</span>
                            <span>{totalPages ?? <Loader2 className=" h-4 w-4 animate-spin" />}</span>
                        </p>
                    </div>

                    <Button variant="ghost" aria-label="next-button"
                        disabled={currentPage === totalPages || currentPage === undefined}
                        onClick={() => {
                            setCurrentPage((prevPage) => (
                                prevPage === totalPages ? prevPage : prevPage + 1
                            ))
                            setValue("page", String(currentPage + 1))
                        }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                </div>

                <div className="space-x-2" >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild >
                            <Button className="gap-1.5" aria-label="zoom" variant="ghost" >
                                <Search className="h-4 w-4" />
                                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>

                            <DropdownMenuItem onSelect={() => setScale(.5)} >
                                50%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(.75)} >
                                75%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(1)} >
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(1.25)} >
                                125%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(1.5)} >
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setScale(2)} >
                                200%
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button aria-label="rotate 90 degrees" variant="ghost" onClick={() => setCurrentRotation((prevValue) => prevValue + 90)} >
                        <RotateCw className="h-4 w-4" />
                    </Button>



                </div>

            </div>

            <div className="flex-1 w-full max-h-screen " >
                <SimpleBar autoHide={true} className="max-h-[calc(100vh-10rem)]" >
                    <div ref={ref} >
                        <Document loading={
                            <div className="flex justify-center" >
                                <Loader2 className="my-24 h-6 w-6 animate-spin " />
                            </div>
                        }
                            onLoadError={() =>
                                toast({
                                    title: "Error loading PDF",
                                    description: "Please try again",
                                    variant: "destructive"
                                })
                            }

                            onLoadSuccess={({ numPages }) => {
                                setTotalPages(numPages)
                            }}

                            file={url} >
                            <Page width={width ? width : 1} pageNumber={currentPage} scale={scale} rotate={currentRotation} />
                        </Document>
                    </div>
                </SimpleBar>
            </div>

        </div>
    )
}

export default PDFView